import React, { useRef, useState } from 'react';

const nameOf = (item) => (typeof item === 'string' ? item : item?.name) || '';

const PILL =
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';

/**
 * Compact specialization list for table cells:
 *   [Technology] [+2 more]
 * Hovering (or focusing) "+N more" lists the hidden names in a tooltip.
 * The tooltip is position: fixed so the table's scroll container can't clip it.
 */
const SpecializationTags = ({ items, visible = 1, emptyLabel = 'No specializations' }) => {
  const names = (items || []).map(nameOf).filter(Boolean);
  const moreRef = useRef(null);
  const [tip, setTip] = useState(null);

  if (names.length === 0) {
    return <span className="text-xs text-muted">{emptyLabel}</span>;
  }

  const shown = names.slice(0, visible);
  const hidden = names.slice(visible);

  const openTip = () => {
    const rect = moreRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedHeight = 28 + hidden.length * 24;
    const below = rect.bottom + 8 + estimatedHeight < window.innerHeight;
    setTip({
      left: rect.left + rect.width / 2,
      top: below ? rect.bottom + 8 : rect.top - 8,
      below,
    });
  };
  const closeTip = () => setTip(null);

  return (
    <div className="flex items-center gap-1.5">
      {shown.map((name) => (
        <span key={name} className={PILL}>
          {name}
        </span>
      ))}

      {hidden.length > 0 && (
        <>
          <span
            ref={moreRef}
            tabIndex={0}
            onMouseEnter={openTip}
            onMouseLeave={closeTip}
            onFocus={openTip}
            onBlur={closeTip}
            aria-label={`${hidden.length} more: ${hidden.join(', ')}`}
            className="inline-flex cursor-default items-center rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted whitespace-nowrap outline-none transition hover:border-brand/50 hover:text-fg focus-visible:ring-2 focus-visible:ring-brand"
          >
            +{hidden.length} more
          </span>

          {tip && (
            <div
              role="tooltip"
              style={{
                position: 'fixed',
                left: tip.left,
                top: tip.top,
                transform: `translate(-50%, ${tip.below ? '0' : '-100%'})`,
              }}
              className="pointer-events-none z-[60] max-w-xs animate-pop-in rounded-xl border border-line bg-surface p-2.5 shadow-lift"
            >
              <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                More specializations
              </p>
              <ul className="space-y-0.5">
                {hidden.map((name) => (
                  <li key={name} className="rounded-md px-1 py-0.5 text-xs font-medium text-fg">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SpecializationTags;
