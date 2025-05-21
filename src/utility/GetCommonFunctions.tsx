export function getGenderJp(genderId: string): string {
  return genderId === '1'
    ? '男性'
    : genderId === '2'
      ? '女性'
      : 'どちらでもない';
}

/**
 * 20,30,40
 */
export function getAgeRangeJp(ageRange: string): string {
  if (ageRange.includes(',')) {
    return ageRange
      .split(',')
      .map((age) => `${age}代`)
      .join(', ');
  }
  return `${ageRange}代`;
}

export function getBcmhzt(): string {
  return 'BCMHZT';
}
