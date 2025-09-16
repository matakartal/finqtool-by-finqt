import React from 'react';
import { Calculator, CalendarDays, DollarSign, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CryptoHeaderProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const CryptoHeader: React.FC<CryptoHeaderProps> = ({ activeTab, setActiveTab }) => {
  const isMobile = useIsMobile();
  
  const tabs = [
    { id: 'financial', label: 'Tools', icon: <DollarSign size={isMobile ? 16 : 18} /> },
    { id: 'calculator', label: 'Calculator', icon: <Calculator size={isMobile ? 16 : 18} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={isMobile ? 16 : 18} /> },
  ];

  // Store active tab in chrome.storage if available
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Check if chrome and chrome.storage exist before using them
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ activeTab: tabId });
    } else {
      localStorage.setItem('activeTab', tabId);
    }
  };

  return (
    <nav className="relative px-2 py-3 bg-gradient-to-r from-white via-neutral-100 to-white dark:from-[#232526] dark:via-[#18191a] dark:to-[#232526] rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 mx-2 mt-2 mb-4">
      <div className="relative flex w-full max-w-2xl mx-auto gap-2 justify-center items-center">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              relative flex items-center px-5 py-2 rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none
              ${activeTab === tab.id 
                ? 'bg-black/90 dark:bg-white/10 text-white shadow-lg scale-105 z-10' 
                : 'bg-white/70 dark:bg-[#222]/80 text-neutral-800 dark:text-[#bbb] hover:bg-neutral-200 dark:hover:bg-[#333]/60'}
            `}
            style={{ boxShadow: activeTab === tab.id ? '0 4px 16px 0 rgba(0,0,0,0.08)' : undefined }}
          >
            <span className="mr-2 flex items-center">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute left-2 right-2 -bottom-2 h-1 rounded-b bg-gradient-to-r from-primary to-secondary dark:from-yellow-400 dark:to-pink-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ...rest of CryptoHeader

// Render Notes content when Notes tab is active
import Notes from "./Notes";

// ...inside your parent/page component (not in CryptoHeader directly):
// {activeTab === 'notes' && <Notes />}

export default CryptoHeader;
