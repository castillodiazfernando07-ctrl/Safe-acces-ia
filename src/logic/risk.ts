/**
 * Lógica predictiva de SafeAccess App (basada en reglas, sin entrenamiento).
 *
 * Estima qué tan probable es que una persona entre a la faena sin casco o sin chaleco,
 * según la carga del turno, el tiempo disponible para revisar y las condiciones del acceso.
 * Los factores son parámetros de ejemplo para el prototipo, no datos medidos en terreno.
 */
export type Turno = 'Mañana' | 'Tarde' | 'Noche';
export type Sector = 'Acceso principal' | 'Acceso de maquinaria' | 'Bodega';
export type Condicion = 'Despejado' | 'Lluvia' | 'Poca luz' | 'Polvo';

export const TURNOS: Turno[] = ['Mañana', 'Tarde', 'Noche'];
export const SECTORES: Sector[] = ['Acceso principal', 'Acceso de maquinaria', 'Bodega'];
export const CONDICIONES: Condicion[] = ['Despejado', 'Lluvia', 'Poca luz', 'Polvo'];

const FATIGA: Record<Turno, number> = { Mañana: 1.0, Tarde: 1.1, Noche: 1.25 };
const EXPOSICION: Record<Sector, number> = { 'Acceso principal': 1.0, 'Acceso de maquinaria': 1.2, Bodega: 1.1 };
const VISIBILIDAD: Record<Condicion, number> = { Despejado: 1.0, Lluvia: 1.2, 'Poca luz': 1.3, Polvo: 1.15 };

export type EppScan = { allowed: boolean; missing: ('casco' | 'chaleco')[]; helmet: number; vest: number; photoUri: string } | null;

export type RiskInput = {
  workers: number; // trabajadores que entran en el turno
  secondsPerPerson: number; // segundos disponibles para revisar a cada uno
  compliance: number; // % de trabajadores que llegan con EPP completo (cumplimiento reciente)
  turno: Turno;
  sector: Sector;
  condicion: Condicion;
  scan: EppScan;
};

export type Level = 'verde' | 'amarillo' | 'rojo';
export type Factor = { name: string; weight: number };

export type RiskResult = {
  level: Level;
  title: string;
  probabilityPct: number; // prob. de que una persona entre sin EPP
  expectedUnprotected: number; // trabajadores esperados sin EPP en el turno
  totalReviewMinutes: number;
  stopMinutes: number; // minutos de fila detenida para corregir a quienes sí se detectan
  secondsToGreen: number | null; // segundos por persona para llegar a verde (null si no alcanza con 30 s)
  mainFactor: string;
  factors: Factor[];
  recommendation: string[];
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const GREEN_MAX = 1.5; // % por persona
export const YELLOW_MAX = 4; // % por persona

function probability(i: RiskInput): { p: number; detectMiss: number; arrive: number } {
  const arrive = (100 - i.compliance) / 100; // prob. de llegar sin EPP completo
  const timePressure = clamp((12 - i.secondsPerPerson) / 12, 0, 1);
  const conditions = FATIGA[i.turno] * EXPOSICION[i.sector] * VISIBILIDAD[i.condicion];
  const detectMiss = clamp(0.05 + 0.5 * timePressure * conditions, 0.05, 0.9); // prob. de no notar la falta a simple vista
  return { p: arrive * detectMiss, detectMiss, arrive };
}

export function evaluate(i: RiskInput): RiskResult {
  const { p, detectMiss, arrive } = probability(i);
  let pct = p * 100;
  // Una persona sin equipo detectada con la cámara indica que el problema ya está ocurriendo.
  if (i.scan && !i.scan.allowed) pct += 1.5 * i.scan.missing.length;
  const level: Level = pct < GREEN_MAX ? 'verde' : pct < YELLOW_MAX ? 'amarillo' : 'rojo';

  const expected = (i.workers * pct) / 100;
  const caught = i.workers * arrive * (1 - detectMiss);
  const stopMinutes = (caught * 45) / 60; // 45 s por detención y corrección

  let secondsToGreen: number | null = null;
  for (let s = Math.max(3, Math.ceil(i.secondsPerPerson)); s <= 30; s++) {
    if (probability({ ...i, secondsPerPerson: s }).p * 100 < GREEN_MAX) {
      secondsToGreen = s;
      break;
    }
  }
  if (level === 'verde') secondsToGreen = i.secondsPerPerson;

  const timePressure = clamp((12 - i.secondsPerPerson) / 12, 0, 1);
  const conditionsFactor = FATIGA[i.turno] * EXPOSICION[i.sector] * VISIBILIDAD[i.condicion] - 1;
  const factors: Factor[] = [
    { name: 'Poco cumplimiento de EPP', weight: arrive * 100 },
    { name: 'Poco tiempo por persona', weight: timePressure * 100 },
    { name: 'Condiciones del acceso (turno, sector, visibilidad)', weight: clamp(conditionsFactor, 0, 1) * 100 },
  ].sort((a, b) => b.weight - a.weight);
  const mainFactor = factors[0].name;

  const rec: string[] = [];
  if (level === 'verde') {
    rec.push('Operación dentro de lo normal. Mantén la revisión actual y registra los ingresos del turno.');
  } else if (level === 'amarillo') {
    rec.push('Advertencia: hay probabilidad relevante de que alguien entre sin equipo completo.');
    rec.push('Usa la revisión con IA en los ingresos más apurados y recuerda el uso de EPP antes de la fila.');
  } else {
    rec.push('Riesgo crítico: es muy probable que entren trabajadores sin casco o sin chaleco.');
    rec.push('Verifica con IA a cada persona, abre un segundo punto de acceso o refuerza al equipo de revisión.');
  }
  if (level !== 'verde') {
    if (secondsToGreen !== null) rec.push(`Con al menos ${secondsToGreen} s de revisión por persona el escenario llegaría a verde.`);
    else rec.push('Aun con 30 s por persona no alcanza el verde: hay que mejorar el cumplimiento antes de la entrada.');
  }
  if (mainFactor.startsWith('Poco tiempo')) rec.push('Factor principal: el poco tiempo por persona. Reparte la fila o agrega un puesto.');
  else if (mainFactor.startsWith('Poco cumplimiento')) rec.push('Factor principal: el bajo cumplimiento. Refuerza la capacitación y la entrega de EPP.');
  else rec.push('Factor principal: las condiciones del acceso. Mejora la iluminación y la señalización del punto de revisión.');
  if (i.scan && !i.scan.allowed) rec.push(`La revisión con cámara encontró a alguien sin ${i.scan.missing.join(' y ')}: corrige antes de dejarlo pasar.`);

  return {
    level,
    title: level === 'verde' ? 'OPERACIÓN NORMAL' : level === 'amarillo' ? 'ADVERTENCIA' : 'RIESGO CRÍTICO',
    probabilityPct: pct,
    expectedUnprotected: expected,
    totalReviewMinutes: (i.workers * i.secondsPerPerson) / 60,
    stopMinutes,
    secondsToGreen,
    mainFactor,
    factors,
    recommendation: rec,
  };
}
