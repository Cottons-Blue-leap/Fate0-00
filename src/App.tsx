import { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './routes/HomePage';

import SplashScreen from './components/layout/SplashScreen';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';

// Lazy load fortune pages for code splitting
const TarotPage = lazy(() => import('./routes/TarotPage'));
const HoroscopePage = lazy(() => import('./routes/HoroscopePage'));
const SajuPage = lazy(() => import('./routes/SajuPage'));
const OmikujiPage = lazy(() => import('./routes/OmikujiPage'));
const ProfilePage = lazy(() => import('./routes/ProfilePage'));
const HistoryPage = lazy(() => import('./routes/HistoryPage'));
const SharedReadingPage = lazy(() => import('./routes/SharedReadingPage'));

function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0a2e, #2e0a0a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,0.4)', fontSize: '20px', fontFamily: "'Noto Serif KR', serif",
    }}>
      <div style={{ animation: 'spin 2s linear infinite' }}>✦</div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppRoutes() {
  const { hasProfile } = useProfile();

  return (
    <Suspense fallback={<Loading />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={hasProfile ? <HomePage /> : <Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/tarot" element={hasProfile ? <TarotPage /> : <Navigate to="/profile" replace />} />
          <Route path="/horoscope" element={hasProfile ? <HoroscopePage /> : <Navigate to="/profile" replace />} />
          <Route path="/saju" element={hasProfile ? <SajuPage /> : <Navigate to="/profile" replace />} />
          <Route path="/omikuji" element={hasProfile ? <OmikujiPage /> : <Navigate to="/profile" replace />} />
          <Route path="/history" element={hasProfile ? <HistoryPage /> : <Navigate to="/profile" replace />} />
          <Route path="/share/:id" element={<SharedReadingPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <AuthProvider>
      <ProfileProvider>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
