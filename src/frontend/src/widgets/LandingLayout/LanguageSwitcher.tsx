import { useTranslation } from 'react-i18next';
import s from './LanguageSwitcher.module.css';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLng = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('landing-lng', lng);
  };

  return (
    <div className={s.switcher}>
      <button
        className={`${s.btn} ${i18n.language === 'tr' ? s.active : ''}`}
        onClick={() => changeLng('tr')}
      >
        TR
      </button>
      <span className={s.sep}>|</span>
      <button
        className={`${s.btn} ${i18n.language === 'en' ? s.active : ''}`}
        onClick={() => changeLng('en')}
      >
        EN
      </button>
    </div>
  );
}
