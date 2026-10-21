import React from 'react';

/**
 * Building blocks for read-only detail drawers.
 * Empty values (null / undefined / '' / NaN / invalid date) render as a muted
 * dash instead of a blank gap. 0 is a real value and is shown.
 */

export const isEmpty = (v) =>
  v === null ||
  v === undefined ||
  (typeof v === 'string' && v.trim() === '') ||
  (typeof v === 'number' && Number.isNaN(v));

export const formatDate = (value, withTime = false) => {
  if (isEmpty(value)) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

export const initialsOf = (text) =>
  (text || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

/** Top of the drawer: avatar, name, secondary line and status badges. */
export const DetailHeader = ({ title, name, subtitle, badges, avatar = true }) => (
  <header className="flex items-start gap-4 pe-10">
    {avatar && (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-lg font-bold text-brand">
        {initialsOf(name)}
      </span>
    )}
    <div className="min-w-0">
      <h3 className="text-xl font-semibold leading-tight text-fg [overflow-wrap:anywhere]">
        {title && name ? `${title} - ${name}` : title || name}
      </h3>
      {subtitle && <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>}
      {badges && <div className="mt-2 flex flex-wrap items-center gap-2">{badges}</div>}
    </div>
  </header>
);

/** A titled group of fields on a soft card. */
export const DetailSection = ({ title, cols, children }) => (
  <section className="mt-6">
    {title && (
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{title}</h4>
    )}
    <dl
      style={cols ? { '--max-cols': cols } : undefined}
      className="auto-grid auto-grid-sm gap-x-4 gap-y-5 rounded-2xl border border-line bg-surface-2/60 p-4 sm:p-5"
    >
      {children}
    </dl>
  </section>
);

/** One label/value pair. `wide` spans both columns. */
export const DetailField = ({ label, children, wide = false }) => {
  const empty = isEmpty(children) || children === false;
  return (
    <div className={`min-w-0 ${wide ? 'col-span-full' : ''}`}>
      <dt className="mb-1 text-xs font-medium text-muted">{label}</dt>
      <dd className="break-words text-sm font-medium text-fg">
        {empty ? <span className="font-normal text-muted/70">—</span> : children}
      </dd>
    </div>
  );
};

/** Row of small pills, e.g. specializations. */
export const Chips = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg"
        >
          {item}
        </span>
      ))}
    </div>
  );
};
