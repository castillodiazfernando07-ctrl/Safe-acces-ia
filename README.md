# SafeAccess App

Prototipo funcional de una app móvil de control de acceso industrial con IA. Verifica que los trabajadores entren a la faena con **casco y chaleco reflectante** y estima el **riesgo de ingresos sin equipo** según las condiciones del turno. Proyecto del grupo SafeAccess IA (Fernando Castillo, Andrés Acuña y Agustín Brain).

Construida con React Native, Expo SDK 58 y Expo Router (TypeScript estricto). Se ejecuta en **Expo Go**.

## Cómo correrla en Expo Go

1. Instala **Expo Go** en tu celular (App Store o Google Play) y verifica que sea la versión que soporta Expo SDK 58.
2. En tu computador, con Node.js instalado:

```bash
npm install
npx expo start
```

3. Escanea el código QR con la cámara del celular (iPhone) o desde Expo Go (Android). El celular y el computador deben estar en la misma red Wi‑Fi. Si no conectan, usa `npx expo start --tunnel`.
4. Para proyectar en clases: duplica la pantalla del celular (AirPlay, Chromecast/Miracast, o `scrcpy` en Android).

## Las 3 pantallas

1. **Bienvenida y control de acceso** (`app/index.tsx`): nombre, eslogan y logotipo; selección de perfil de operador, usuario y clave (acceso simulado) y botón «Ingresar al panel».
2. **Panel operativo** (`app/panel.tsx`):
   - 3 **sliders**: trabajadores en el turno, tiempo para revisar a cada persona y cumplimiento reciente de EPP.
   - 3 **menús desplegables**: turno de trabajo, sector de la planta y condición del acceso.
   - **Revisión de EPP con cámara (opcional)**: foto en vivo analizada por dos modelos de IA (casco y chaleco).
   - Botón de acción principal: **«Evaluar riesgo con IA»**.
3. **Resultados** (`app/resultados.tsx`): semáforo (verde = operación normal, amarillo = advertencia, rojo = riesgo crítico), métricas estimadas, factor que más pesa y recomendación operativa. Cambia según lo que se ingresó.

## Cómo funciona la IA

- **Detección de EPP (real):** dos modelos binarios de Teachable Machine (casco y chaleco) corren dentro de la app, sin internet, con TensorFlow.js en un WebView oculto. El acceso se permite solo si ambos superan el 80 % (regla AND). Resultados del entrenamiento: chaleco 100 % (30 de 30) y casco 94 % (29 de 31) sobre un dataset de 400 imágenes.
- **Predicción de riesgo (reglas explícitas):** `src/logic/risk.ts`. Calcula la probabilidad de que una persona entre sin EPP a partir del cumplimiento reciente y de la probabilidad de no notar la falta con poco tiempo, ajustada por turno, sector y visibilidad. Los factores son parámetros de ejemplo del prototipo, **no un modelo entrenado con datos de terreno**. Umbrales: verde bajo 1,5 %, amarillo hasta 4 %, rojo desde 4 % (por persona).

## Estructura

```
app/                  rutas (Expo Router): index, panel, resultados
src/
  logic/risk.ts       lógica predictiva
  classifier/         página con TensorFlow.js y los 2 modelos embebidos (generada)
  services/           classifier, classifierBridge
  store/session.ts    estado de la sesión y de las variables
  theme/tokens.ts     paleta, tipografía, espaciado, radios
  components/ui/      Button, Input, Card, Chip, Sheet, SliderField, Dropdown, Text, Screen
assets/               ícono, splash, logo, ilustraciones
```

## Notas

- La primera vez, los modelos tardan unos segundos en cargar; el botón de la cámara dice «Cargando modelos de IA…» hasta que estén listos.
- La app no permite subir fotos de la galería: solo foto en vivo.
- `npm run typecheck` revisa los tipos.
