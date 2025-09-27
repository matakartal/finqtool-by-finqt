import React from 'react';
import { Info, RefreshCw, Type } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast } from '@/lib/notifications';
import { useFontSize } from '@/contexts/FontSizeContext';

interface SettingsPanelProps {
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
  onChangePassword: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ autoRefresh, onAutoRefreshChange, onChangePassword }) => {
  const { fontSize, setFontSize } = useFontSize();

  const fontSizeOptions = [
    { value: 'original', label: 'Original' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  return (
    <div className="animate-scale-in">
      <div className="px-4 py-3 bg-primary/10 dark:bg-primary/5 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium">Settings</h3>
        <div className="text-xs text-muted-foreground">v1.0.0</div>
      </div>
      
      <div className="p-4 space-y-4">

        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground">DATA</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
            </div>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onAutoRefreshChange} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type size={16} />
              <Label htmlFor="font-size">Font Size</Label>
            </div>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-32" id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      </div>
    </div>
  );
};

export default SettingsPanel;
