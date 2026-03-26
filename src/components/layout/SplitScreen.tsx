import type { ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

const NATIVE_BOTTOM_PAD = Capacitor.isNativePlatform() ? 48 : 8;

interface Props {
  west: ReactNode;
  east: ReactNode;
  header?: ReactNode;
  nav?: ReactNode;
}

export default function SplitScreen({ west, east, header, nav }: Props) {
  return (
    <>
      {/* Mobile portrait: top bar + header + cards */}
      <div dir="ltr" className="split-mobile" style={{
        display: 'none',
        flexDirection: 'column',
        height: '100dvh',
        background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1450 40%, #501414 60%, #2e0a0a 100%)',
        padding: `6px 10px max(${NATIVE_BOTTOM_PAD}px, env(safe-area-inset-bottom, ${NATIVE_BOTTOM_PAD}px))`,
        overflow: 'hidden',
      }}>
        {/* Top bar: language left, nav right */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginBottom: '2px', flexShrink: 0 }}>
          {nav}
        </div>
        {/* Center group: header + cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', minHeight: 0 }}>
          {header && <div style={{ width: '100%', flexShrink: 0 }}>{header}</div>}
          <div data-theme="west" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', justifyItems: 'center' }}>
            {west}
          </div>
          <div data-theme="east" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', justifyItems: 'center' }}>
            {east}
          </div>
        </div>
      </div>

      {/* Desktop: header on top + side by side with center divider */}
      <div dir="ltr" className="split-desktop" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100dvh',
        background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1450 30%, #501414 70%, #2e0a0a 100%)',
        overflow: 'hidden',
      }}>
        <div style={{ width: '100%', maxWidth: '960px', padding: '16px 20px 0', position: 'relative', flexShrink: 0 }}>
          {header}
          {nav && (
            <div style={{ position: 'absolute', right: '20px', top: '16px', display: 'flex', gap: '6px' }}>
              {nav}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', flex: 1, width: '100%', maxWidth: '960px', minHeight: 0 }}>
          <div data-theme="west" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '40px 20px',
          }}>
            {west}
          </div>
          {/* Center divider */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0',
          }}>
            <div style={{
              width: '1px', flex: 1,
              background: 'linear-gradient(180deg, rgba(155,89,182,0) 0%, rgba(155,89,182,0.4) 30%, rgba(212,175,55,0.3) 50%, rgba(231,76,60,0.4) 70%, rgba(231,76,60,0) 100%)',
            }} />
            <div style={{
              fontSize: '16px', color: 'rgba(212,175,55,0.4)', padding: '12px 0',
              textShadow: '0 0 12px rgba(212,175,55,0.3)',
            }}>✦</div>
            <div style={{
              width: '1px', flex: 1,
              background: 'linear-gradient(180deg, rgba(231,76,60,0) 0%, rgba(231,76,60,0.4) 30%, rgba(212,175,55,0.3) 50%, rgba(155,89,182,0.4) 70%, rgba(155,89,182,0) 100%)',
            }} />
          </div>
          <div data-theme="east" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '40px 20px',
          }}>
            {east}
          </div>
        </div>
      </div>

      <style>{`
        /* Mobile portrait (default) */
        @media (max-width: 639px) {
          .split-mobile { display: flex !important; }
          .split-desktop { display: none !important; }
        }
        /* Desktop */
        @media (min-width: 640px) {
          .split-mobile { display: none !important; }
          .split-desktop { display: flex !important; }
        }
      `}</style>
    </>
  );
}
