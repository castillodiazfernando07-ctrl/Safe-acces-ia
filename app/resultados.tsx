import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Screen } from '../src/components/ui/Screen';
import { Text } from '../src/components/ui/Text';
import { evaluate, Level } from '../src/logic/risk';
import { useSession } from '../src/store/session';
import { useTheme } from '../src/theme/ThemeProvider';
import { radius, spacing } from '../src/theme/tokens';

const fmt = (n: number, d = 1) => n.toFixed(d).replace('.', ',');

/** Pantalla 3: resultados y lógica predictiva. */
export default function Resultados() {
  const { c } = useTheme();
  const s = useSession();
  const input = s.input();
  const r = useMemo(() => evaluate(input), [input.workers, input.secondsPerPerson, input.compliance, input.turno, input.sector, input.condicion, input.scan]);

  const tone: Record<Level, string> = { verde: c.ok, amarillo: c.warn, rojo: c.err };
  const t = tone[r.level];
  const metric = (label: string, value: string, unit: string) => (
    <Card style={{ flex: 1, padding: spacing.md }} accessible accessibilityLabel={`${label}: ${value} ${unit}`}>
      <Text variant="caption" color="text2">{label}</Text>
      <Text variant="title1" style={{ marginTop: spacing.xs }}>{value}</Text>
      <Text variant="caption" color="text2">{unit}</Text>
    </Card>
  );

  return (
    <Screen>
      <Button title="← Volver al panel" variant="text" onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />

      <View
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`${r.title}. Probabilidad de ingreso sin equipo ${fmt(r.probabilityPct)} por ciento`}
        style={{ borderRadius: radius.card, borderWidth: 2, borderColor: t, backgroundColor: `${t}26`, padding: spacing.lg, alignItems: 'center', marginVertical: spacing.md }}
      >
        <View style={{ width: 56, height: 56, borderRadius: radius.pill, backgroundColor: t, marginBottom: spacing.md }} />
        <Text variant="title1" align="center" style={{ color: t }}>{r.title}</Text>
        <Text variant="body" align="center" color="text2" style={{ marginTop: spacing.xs }}>
          {r.level === 'verde' ? 'Riesgo bajo de ingresos sin equipo' : r.level === 'amarillo' ? 'Riesgo moderado de ingresos sin equipo' : 'Riesgo alto de ingresos sin equipo'}
        </Text>
      </View>

      <Text variant="overline" color="accent" style={{ marginBottom: spacing.sm }}>Métricas estimadas</Text>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
        {metric('Prob. de ingreso sin EPP', fmt(r.probabilityPct), '% por persona')}
        {metric('Esperados sin EPP', fmt(r.expectedUnprotected, 0), `de ${input.workers} personas`)}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
        {metric('Tiempo total de revisión', fmt(r.totalReviewMinutes, 0), 'minutos en el turno')}
        {metric('Detención de fila', fmt(r.stopMinutes, 0), 'min para corregir')}
      </View>

      <Text variant="overline" color="accent" style={{ marginBottom: spacing.sm }}>Qué pesa más en el riesgo</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        {r.factors.map((f, idx) => (
          <View key={f.name} style={{ marginBottom: idx === r.factors.length - 1 ? 0 : spacing.md }}>
            <Text variant="caption" color={idx === 0 ? 'text' : 'text2'}>{f.name}</Text>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: c.border, marginTop: spacing.xs }}>
              <View style={{ height: 8, borderRadius: 4, width: `${Math.max(4, Math.min(100, f.weight))}%`, backgroundColor: idx === 0 ? t : c.text2 }} />
            </View>
          </View>
        ))}
      </Card>

      {input.scan ? (
        <>
          <Text variant="overline" color="accent" style={{ marginBottom: spacing.sm }}>Revisión con cámara</Text>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text variant="headline" color={input.scan.allowed ? 'ok' : 'err'}>
              {input.scan.allowed ? 'Casco y chaleco detectados' : `Falta ${input.scan.missing.join(' y ')}`}
            </Text>
          </Card>
        </>
      ) : null}

      <Text variant="overline" color="accent" style={{ marginBottom: spacing.sm }}>Recomendación operativa</Text>
      <Card style={{ marginBottom: spacing.lg, borderColor: t }}>
        {r.recommendation.map((line, idx) => (
          <Text key={line} variant="body" style={{ marginBottom: idx === r.recommendation.length - 1 ? 0 : spacing.sm }}>
            {line}
          </Text>
        ))}
      </Card>

      <Text variant="caption" color="text2" style={{ marginBottom: spacing.lg }}>
        Escenario: {input.workers} personas · {input.secondsPerPerson} s por persona · {input.compliance} % de cumplimiento · {input.turno} · {input.sector} · {input.condicion}. Estimación basada en reglas con parámetros de ejemplo; no es un modelo entrenado con datos de terreno.
      </Text>

      <Button title="Ajustar variables y reevaluar" onPress={() => router.back()} />
    </Screen>
  );
}
