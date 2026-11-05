/**
 * Puente entre la app y el clasificador que corre dentro de un WebView oculto
 * (ver src/components/ClassifierHost.tsx). Los modelos van embebidos: no necesita internet.
 */
import { create } from 'zustand';

export type RawScores = { helmet: number; vest: number };

type Pending = { resolve: (s: RawScores) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> };

type BridgeState = { ready: boolean; failed: string | null };
export const useClassifierState = create<BridgeState>(() => ({ ready: false, failed: null }));

let sender: ((id: string, base64: string) => void) | null = null;
const pending = new Map<string, Pending>();
let counter = 0;

export function attachSender(fn: ((id: string, base64: string) => void) | null): void {
  sender = fn;
}

export function handleMessage(raw: string): void {
  let msg: { type: string; id?: string; helmet?: number; vest?: number; message?: string };
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }
  if (msg.type === 'ready') {
    useClassifierState.setState({ ready: true, failed: null });
    return;
  }
  if (msg.type === 'error' && msg.id === 'init') {
    useClassifierState.setState({ ready: false, failed: msg.message ?? 'No se pudieron cargar los modelos' });
    return;
  }
  const p = msg.id ? pending.get(msg.id) : undefined;
  if (!p || !msg.id) return;
  clearTimeout(p.timer);
  pending.delete(msg.id);
  if (msg.type === 'result' && typeof msg.helmet === 'number' && typeof msg.vest === 'number') {
    p.resolve({ helmet: msg.helmet, vest: msg.vest });
  } else {
    p.reject(new Error(msg.message ?? 'Error del clasificador'));
  }
}

export function classifyOnDevice(base64: string): Promise<RawScores> {
  return new Promise((resolve, reject) => {
    if (!sender || !useClassifierState.getState().ready) {
      reject(new Error('Los modelos aún se están cargando'));
      return;
    }
    const id = `c${++counter}`;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error('El clasificador tardó demasiado'));
    }, 20000);
    pending.set(id, { resolve, reject, timer });
    sender(id, base64);
  });
}
