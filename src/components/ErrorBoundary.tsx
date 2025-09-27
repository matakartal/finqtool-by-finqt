import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/AppLogo';
import NotificationDropdown from '@/components/NotificationDropdown';
import SettingsDropdown from '@/components/SettingsDropdown';
import Footer from '@/components/Footer';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

const ErrorPage: React.FC<{ error: Error | null; onReset: () => void }> = ({ error, onReset }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-full bg-[#f5f5f7] dark:bg-[#121212] p-0">
      <div className="bg-gradient-to-r from-black to-zinc-900 backdrop-blur-lg border-b border-zinc-800 p-3 flex justify-between items-center sticky top-0 z-10">
        <AppLogo />
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none focus:ring-0 transition-colors"
            aria-label={t('settings.theme.' + (theme === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? <Moon size={16} className="transition-transform duration-200" /> : <Sun size={16} className="transition-transform duration-200" />}
          </button>

          <NotificationDropdown />

          <SettingsDropdown
            autoRefresh={false}
            onAutoRefreshChange={() => {}}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto py-2 space-y-4">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle size={64} className="mb-6 text-red-500/60" />
            <div className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Oops! Something went wrong</div>
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-md">
              {error?.message || 'An unexpected error occurred while loading the application.'}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={onReset}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorBoundary;
