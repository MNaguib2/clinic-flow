import englishMessages from './errors.en.json';
import arabicMessages from './errors.ar.json';

export type ApiLanguage = 'en' | 'ar';

const messages: Record<ApiLanguage, Record<string, string>> = {
  en: englishMessages,
  ar: arabicMessages,
};

export function getApiLanguage(
  header: string | string[] | undefined,
): ApiLanguage {
  const acceptedLanguages = (
    Array.isArray(header) ? header.join(',') : (header ?? '')
  )
    .split(',')
    .map((language) => language.trim().split(';')[0].toLowerCase());

  return acceptedLanguages.some(
    (language) => language === 'ar' || language.startsWith('ar-'),
  )
    ? 'ar'
    : 'en';
}

export function translateApiMessage(
  message: string,
  language: ApiLanguage,
): string {
  const directTranslation = messages[language][message];
  if (directTranslation) return directTranslation;
  if (language === 'en') return message;

  const rules: Array<[RegExp, string]> = [
    [/^(.+?) must be a string$/, 'validation.string'],
    [/^(.+?) should not be empty$/, 'validation.notEmpty'],
    [/^(.+?) must be an email$/, 'validation.email'],
    [/^(.+?) must be a valid ISO 8601 date string$/, 'validation.date'],
    [
      /^(.+?) must be longer than or equal to (\d+) characters$/,
      'validation.minLength',
    ],
    [
      /^(.+?) must be shorter than or equal to (\d+) characters$/,
      'validation.maxLength',
    ],
    [/^(.+?) must be a boolean value$/, 'validation.boolean'],
    [/^(.+?) must be an integer number$/, 'validation.integer'],
    [/^(.+?) must match .+ regular expression$/, 'validation.format'],
    [/^property (.+) should not exist$/, 'validation.unknownProperty'],
  ];

  for (const [pattern, key] of rules) {
    const match = message.match(pattern);
    const template = messages.ar[key];
    if (!match || !template) continue;
    if (key === 'validation.unknownProperty') {
      const propertyPath = match[1]
        .split('.')
        .map((segment) => {
          const arrayIndex = segment.match(/^(.*)(\[\d+\])$/);
          const propertyName = arrayIndex?.[1] ?? segment;
          const translatedName =
            messages.ar[`field.${propertyName}`] ?? propertyName;
          return `${translatedName}${arrayIndex?.[2] ?? ''}`;
        })
        .join('.');
      return `${propertyPath}: ${template}`;
    }
    return `${match[1]} ${template.replace('{constraint}', match[2] ?? '')}`;
  }

  return message;
}
