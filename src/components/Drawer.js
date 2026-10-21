import React, { useEffect, useRef, useState, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EXIT_MS = 250;

/**
 * Side drawer used for every admin dialog.
 * - Slides in from the end edge (right in LTR, left in RTL)
 * - On desktop it fills the space beside the sidebar: calc(100% - sidebar width),
 *   capped at 1440px (the Layout publishes --sidebar-w, see .drawer-panel in index.css)
 * - Full screen on mobile, with the close icon at the top end
 * - `header` renders in a fixed bar above the body; only the body scrolls
 * - `footer` (form actions) is pinned to the bottom edge, outside the scroll area
 * - Overlay click / Escape / close icon call `onClose` after the exit animation
 */
const Drawer = ({ onClose, header, footer, children }) => {
  const [entered, setEntered] = useState(false);
  const panelRef = useRef(null);
  const closingRef = useRef(false);
  // Callers pass an inline onClose that changes every render; keep it in a ref so
  // the effect below runs once on mount and does not steal focus on each keystroke.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setEntered(false);
    setTimeout(() => onCloseRef.current && onCloseRef.current(), EXIT_MS);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
    };
  }, [requestClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          entered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={requestClose}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`drawer-body drawer-panel absolute inset-y-0 end-0 flex h-full w-full flex-col bg-surface text-fg shadow-lift outline-none transition-transform duration-300 ease-out lg:border-s lg:border-line ${
          entered ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        }`}
      >
        {/* Fixed header: stays put while the body scrolls */}
        <div className="relative flex min-h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-5 py-3 pe-16 sm:px-6 sm:pe-16">
          <div className="min-w-0 flex-1">{header}</div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="btn-ghost absolute end-3 top-3 z-10 !p-2"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="drawer-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-8 pe-[30px] pt-5 sm:px-6 sm:pe-[34px]">{children}</div>
        {footer && (
          <div className="flex h-[var(--drawer-footer-h)] shrink-0 items-center justify-end gap-3 border-t border-line bg-surface px-5 pe-[30px] sm:px-6 sm:pe-[34px]">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
};

export default Drawer;
