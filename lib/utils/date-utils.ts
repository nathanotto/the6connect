/**
 * Date utility functions
 */

/**
 * Get relative time string for aging display
 * Returns "Today", "Yesterday", or "X days ago"
 */
export function getRelativeTimeString(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);

  // Reset hours to compare just dates
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDate = new Date(then.getFullYear(), then.getMonth(), then.getDate());

  const diffTime = nowDate.getTime() - thenDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffDays} days ago`;
  }
}
