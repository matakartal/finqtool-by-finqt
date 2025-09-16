import React from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('notFound.title')}</h1>
        <p className="text-xl text-gray-600 mb-4">{t('notFound.description')}</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('common.returnHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
