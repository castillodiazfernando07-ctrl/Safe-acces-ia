import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Chip } from '../src/components/ui/Chip';
import { Dropdown } from '../src/components/ui/Dropdown';
import { Screen } from '../src/components/ui/Screen';
import { SliderField } from '../src/components/ui/SliderField';
import { Text } from '../src/components/ui/Text';
import { CONDICIONES, SECTORES, TURNOS } from '../src/logic/risk';
import { describeMissing, verifyPhoto } from '../src/services/classifier';
import { useClassifierState } from '../src/services/classifierBridge';
import { useSession } from '../src/store/session';
import { useTheme } from '../src/theme/ThemeProvider';
import { radius, spacing } from '../src/theme/tokens';

type ScanPhase = 'off' | 'camera' | 'loading' | 'error';

/** Pantalla 2: panel operativo (variables del proceso, parámetros y acción principal). */
export default function Panel() {
  const { c } = useTheme();
  const s = useSession();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<ScanPhase>('off');
  const modelsReady = useClassifierState((m) => m.ready);

  const openCamera = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        if (!res.canAskAgain) Linking.openSettings().catch(() => undefined);
        return;
      }
    }
    setPhase('camera');
  };

  const capture = async () => {
    setPhase('loading');
    try {
      // Solo foto en vivo: no hay selector de galería en ninguna parte de la app.
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.4, base64: true, skipProcessing: true });
      if (!photo?.uri) throw new Error('Sin foto');
      const v = await verifyPhoto(photo.uri, photo.base64);
      s.set('scan', { allowed: v.allowed, missing: v.missing, helmet: v.helmet.score, vest: v.vest.score, photoUri: v.photoUri });
      setPhase('off');
    } catch {
      setPhase('error');
    }
  };

  const scan = s.scan;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
        <Image source={require('../assets/logo.png')} style={{ width: 32, height: 32, borderRadius: 8 }} accessibilityLabel="" />
        <View style={{ flex: 1 }}>
          <Text variant="title2" accessibilityRole="header">Panel operativo</Text>
          <Text variant="caption" color="text2">{s.perfil} · {s.usuario}</Text>
        </View>
        <Button title="Salir" variant="text" onPress={() => { s.logout(); router.replace('/'); }} />
      </View>

      <Text variant="overline" color="accent" style={{ marginBottom: spacing.sm }}>Variables del proceso</Text>
      <Card style={{ marginBottom: spacing.lg }}>
        <SliderField label="Trabajadores en el turno" unit="pers." value={s.workers} min={20} max={400} step={10} onChange={(v) => s.set('workers', v)} />
        <SliderField label="Tiempo para revisar a cada persona" unit="s" value={s.secondsPerPerson} min={2} max={30} step={1} onChange={(v) => s.set('secondsPerPerson', v)} />
        <SliderField label="Cumplimiento reciente de EPP" unit="%" value={s.compliance} min={60} max={100} step={1} onChange={(v) => s.set('compliance', v)} />
      </Card>

      <Text variant="overline" color="accent" style={{ marginBottom: spacing.sm }}>Parámetros del acceso</Text>
      <Dropdown label="Turno de trabajo" value={s.turno} options={TURNOS} onChange={(v) => s.set('turno', v)} />
      <Dropdown label="Sector de la planta" value={s.sector} options={SECTORES} onChange={(v) => s.set('sector', v)} />
      <Dropdown label="Condición del acceso" value={s.condicion} options={CONDICIONES} onChange={(v) => s.set('condicion', v)} />

      <Text variant="overline" color="accent" style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>Revisión de EPP con cámara (opcional)</Text>
      <Card style={{ marginBottom: spacing.xl }}>
        {phase === 'camera' || phase === 'loading' ? (
          <>
            <View style={{ height: 240, borderRadius: radius.card, overflow: 'hidden', backgroundColor: c.bg2 }}>
              <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" accessibilityLabel="Vista de la cámara" />
            </View>
            <Text variant="caption" color="text2" align="center" style={{ marginVertical: spacing.sm }}>
              Que se vea de cuerpo entero, con buena luz. Solo foto en vivo.
            </Text>
            <Button title="Analizar foto con IA" onPress={capture} loading={phase === 'loading'} />
            <Button title="Cancelar" variant="text" onPress={() => setPhase('off')} disabled={phase === 'loading'} />
          </>
        ) : scan ? (
          <>
            <Text variant="headline" color={scan.allowed ? 'ok' : 'err'}>
              {scan.allowed ? 'Acceso permitido' : 'Acceso denegado'} · {describeMissing(scan.missing)}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md }}>
              <Chip label={`Casco ${scan.helmet >= 0.8 ? '✔' : '✖'} ${Math.round(scan.helmet * 100)} %`} tone={scan.helmet >= 0.8 ? 'ok' : 'err'} />
              <Chip label={`Chaleco ${scan.vest >= 0.8 ? '✔' : '✖'} ${Math.round(scan.vest * 100)} %`} tone={scan.vest >= 0.8 ? 'ok' : 'err'} />
            </View>
            <Text variant="caption" color="text2" style={{ marginBottom: spacing.md }}>
              Este resultado se suma al cálculo de riesgo.
            </Text>
            <Button title="Repetir revisión con IA" variant="secondary" onPress={openCamera} disabled={!modelsReady} />
            <Button title="Quitar resultado" variant="text" onPress={() => s.set('scan', null)} />
          </>
        ) : (
          <>
            <Text variant="body" color="text2" style={{ marginBottom: spacing.md }}>
              Toma una foto de un trabajador en el acceso: dos modelos de IA revisan casco y chaleco, y el resultado entra al cálculo.
            </Text>
            {phase === 'error' ? (
              <Text variant="caption" color="err" style={{ marginBottom: spacing.sm }}>
                No pudimos leer la foto. Acércate más y prueba con buena luz.
              </Text>
            ) : null}
            <Button title={modelsReady ? 'Revisar EPP con IA' : 'Cargando modelos de IA…'} variant="secondary" onPress={openCamera} disabled={!modelsReady} />
          </>
        )}
      </Card>

      <Button title="Evaluar riesgo con IA" onPress={() => router.push('/resultados')} />
    </Screen>
  );
}
