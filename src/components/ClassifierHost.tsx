import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { classifierHtml } from '../classifier/classifierHtml';
import { attachSender, handleMessage } from '../services/classifierBridge';

// Tipado laxo: los tipos de react-native-webview chocan con los de React 19.
const Web = WebView as unknown as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<WebView> }>;

/** WebView oculto que carga TensorFlow.js y los dos modelos de Teachable Machine. */
export function ClassifierHost() {
  const ref = useRef<WebView>(null);

  useEffect(() => {
    attachSender((id, base64) => {
      ref.current?.injectJavaScript(`window.__classify(${JSON.stringify(id)}, ${JSON.stringify(base64)}); true;`);
    });
    return () => attachSender(null);
  }, []);

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}>
      <Web
        ref={ref}
        originWhitelist={['*']}
        source={{ html: classifierHtml }}
        javaScriptEnabled
        onMessage={(e: WebViewMessageEvent) => handleMessage(e.nativeEvent.data)}
        cacheEnabled={false}
        androidLayerType="hardware"
      />
    </View>
  );
}
