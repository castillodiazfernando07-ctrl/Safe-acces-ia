/**
 * Servicio de verificación de casco y chaleco.
 *
 * Usa los dos modelos binarios de Teachable Machine (casco y chaleco) con la regla AND:
 * el acceso se permite solo si ambos superan el umbral.
 *
 * Por defecto la inferencia corre en el dispositivo, sin internet (ver classifierBridge.ts).
 * Si se define EXPO_PUBLIC_CLASSIFIER_URL, se usa en su lugar un servidor que reciba la foto
 * (POST multipart, campo "image") y responda { helmet: number, vest: number } entre 0 y 1.
 */
import { classifyOnDevice } from './classifierBridge';

export type Detection = { score: number; detected: boolean };
export type MissingItem = 'casco' | 'chaleco';

export type Verdict = {
  id: string;
  allowed: boolean;
  helmet: Detection;
  vest: Detection;
  missing: MissingItem[];
  photoUri: string;
  at: number;
};

export const THRESHOLD = 0.8;
const CLASSIFIER_URL = process.env.EXPO_PUBLIC_CLASSIFIER_URL;

function build(photoUri: string, helmet: number, vest: number): Verdict {
  const h = { score: helmet, detected: helmet >= THRESHOLD };
  const v = { score: vest, detected: vest >= THRESHOLD };
  const missing: MissingItem[] = [];
  if (!h.detected) missing.push('casco');
  if (!v.detected) missing.push('chaleco');
  return {
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    allowed: missing.length === 0,
    helmet: h,
    vest: v,
    missing,
    photoUri,
    at: Date.now(),
  };
}

export async function verifyPhoto(photoUri: string, base64?: string): Promise<Verdict> {
  if (!CLASSIFIER_URL) {
    if (!base64) throw new Error('Falta la imagen');
    const { helmet, vest } = await classifyOnDevice(base64);
    return build(photoUri, helmet, vest);
  }
  const form = new FormData();
  form.append('image', { uri: photoUri, name: 'foto.jpg', type: 'image/jpeg' } as unknown as Blob);
  const res = await fetch(CLASSIFIER_URL, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`El clasificador respondió ${res.status}`);
  const data = (await res.json()) as { helmet: number; vest: number };
  if (typeof data.helmet !== 'number' || typeof data.vest !== 'number') {
    throw new Error('Respuesta del clasificador inválida');
  }
  return build(photoUri, data.helmet, data.vest);
}

export function describeMissing(missing: MissingItem[]): string {
  if (missing.length === 0) return 'Casco y chaleco detectados';
  if (missing.length === 2) return 'Faltan casco y chaleco';
  return `Falta ${missing[0]}`;
}
