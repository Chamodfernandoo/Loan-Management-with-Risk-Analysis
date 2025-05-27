/**
 * Format a date string into a relative time (e.g., "5 minutes ago")
 * or absolute date if older than a week
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date received:', dateString);
      return "Unknown time";
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Just now
    if (diffSecs < 60) {
      return "Just now";
    }
    
    // Minutes
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    // Hours
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    // Days
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    // More than a week, show actual date
    return date.toLocaleDateString() + ' ' + 
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Unknown time";
  }
}

/**
 * Debug utility to analyze a timestamp and how it's being processed
 */
export function analyzeTimestamp(timestamp: string): { 
  original: string, 
  parsed: string, 
  offset: number,
  relative: string 
} {
  const date = new Date(timestamp);
  const now = new Date();
  const offsetMinutes = date.getTimezoneOffset();
  
  return {
    original: timestamp,
    parsed: date.toString(),
    offset: offsetMinutes,
    relative: formatRelativeTime(timestamp)
  };
}