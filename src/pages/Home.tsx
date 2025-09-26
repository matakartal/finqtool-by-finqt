import React, { useState, useEffect, useCallback, memo } from 'react';
import FinancialCalculator from '@/components/FinancialCalculator';
import BasicCalculator from '@/components/BasicCalculator';
import MarketsTable from '@/components/MarketsTable';
import Notes from '@/components/Notes';
import Rules from './Rules';
import ProfileDropdown from '@/components/ProfileDropdown';
import { useNotificationStore } from '@/components/NotificationDropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleAlert, Moon, Sun, Info } from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { storage } from '@/utils/storage';
import { TABS } from '@/constants/tabs';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingState from '@/components/LoadingState';
import AppLogo from '@/components/AppLogo';
import InfoPopup from '@/components/InfoPopup';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const { addNotification } = useNotificationStore();

    const [selectedTab, setSelectedTab] = useState<string>("calculator");
    const [currentTime, setCurrentTime] = useState<string>('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const isMobile = useIsMobile();
    const { theme, toggleTheme } = useTheme();
    const [selectedInfoTab, setSelectedInfoTab] = useState<string | null>(null);

    useEffect(() => {
        const loadAutoRefresh = async () => {
            const savedAutoRefresh = await storage.get<boolean>('autoRefresh');
            if (savedAutoRefresh !== null) {
                setAutoRefresh(savedAutoRefresh);
            }
        };
        loadAutoRefresh();
    }, []);

    useEffect(() => {
        storage.set('autoRefresh', autoRefresh);
    }, [autoRefresh]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString());
        };

        updateTime();
        const interval = setInterval(updateTime, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAutoRefreshChange = useCallback((checked: boolean) => {
        setAutoRefresh(checked);
    }, []);

    const handleTabChange = useCallback((value: string) => {
        setSelectedTab(value);
    }, []);

    const handleThemeToggle = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);



    return (
        <ErrorBoundary>
            <>
                <div className="flex flex-col min-h-full bg-[#f5f5f7] dark:bg-[#121212] p-0">
                <div className="bg-gradient-to-r from-black to-zinc-900 backdrop-blur-lg border-b border-zinc-800 p-3 flex justify-between items-center sticky top-0 z-10">
                    <AppLogo />
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleThemeToggle} 
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-0 transition-colors" 
                            aria-label={t('settings.theme.' + (theme === 'light' ? 'dark' : 'light'))}
                        >
                            {theme === 'light' ? <Moon size={16} className="transition-transform duration-200" /> : <Sun size={16} className="transition-transform duration-200" />}
                        </button>

                        <NotificationDropdown />

                        <ProfileDropdown
                            autoRefresh={autoRefresh}
                            onAutoRefreshChange={handleAutoRefreshChange}
                        />
                    </div>
                </div>
                
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md px-2 py-1 shadow-sm sticky top-14 z-10 border-b border-white/20 dark:border-zinc-800/50">
                    <Tabs
                        value={selectedTab}
                        onValueChange={handleTabChange}
                        className="w-full"
                    >
                        <TabsList
                            className="flex flex-row gap-0.5 p-0.5 bg-white/5 dark:bg-black/10 backdrop-blur-sm rounded-lg shadow-sm border border-white/10 dark:border-zinc-700/30 overflow-x-auto no-scrollbar min-w-0 whitespace-nowrap h-8"
                            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
                            aria-label="Main navigation tabs"
                        >
                            {TABS.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="text-xs sm:text-sm px-3 py-1 focus:outline-none focus:ring-0 whitespace-nowrap font-medium"
                                >
                                    {t(`tabs.${tab.id}`)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 h-full overflow-y-auto p-1.5 sm:p-2 relative">
                    <Tabs value={selectedTab} className="h-full">
                        {TABS.map((tab) => (
                            <TabsContent key={tab.id} value={tab.id} className="mt-0">
                                <div className="w-full max-w-4xl mx-auto py-1">
                                    <div className="flex flex-col items-start gap-1.5 mb-3 px-2 sm:px-0">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <tab.icon size={22} className="text-primary" />
                                                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-foreground tracking-tight">
                                                    {t(`${tab.id}.title`)}
                                                </h2>
                                            </div>
                                            <button
                                                onClick={() => setSelectedInfoTab(tab.id)}
                                                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                                                title={t('common.howToUse')}
                                            >
                                                <Info size={16} className="text-neutral-400 hover:text-primary" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                                            {t(`${tab.id}.description`)}
                                        </p>
                                    </div>

                                    {tab.id === "financial" && (
                                        <FinancialCalculator />
                                    )}

                                    {tab.id === "calculator" && (
                                        <BasicCalculator />
                                    )}

                                    {tab.id === "markets" && (
                                        <MarketsTable autoRefresh={autoRefresh} />
                                    )}

                                    {tab.id === "notes" && (
                                        <Notes />
                                    )}

                                    {tab.id === "rules" && (
                                        <Rules />
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                {selectedInfoTab && (
                    <InfoPopup
                        open={!!selectedInfoTab}
                        onClose={() => setSelectedInfoTab(null)}
                        title={t(`${selectedInfoTab}.title`)}
                        infoKey={selectedInfoTab}
                    />
                )}
                </div>
                <Footer />
            </>
        </ErrorBoundary>
    );
};

export default HomePage;
