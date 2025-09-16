import React from 'react';
import { useTranslation } from 'react-i18next';

const AdBanner: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full my-4 flex justify-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-3 shadow-sm text-center text-yellow-900 text-sm font-medium max-w-lg w-full">
        <span role="img" aria-label={t('pro.ad.label')}>📢</span> <b>{t('pro.ad.title')}</b> {t('pro.ad.message')}
      </div>
    </div>
  );
};

export default AdBanner;
