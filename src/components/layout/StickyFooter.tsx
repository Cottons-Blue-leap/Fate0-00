import type { ReactNode } from 'react';

/**
 * Sticky footer for action buttons — stays visible at the bottom
 * of the scroll area even when content overflows the viewport.
 * Uses position: sticky so it scrolls naturally when content is short.
 */
export default function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky-footer">
      <div className="sticky-footer-fade" />
      <div className="sticky-footer-content">
        {children}
      </div>
    </div>
  );
}
