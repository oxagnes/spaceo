import { EN } from '../../config/localization/languages';

const publicUrl = process.env.NX_PUBLIC_URL;

export const LS_KEY = 'prediction_language';

export const fetchLocale = async (locale: string) => {
  const response = await fetch(`${publicUrl}/locales/${locale}.json`);
  const data = await response.json();
  return data;
};

export const getLanguageCodeFromLS = () => {
  try {
    const codeFromStorage = localStorage.getItem(LS_KEY);

    return codeFromStorage || EN.locale;
  } catch {
    return EN.locale;
  }
};