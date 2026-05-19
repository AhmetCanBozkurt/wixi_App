import styles from './LanguageSwitcher.module.css';

const LANG_LABELS: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
};

interface LanguageSwitcherProps {
  supported: string[];
  current: string;
  onChange: (lang: string) => void;
}

export const LanguageSwitcher = ({ supported, current, onChange }: LanguageSwitcherProps) => {
  if (supported.length <= 1) return null;

  return (
    <div className={styles.switcher}>
      {supported.map((lang) => (
        <button
          key={lang}
          className={`${styles.btn} ${current === lang ? styles.active : ''}`}
          onClick={() => onChange(lang)}
        >
          {LANG_LABELS[lang] ?? lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
