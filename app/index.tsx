import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { Screen } from '../src/components/ui/Screen';
import { Text } from '../src/components/ui/Text';
import { PERFILES, Perfil, useSession } from '../src/store/session';
import { useTheme } from '../src/theme/ThemeProvider';
import { radius, spacing } from '../src/theme/tokens';

/** Pantalla 1: bienvenida y control de acceso (autenticación simulada). */
export default function Bienvenida() {
  const { c } = useTheme();
  const login = useSession((s) => s.login);
  const [perfil, setPerfil] = useState<Perfil>('Operador de acceso');
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const ingresar = () => {
    if (usuario.trim().length < 2 || clave.length < 1) {
      setError('Escribe tu usuario y tu clave para ingresar.');
      return;
    }
    setError('');
    login(perfil, usuario.trim());
    router.push('/panel');
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
        <Image source={require('../assets/logo.png')} style={{ width: 96, height: 96, borderRadius: radius.sheet }} accessibilityLabel="Logo de SafeAccess" />
        <Text variant="display" style={{ marginTop: spacing.md }} accessibilityRole="header">SafeAccess</Text>
        <Text variant="body" color="accent" align="center" style={{ marginTop: spacing.xs }}>
          Casco y chaleco verificados en un segundo
        </Text>
        <Text variant="caption" color="text2" align="center" style={{ marginTop: spacing.sm }}>
          Control de acceso con IA para faenas industriales
        </Text>
      </View>

      <Text variant="overline" color="accent" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Perfil de operador</Text>
      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        {PERFILES.map((p) => (
          <Pressable
            key={p}
            accessibilityRole="radio"
            accessibilityState={{ selected: perfil === p }}
            onPress={() => setPerfil(p)}
            style={{ minHeight: 44, borderRadius: radius.button, borderWidth: perfil === p ? 2 : 1, borderColor: perfil === p ? c.accent : c.border, backgroundColor: c.card, paddingHorizontal: spacing.lg, justifyContent: 'center' }}
          >
            <Text variant="body" color={perfil === p ? 'accent' : 'text'}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Usuario" value={usuario} onChangeText={setUsuario} autoCapitalize="none" autoComplete="username" placeholder="Ej.: crojas" />
      <Input label="Clave" value={clave} onChangeText={setClave} secureTextEntry placeholder="Cualquier clave (acceso simulado)" error={error} />
      <Button title="Ingresar al panel" onPress={ingresar} />
      <Text variant="caption" color="text2" align="center" style={{ marginTop: spacing.md }}>
        Acceso de demostración: no se valida contra ningún servidor.
      </Text>
    </Screen>
  );
}
