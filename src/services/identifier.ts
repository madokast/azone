
// 生成属于 date 日期的唯一 ID，格式：YYYYMMDD-HHmmss-随机6位。
// 字典序与时间序一致，可直接用字符串比较排序。
// date 为 null 时取当前时间。
export function generateId(date: Date | null = null): string {
  const d = date || new Date();
  
  const year = d.getFullYear().toString();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
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
