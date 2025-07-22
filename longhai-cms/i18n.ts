// lib/i18n.ts
import Cookies from 'universal-cookie';
import vi from '@/public/locales/vi.json';
import en from '@/public/locales/en.json';
import ae from '@/public/locales/ae.json';
import da from '@/public/locales/da.json';
import de from '@/public/locales/de.json';
import el from '@/public/locales/el.json';
import es from '@/public/locales/es.json';
import fr from '@/public/locales/fr.json';
import hu from '@/public/locales/hu.json';
import it from '@/public/locales/it.json';
import ja from '@/public/locales/ja.json';
import pl from '@/public/locales/pl.json';
import pt from '@/public/locales/pt.json';
import ru from '@/public/locales/ru.json';
import sv from '@/public/locales/sv.json';
import tr from '@/public/locales/tr.json';
import zh from '@/public/locales/zh.json';

const langObj: Record<string, Record<string, string>> = {
  vi, en, ae, da, de, el, es, fr, hu, it, ja, pl, pt, ru, sv, tr, zh,
};

const DEFAULT_LANG = 'en';

const getLang = (): string => {
  if (typeof window !== 'undefined') {
    const cookies = new Cookies();
    return cookies.get('i18nextLng') || DEFAULT_LANG;
  }
  return DEFAULT_LANG; // fallback trên server (hoặc xử lý khác nếu bạn dùng middleware)
};

export const getTranslation = () => {
  const lang = getLang();
  const data = langObj[lang] || langObj[DEFAULT_LANG];

  const t = (key: string): string => {
    return data[key] || key;
  };

  const i18n = {
    language: lang,
    changeLanguage: (newLang: string) => {
      const cookies = new Cookies();
      cookies.set('i18nextLng', newLang, { path: '/' });
      window.location.reload(); // cần reload nếu muốn phản ánh ngay
    },
  };

  const initLocale = (fallbackLang: string) => {
    const currentLang = getLang();
    i18n.changeLanguage(currentLang || fallbackLang);
  };

  return { t, i18n, initLocale };
};
