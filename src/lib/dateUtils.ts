/**
 * Date utility functions to handle timezone issues consistently across the app
 */

/**
 * Format date for display (avoiding timezone issues)
 * Parses date string as local date to avoid timezone conversion
 * @param dateString - Date string in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @returns Formatted date string or fallback text
 */
export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return 'Date TBD';
  
  // Parse the date as local date to avoid timezone conversion
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString();
}

/**
 * Format date for input field (avoiding timezone issues)
 * Extracts just the date part from datetime string
 * @param dateString - Date string in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @returns Date string in YYYY-MM-DD format for input fields
 */
export function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  return dateString.split('T')[0];
}

/**
 * Format datetime for display (with timezone handling)
 * For timestamps like created_at, updated_at, etc.
 * @param datetimeString - Full datetime string
 * @returns Formatted datetime string
 */
export function formatDateTimeForDisplay(datetimeString: string | null | undefined): string {
  if (!datetimeString) return '';
  
  const date = new Date(datetimeString);
  return date.toLocaleString();
}

/**
 * Format date for display with custom options
 * @param dateString - Date string in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDateCustom(
  dateString: string | null | undefined, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateString) return 'Date TBD';
  
  // Parse the date as local date to avoid timezone conversion
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString(undefined, options);
}

/**
 * Check if a date is in the past
 * @param dateString - Date string in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @returns True if the date is in the past
 */
export function isDateInPast(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  const [year, month, day] = dateString.split('T')[0].split('-');
  const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates
  
  return eventDate < today;
}

/**
 * Get a relative date description (e.g., "Today", "Tomorrow", "In 3 days")
 * @param dateString - Date string in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @returns Relative date description
 */
export function getRelativeDateDescription(dateString: string | null | undefined): string {
  if (!dateString) return 'Date TBD';
  
  const [year, month, day] = dateString.split('T')[0].split('-');
  const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  
  return formatDateForDisplay(dateString);
}
