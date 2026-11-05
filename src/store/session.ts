import { create } from 'zustand';
import type { Condicion, EppScan, RiskInput, Sector, Turno } from '../logic/risk';

export type Perfil = 'Operador de acceso' | 'Jefe de turno' | 'Prevencionista de riesgos';
export const PERFILES: Perfil[] = ['Operador de acceso', 'Jefe de turno', 'Prevencionista de riesgos'];

type State = {
  perfil: Perfil;
  usuario: string;
  workers: number;
  secondsPerPerson: number;
  compliance: number;
  turno: Turno;
  sector: Sector;
  condicion: Condicion;
  scan: EppScan;
  login: (perfil: Perfil, usuario: string) => void;
  logout: () => void;
  set: <K extends keyof State>(key: K, value: State[K]) => void;
  input: () => RiskInput;
};

export const useSession = create<State>((set, get) => ({
  perfil: 'Operador de acceso',
  usuario: '',
  workers: 120,
  secondsPerPerson: 8,
  compliance: 92,
  turno: 'Mañana',
  sector: 'Acceso principal',
  condicion: 'Despejado',
  scan: null,
  login: (perfil, usuario) => set({ perfil, usuario }),
  logout: () => set({ usuario: '', scan: null }),
  set: (key, value) => set({ [key]: value } as Partial<State>),
  input: () => {
    const s = get();
    return { workers: s.workers, secondsPerPerson: s.secondsPerPerson, compliance: s.compliance, turno: s.turno, sector: s.sector, condicion: s.condicion, scan: s.scan };
  },
}));
