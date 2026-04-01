import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'
import { setUseKoreanManseryeok } from '@fate0/shared'

// Use Korean manseryeok when user's locale/timezone is Korea
const isKorea = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Seoul'
  || navigator.language.startsWith('ko');
setUseKoreanManseryeok(isKorea);

// Capacitor fullscreen mode
import { Capacitor } from '@capacitor/core'
if (Capacitor.isNativePlatform()) {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#00000000' }).catch(() => {});
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA (web only)
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
