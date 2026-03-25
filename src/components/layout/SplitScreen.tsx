import type { ReactNode } from 'react';

interface Props {
  west: ReactNode;
  east: ReactNode;
  header?: ReactNode;
}

export default function SplitScreen({ west, east, header }: Props) {
  return (
    <>
      {/* Mobile portrait: header + sectioned layout */}
      <div dir="ltr" className="split-mobile" style={{
        display: 'none',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1450 40%, #501414 60%, #2e0a0a 100%)',
        padding: '0 16px 16px',
        gap: '20px',
      }}>
        {header && <div style={{ width: '100%' }}>{header}</div>}
        <div data-theme="west" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', justifyItems: 'center' }}>
          {west}
        </div>
        <div data-theme="east" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', justifyItems: 'center' }}>
          {east}
        </div>
      </div>

      {/* Mobile landscape: side by side, compact */}
      <div dir="ltr" className="split-landscape" style={{
        display: 'none',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
      }}>
        <div data-theme="west" style={{
          background: 'linear-gradient(135deg, #1a0a2e, #3d1f6d)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '20px 12px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {west}
          </div>
        </div>
        <div data-theme="east" style={{
          background: 'linear-gradient(135deg, #2e0a0a, #6d1f1f)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '20px 12px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {east}
          </div>
        </div>
      </div>

      {/* Desktop: original layout */}
      <div dir="ltr" className="split-desktop" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
      }}>
        <div data-theme="west" style={{
          background: 'linear-gradient(135deg, #1a0a2e, #3d1f6d)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '40px 20px',
        }}>
          {west}
        </div>
        <div data-theme="east" style={{
          background: 'linear-gradient(135deg, #2e0a0a, #6d1f1f)',
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

      <style>{`
        /* Mobile portrait */
        @media (max-width: 639px) {
          .split-mobile { display: flex !important; }
          .split-landscape { display: none !important; }
          .split-desktop { display: none !important; }
        }
        /* Mobile landscape / tablet */
        @media (min-width: 640px) and (max-width: 1024px) {
          .split-mobile { display: none !important; }
          .split-landscape { display: grid !important; }
          .split-desktop { display: none !important; }
        }
        /* Desktop */
        @media (min-width: 1025px) {
          .split-mobile { display: none !important; }
          .split-landscape { display: none !important; }
          .split-desktop { display: grid !important; }
        }
      `}</style>
    </>
  );
}
