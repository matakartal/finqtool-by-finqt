import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const PRO_KEY = 'is_pro_user';

interface ProStatusContextType {
  isPro: boolean;
  setPro: (val: boolean) => void;
}

const ProStatusContext = createContext<ProStatusContextType | undefined>(undefined);

export const ProStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isPro, setIsPro] = useState<boolean>(false);

  useEffect(() => {
    const pro = localStorage.getItem(PRO_KEY);
    setIsPro(pro === 'true');
  }, []);

  const setPro = (val: boolean) => {
    setIsPro(val);
    localStorage.setItem(PRO_KEY, val ? 'true' : 'false');
  };

  return (
    <ProStatusContext.Provider value={{ isPro, setPro }}>
      {children}
    </ProStatusContext.Provider>
  );
};

export const useProStatusContext = () => {
  const context = useContext(ProStatusContext);
  if (!context) {
    throw new Error('useProStatusContext must be used within a ProStatusProvider');
  }
  return context;
};
