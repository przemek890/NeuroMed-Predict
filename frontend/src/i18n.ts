import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './i18n/en.json';
import plTranslation from './i18n/pl.json';

interface Resources {
  [key: string]: {
    translation: typeof enTranslation;
  };
}

const resources: Resources = {
  en: {
    translation: enTranslation,
  },
  pl: {
    translation: plTranslation,
  },
};

const i18nOptions: InitOptions = {
  resources,
  lng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
};

i18n.use(initReactI18next).init(i18nOptions);

export default i18n;
