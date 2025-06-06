export function getGenderJp(genderId: string): string {
  return genderId === '1'
    ? '男性'
    : genderId === '2'
      ? '女性'
      : 'どちらでもない';
}

/**
 * 20,30,40という文字列を20代, 30代, 40代という文字列に変換する
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

/**
 * BCMHZTという文字列だけを返す
 * @returns
 */
export function getBcmhzt(): string {
  return 'BCMHZT';
}

/**
 * urlありの文字列のurl部分をリンクに変換する
 * @param string
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

/**
 * 2025-05-26 00:00:00という日時の文字列の年月日の部分だけ返す
 * @param datetime 2025-05-26 00:00:00のような文字列
 * @returns
 */
export function getDateOnly(datetime: string): string {
  if (!datetime) return '';
  const [date] = datetime.split(' ');
  return date;
}

/**
 * 年齢から何代を返す
 * (例: 25歳なら20代, 35歳なら30代, 45歳なら40代)
 * 20-25 20代前半
 * 26-29 20代後半
 * 30-35 30代前半
 * 36-39 30代後半
 * 40-45 40代前半
 * 46-49 40代後半
 * 50-55 50代前半
 * 56-59 50代後半
 * 60-65 60代前半
 * 66-69 60代後半
 * 70-75 70代前半
 * 76-79 70代後半
 * 80-85 80代前半
 * 86-89 80代後半
 * 90-95 90代前半
 * 96-99 90代後半
 */
export function chageAgeRange(age: number | null | undefined): string {
  if (age == null) {
    return '年齢不明';
  }
  if (age >= 20 && age <= 25) {
    return '20代前半';
  } else if (age >= 26 && age <= 29) {
    return '20代後半';
  } else if (age >= 30 && age <= 35) {
    return '30代前半';
  } else if (age >= 36 && age <= 39) {
    return '30代後半';
  } else if (age >= 40 && age <= 45) {
    return '40代前半';
  } else if (age >= 46 && age <= 49) {
    return '40代後半';
  } else if (age >= 50 && age <= 55) {
    return '50代前半';
  } else if (age >= 56 && age <= 59) {
    return '50代後半';
  } else if (age >= 60 && age <= 65) {
    return '60代前半';
  } else if (age >= 66 && age <= 69) {
    return '60代後半';
  } else if (age >= 70 && age <= 75) {
    return '70代前半';
  } else if (age >= 76 && age <= 79) {
    return '70代後半';
  } else if (age >= 80 && age <= 85) {
    return '80代前半';
  } else if (age >= 86 && age <= 89) {
    return '80代後半';
  } else if (age >= 90 && age <= 95) {
    return '90代前半';
  } else if (age >= 96 && age <= 99) {
    return '90代後半';
  } else {
    return '不明';
  }
}

/**
 * UTCからJSTなどのタイムゾーンに変換する
 * @param utcDate 例: "2025-06-05 20:26:53"
 * @param timeZone タイムゾーン名 (例: "Asia/Tokyo")
 *
 *
 * JST: Asia/Tokyo (日本標準時 UTC+9)
 * CET: Europe/Berlin ドイツ標準時（UTC+1）
 * CET: Europe/Paris フランス標準時（UTC+1）
 * CST: Asia/Shanghai 中国標準時（UTC+8）
 * GMT: Europe/London イギリス標準時（UTC+0）
 * EST: America/New_York アメリカ東部標準時（UTC-5）
 * など
 */
export function convertUtcToTimeZone(
  utcDate: string, //"2025-06-05 20:26:53"
  timeZone: string // JST
): string {
  // 文字列を "YYYY-MM-DD HH:mm:ss" から "YYYY-MM-DDTHH:mm:ssZ" に変換してUTCとして解釈
  const utcDateString = utcDate.replace(' ', 'T') + 'Z';
  const date = new Date(utcDateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    hour12: false,
    timeZone,
  };
  let formatted = date
    .toLocaleString('ja-JP', options)
    .replace(/\//g, '-')
    .replace(
      /(\d{4})-(\d{2})-(\d{2})\s*(\d{2}):(\d{2}):(\d{2})/,
      '$1-$2-$3 $4:$5'
    );
  // Safari等で区切りが異なる場合の対応
  return formatted.replace(' ', 'T').replace('T', ' ');
}
/**
 * UTCからJSTに変換する
 * @param utcDate 例: "2025-06-05 20:26:53"
 * @returns JSTの日時文字列
 */
