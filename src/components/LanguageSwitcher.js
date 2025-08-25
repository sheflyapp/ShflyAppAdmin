import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
      title={currentLanguage === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className="text-lg">
        {currentLanguage === 'en' ? '🇸🇦' : '🇺🇸'}
      </span>
      <span className="text-sm font-medium">
        {currentLanguage === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

