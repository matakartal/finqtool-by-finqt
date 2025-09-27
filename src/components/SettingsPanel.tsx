import React from 'react';
import { Info, RefreshCw, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { showSuccessToast } from '@/lib/notifications';

interface SettingsPanelProps {
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
  onChangePassword: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ autoRefresh, onAutoRefreshChange, onChangePassword }) => {
  
  return (
    <div className="animate-scale-in">
      <div className="px-4 py-3 bg-primary/10 dark:bg-primary/5 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium">Settings</h3>
        <div className="text-xs text-muted-foreground">v1.0.0</div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Exchanges tab */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">EXCHANGES</h4>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://www.binance.com/', '_blank')}
              type="button"
            >
              <img src="/binance.svg" alt="Binance logo" width={20} height={20} style={{ display: 'inline-block' }} />
              Binance
            </button>
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://partner.bybit.com/b/971', '_blank')}
              type="button"
            >
              <img src="/bybit.svg" alt="Bybit logo" width={20} height={20} style={{ display: 'inline-block' }} />
              Bybit
            </button>
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://www.okx.com/', '_blank')}
              type="button"
            >
              <img src="/okx.svg" alt="OKX logo" width={20} height={20} style={{ display: 'inline-block' }} />
              OKX
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">DATA</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
            </div>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onAutoRefreshChange} />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">ABOUT</h4>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              finqtool is a trading tools extension for cryptocurrency traders. Built with ♥ by finqt.
            </p>
          </div>
        </div>
        {/* Contact Us section */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">CONTACT US</h4>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              Questions, feedback or support? Email us at <a href="mailto:info@finqt.com" className="text-primary underline">info@finqt.com</a>.
            </p>
          </div>
        </div>

        {/* Socials section */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">SOCIALS</h4>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://x.com/finqtcom', '_blank')}
              type="button"
            >
              <span className="font-medium">𝕏</span>
              @finqtcom
            </button>
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://tiktok.com/finqtcom', '_blank')}
              type="button"
            >
              <span className="font-medium">TikTok</span>
              @finqtcom
            </button>
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://youtube.com/finqtcom', '_blank')}
              type="button"
            >
              <span className="font-medium">YouTube</span>
              @finqtcom
            </button>
            <button
              className="flex items-center gap-2 text-left hover:text-primary focus:outline-none focus:underline"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => window.open('https://instagram.com/finqtcom', '_blank')}
              type="button"
            >
              <span className="font-medium">Instagram</span>
              @finqtcom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
