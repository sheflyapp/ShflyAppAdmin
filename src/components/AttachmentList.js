import React, { useState } from 'react';
import { ArrowTopRightOnSquareIcon, DocumentIcon } from '@heroicons/react/24/outline';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i;

const urlOf = (a) => (typeof a === 'string' ? a : a?.url || a?.cloudinaryUrl || a?.path || '');

const isImageUrl = (url) => IMAGE_EXT.test(url) || /\/image\/upload\//.test(url);

const fileName = (url) => {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || url);
  } catch (e) {
    return url;
  }
};

/** Image attachments get a real preview; everything shows its link. */
const AttachmentList = ({ attachments }) => {
  const [broken, setBroken] = useState({});
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {attachments.map((a, i) => {
        const url = urlOf(a);
        if (!url) return null;
        const showImage = isImageUrl(url) && !broken[i];
        const label = (typeof a === 'object' && a?.description) || fileName(url);
        return (
          <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
            {showImage ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="block bg-surface-2">
                <img
                  src={url}
                  alt={label}
                  loading="lazy"
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                  className="h-44 w-full object-contain"
                />
              </a>
            ) : (
              <div className="flex h-24 items-center justify-center bg-surface-2 text-muted">
                <DocumentIcon className="h-10 w-10" />
              </div>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
              className="flex items-center gap-2 px-3 py-2 text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              <span className="min-w-0 flex-1 truncate">{url}</span>
              <ArrowTopRightOnSquareIcon className="h-4 w-4 shrink-0" />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentList;
