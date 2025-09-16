import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingState: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f7] dark:bg-[#121212]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{t('loading')}</p>
    </div>
  );
};

export default LoadingState; 