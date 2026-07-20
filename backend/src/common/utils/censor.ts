// Bộ lọc từ ngữ độc hại (FR2): từ cấm bị thay bằng *** trước khi hiển thị công khai.
const BANNED_WORDS = [
  // tiếng Việt
  'cặc',
  'cức',
  'đéo',
  'địt',
  'đụ',
  'lồn',
  'vãi lồn',
  'óc chó',
  'đĩ',
  'vcl',
  'vkl',
  'clm',
  'cmm',
  'đmm',
  'đm',
  // tiếng Anh
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'dick',
  'cunt',
];

const escapeRegex = (word: string) =>
  word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pattern = new RegExp(
  BANNED_WORDS.map(escapeRegex).join('|'),
  'giu',
);

export function censor(text: string): string {
  return text.replace(pattern, '***');
}
