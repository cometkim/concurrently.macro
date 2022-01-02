export const isFloat = (num: number) => num % 1 > 0;

export const intersect = (arr1: any[], arr2: any[]) => {
  return arr1.some(item => arr2.includes(item));
}

export const arrayOf = <T>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value];
}
