import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Page numbers to show: first, last, current +/- 1, with '...' for gaps
const getPageItems = (currentPage, totalPages) => {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) items.push(`gap-${page}`);
    items.push(page);
  });
  return items;
};

// Shared bottom pagination bar (same look as the Providers page)
const Pagination = ({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange }) => {
  const { isDarkMode } = useTheme();

  if (!totalItems) return null;

  const pages = Math.max(1, totalPages);
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const edgeButton = `relative inline-flex items-center px-2 py-2 border text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
    isDarkMode
      ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700'
      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
  }`;
  const mobileButton = `relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
    isDarkMode
      ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
  }`;

  return (
    <div
      className={`shrink-0 px-4 py-3 flex items-center justify-between border-t transition-all duration-300 sm:px-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={mobileButton}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(pages, currentPage + 1))}
          disabled={currentPage === pages}
          className={`ml-3 ${mobileButton}`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>

        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`rounded-l-md ${edgeButton}`}
          >
            Previous
          </button>

          {getPageItems(currentPage, pages).map((item) =>
            typeof item === 'string' ? (
              <span
                key={item}
                className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-500'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                  currentPage === item
                    ? 'z-10 bg-custom-btnBg/10 border-custom-btnBg text-custom-btnBg'
                    : isDarkMode
                      ? 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(Math.min(pages, currentPage + 1))}
            disabled={currentPage === pages}
            className={`rounded-r-md ${edgeButton}`}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
