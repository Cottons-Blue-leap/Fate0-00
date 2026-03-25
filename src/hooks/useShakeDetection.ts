import { useEffect, useRef, useState, useCallback } from 'react';

const SHAKE_THRESHOLD = 25;
const SHAKE_INTERVAL = 300;
const SETTING_KEY = 'fate0_shake_enabled';

export function isShakeEnabled(): boolean {
  return localStorage.getItem(SETTING_KEY) !== 'false';
}

export function setShakeEnabled(enabled: boolean): void {
  localStorage.setItem(SETTING_KEY, enabled ? 'true' : 'false');
}

export function useShakeDetection(onShake: () => void, active: boolean) {
  const lastShake = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);

  const requestPermission = useCallback(async () => {
    setPermissionAsked(true);

    // iOS requires explicit permission request
    const DME = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (DME?.requestPermission) {
      try {
        const result = await DME.requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
          return true;
        }
      } catch {
        return false;
      }
      return false;
    }

    // Android/other — permission granted by default
    if ('DeviceMotionEvent' in window) {
      setPermissionGranted(true);
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    if (!active || !permissionGranted || !isShakeEnabled()) return;

    const handler = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel?.x || !accel.y || !accel.z) return;

      const dx = Math.abs(accel.x - lastAccel.current.x);
      const dy = Math.abs(accel.y - lastAccel.current.y);
      const dz = Math.abs(accel.z - lastAccel.current.z);

      lastAccel.current = { x: accel.x, y: accel.y, z: accel.z };

      if (dx + dy + dz > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShake.current > SHAKE_INTERVAL) {
          lastShake.current = now;
          onShake();
        }
      }
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [active, permissionGranted, onShake]);

  const isAvailable = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;

  return { requestPermission, permissionGranted, permissionAsked, isAvailable };
}
