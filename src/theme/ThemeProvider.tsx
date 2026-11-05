import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors, Palette } from './tokens';

type ThemeContextValue = { scheme: 'dark' | 'light'; c: Palette };
const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tema oscuro por defecto (marca). Si el teléfono está en modo claro, usa los tokens claros. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const value = useMemo<ThemeContextValue>(() => {
    const scheme: 'dark' | 'light' = system === 'light' ? 'light' : 'dark';
    return { scheme, c: colors[scheme] };
  }, [system]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
