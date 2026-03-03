
export function generateId(now: Date|null = null): string {
  now = now || new Date();
  
  // Format date and time
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Generate random 6-character alphanumeric string
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}-${randomPart}`;
}

export function extractDate(id: string): Date {
  const [datePart, timePart, _] = id.split('-')
  const year = parseInt(datePart.slice(0, 4))
  const month = parseInt(datePart.slice(4, 6)) - 1 // Month is 0-indexed
  const day = parseInt(datePart.slice(6, 8))
  const hours = parseInt(timePart.slice(0, 2))
  const minutes = parseInt(timePart.slice(2, 4))
  const seconds = parseInt(timePart.slice(4, 6))
  return new Date(year, month, day, hours, minutes, seconds)
}

export function extractYYYYMMDD(id: string): { yyyy: string, mm: string, dd: string } {
  const dataPart = id.split('-')[0]
  const yyyy = dataPart.slice(0, 4)
  const mm = dataPart.slice(4, 6)
  const dd = dataPart.slice(6, 8)
  return { yyyy, mm, dd }
}
