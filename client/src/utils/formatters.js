import { isToday, isYesterday, isSameYear, format } from 'date-fns';

export function formatChatTimestamp(dateInput) {
  if (!dateInput) return '';
  // Ensure UTC string parses accurately
  const dateStr = typeof dateInput === 'string' && !dateInput.endsWith('Z') && !dateInput.includes('+')
    ? dateInput.replace(' ', 'T') + 'Z'
    : dateInput;
    
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  if (isSameYear(date, new Date())) {
    return format(date, "MMM d 'at' h:mm a");
  }
  return format(date, "MMM d, yyyy 'at' h:mm a");
}
