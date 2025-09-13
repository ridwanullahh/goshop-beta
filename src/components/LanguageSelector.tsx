import React from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { useTranslation } from 'react-i18next';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { languages, setLanguage } = useCommerce();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  if (!languages || languages.length === 0) return null;

  return (
    <div className="flex items-center">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-sm text-muted-foreground hover:text-foreground focus:outline-none"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-background text-foreground">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
