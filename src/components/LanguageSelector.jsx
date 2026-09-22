import { Globe2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSelector() {
  const { language, languages, setLanguage, t } = useLanguage();

  return (
    <label className="language-selector">
      <Globe2 aria-hidden="true" size={15} />
      <span className="language-selector__label">{t('Select language')}</span>
      <select aria-label={t('Select language')} onChange={(event) => setLanguage(event.target.value)} value={language}>
        {languages.map((item) => (
          <option key={item.code} value={item.code}>{item.nativeLabel}</option>
        ))}
      </select>
    </label>
  );
}
