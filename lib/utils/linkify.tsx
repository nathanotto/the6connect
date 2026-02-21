import React from 'react';

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

/**
 * Parses text and wraps URLs in <a> tags that open in a new tab.
 * Safe to use in any text content — plain text segments are left as-is.
 */
export function linkify(text: string, linkClassName?: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Strip trailing punctuation that's unlikely to be part of the URL
    const url = match[0].replace(/[.,;:!?)\]]+$/, '');

    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName ?? 'underline hover:opacity-75 break-all'}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? text : <>{parts}</>;
}
