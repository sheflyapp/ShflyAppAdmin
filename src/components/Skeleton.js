import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Single pulsing placeholder block
export const Bone = ({ className = '', style }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`animate-pulse rounded ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      } ${className}`}
      style={style}
    />
  );
};

const useCardClass = () => {
  const { isDarkMode } = useTheme();
  return `rounded-lg shadow-lg ${
    isDarkMode
      ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50'
      : 'bg-white shadow-gray-200/50'
  }`;
};

// Table-like list: optional header bar plus `rows` rows of `columns` cells.
// The first cell mimics avatar + two text lines, the last cell mimics action icons.
export const TableSkeleton = ({ columns = 6, rows = 8, header = true }) => {
  const { isDarkMode } = useTheme();
  const divider = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

  return (
    <div className="overflow-hidden">
      {header && (
        <div
          className={`grid gap-6 px-6 py-3 ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}
          style={gridStyle}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Bone key={i} className="h-3 w-20" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={`grid gap-6 items-center px-6 py-4 border-t ${divider}`}
          style={gridStyle}
        >
          {Array.from({ length: columns }).map((_, c) => {
            if (c === 0) {
              return (
                <div key={c} className="flex items-center gap-3">
                  <Bone className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Bone className="h-3 w-3/4" />
                    <Bone className="h-3 w-1/2" />
                  </div>
                </div>
              );
            }
            if (c === columns - 1) {
              return (
                <div key={c} className="flex gap-2">
                  <Bone className="h-5 w-5" />
                  <Bone className="h-5 w-5" />
                  <Bone className="h-5 w-5" />
                </div>
              );
            }
            return <Bone key={c} className="h-4 w-3/4" />;
          })}
        </div>
      ))}
    </div>
  );
};

// Simple stacked rows for compact lists (e.g. static content list)
export const RowsSkeleton = ({ rows = 4 }) => {
  const { isDarkMode } = useTheme();
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-6 py-4 border-t first:border-t-0 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-1/3" />
            <Bone className="h-3 w-2/3" />
          </div>
          <div className="flex gap-2 ml-6">
            <Bone className="h-6 w-6" />
            <Bone className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCardSkeleton = () => {
  const card = useCardClass();
  return (
    <div className={`${card} px-3 py-2 min-w-[140px]`}>
      <div className="flex items-center">
        <Bone className="h-8 w-8 rounded-lg flex-shrink-0" />
        <div className="ml-3 flex-1 space-y-2">
          <Bone className="h-3 w-20" />
          <Bone className="h-4 w-10" />
        </div>
      </div>
    </div>
  );
};

// Whole management page: header + controls, stat cards, table card.
export const ListPageSkeleton = ({
  selects = 2,
  toggle = true,
  addButton = true,
  stats = 4,
  columns = 7,
  rows = 12
}) => {
  const card = useCardClass();
  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="mb-6 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: stats }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <Bone className="h-10 w-full sm:w-56 rounded-lg" />
          {Array.from({ length: selects }).map((_, i) => (
            <Bone key={i} className="h-10 w-full sm:w-36 rounded-lg" />
          ))}
          {toggle && <Bone className="h-10 w-full sm:w-28 rounded-lg" />}
          {addButton && <Bone className="h-10 w-full sm:w-24 rounded-md" />}
        </div>
      </div>

      <div className={`${card} flex flex-col flex-1 min-h-0 overflow-hidden`}>
        <div className="flex-1 min-h-0 overflow-hidden">
          <TableSkeleton columns={columns} rows={rows} />
        </div>
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-transparent">
          <Bone className="h-4 w-48" />
          <Bone className="h-9 w-64 rounded-md" />
        </div>
      </div>
    </div>
  );
};

// Dashboard: header, stat cards, two chart cards, recent list.
export const DashboardSkeleton = () => {
  const card = useCardClass();
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`${card} p-4`}>
            <div className="flex items-center">
              <Bone className="h-9 w-9 rounded-md flex-shrink-0" />
              <div className="ml-3 flex-1 space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-5 w-12" />
              </div>
            </div>
            <Bone className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className={`${card} p-6`}>
            <Bone className="h-5 w-40 mb-6" />
            <div className="flex items-end gap-3 h-[300px]">
              {[60, 85, 45, 95, 70, 55, 80].map((h, b) => (
                <Bone key={b} className="flex-1" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={card}>
        <div className="px-6 py-4">
          <Bone className="h-5 w-44" />
        </div>
        <TableSkeleton columns={5} rows={5} header={false} />
      </div>
    </div>
  );
};

// App shell shown while the session is being checked: sidebar + page skeleton.
export const AppSkeleton = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <aside
        className={`hidden lg:block w-64 flex-shrink-0 p-4 space-y-3 border-r ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <Bone className="h-8 w-40 mb-6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Bone key={i} className="h-10 w-full rounded-lg" />
        ))}
      </aside>
      <div className="flex-1 min-w-0">
        <div
          className={`h-16 flex items-center justify-end gap-3 px-6 border-b ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <Bone className="h-9 w-9 rounded-lg" />
          <Bone className="h-9 w-9 rounded-lg" />
          <Bone className="h-9 w-9 rounded-full" />
        </div>
        <main className="p-6">
          <ListPageSkeleton />
        </main>
      </div>
    </div>
  );
};
