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

/**
 *
 * @param url
 * @returns
 */
export function convertFormattedText(text: string): string {
  /** chage url */
  text = text.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
  /** change \n to <br /> */
  text = text.replace(/\n/g, '<br />');
  return text;
}
