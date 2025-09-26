import React from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import Footer from '@/components/Footer';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <div className="flex flex-col min-h-full bg-[#f5f5f7] dark:bg-[#121212]">
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('notFound.title')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">{t('notFound.description')}</p>
            <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
              {t('common.returnHome')}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFoundPage;
