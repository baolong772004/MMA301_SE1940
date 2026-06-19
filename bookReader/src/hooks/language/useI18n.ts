import i18next from 'i18next';

import { SupportedLanguages } from './schema';

const changeLanguage = (lang: SupportedLanguages) => {
  void i18next.changeLanguage(lang);
};

const toggleLanguage = () => {
  let nextLang = SupportedLanguages.EN_EN;
  if (i18next.language === (SupportedLanguages.EN_EN as string)) {
    nextLang = SupportedLanguages.VI_VN;
  } else if (i18next.language === (SupportedLanguages.VI_VN as string)) {
    nextLang = SupportedLanguages.FR_FR;
  }
  void i18next.changeLanguage(nextLang);
};

export const useI18n = () => {
  return { changeLanguage, toggleLanguage };
};
