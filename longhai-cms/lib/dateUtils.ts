/**
 * Format date to dd/mm/yy HH:mm format (24h)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`; // 24h format
};

/**
 * Format date to dd/mm/yyyy format (without time)
 */
export const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format time to HH:mm format (24h)
 */
export const formatTimeOnly = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Convert date to datetime-local input format (YYYY-MM-DDTHH:mm, 24h)
 * Preserves the original timezone to avoid time jumping
 */
export const toDateTimeLocal = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Get local timezone offset in minutes
  const offset = date.getTimezoneOffset();
  
  // Adjust the date to local timezone
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  
  const year = localDate.getFullYear();
  const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
  const day = localDate.getDate().toString().padStart(2, '0');
  const hours = localDate.getHours().toString().padStart(2, '0');
  const minutes = localDate.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}; 