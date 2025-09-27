import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Settings, RefreshCcw, Info, Mail, Check, Type } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useFontSize } from "@/contexts/FontSizeContext";

const SettingsDropdown: React.FC<{
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
}> = ({ autoRefresh, onAutoRefreshChange }) => {
  const { i18n, t } = useTranslation();
  const { fontSize, setFontSize } = useFontSize();

  const fontSizeOptions = [
    { value: 'original', label: 'Original' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none"
          aria-label="Settings"
        >
          <Settings size={15} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-zinc-800/50 rounded-xl">
        <DropdownMenuLabel className="text-[13px] font-semibold tracking-tight">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-foreground">Settings</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="!bg-neutral-200/50 dark:!bg-muted" />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-foreground">
            <div className="flex items-center gap-2">
              {t('about.title')}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted-foreground pl-2 hover:bg-white/15 dark:hover:bg-black/25">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {t('about.description')}
            </p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-foreground">
            <div className="flex items-center gap-2">
              Preferences
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between text-[13px] font-medium text-muted-foreground hover:bg-white/15 dark:hover:bg-black/25">
            <div className="flex items-center gap-2">
              <RefreshCcw size={15} />
              {t('settings.autoRefresh')}
            </div>
            <Switch
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
              className="ml-2"
            />
          </DropdownMenuItem>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between text-[13px] font-medium text-muted-foreground hover:bg-white/15 dark:hover:bg-black/25">
            <div className="flex items-center gap-2">
              <Type size={15} />
              {t('settings.fontSize')}
            </div>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="ml-2 w-32 h-8 bg-transparent border border-neutral-200 dark:border-zinc-700 text-[12px] text-muted-foreground focus:outline-none focus:ring-0">
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
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="!bg-neutral-200/50 dark:!bg-muted" />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-foreground">
            <div className="flex items-center gap-2">
              {t('settings.language')}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="flex cursor-pointer items-center justify-between text-[13px] font-medium text-muted-foreground px-2 py-1.5 hover:bg-white/15 dark:hover:bg-black/25"
            onClick={() => i18n.changeLanguage('en')}
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center rounded-sm border border-zinc-700">
                {i18n.language === 'en' && <Check size={12} className="text-primary" />}
              </span>
              <span className="tracking-tight">English</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center justify-between text-[13px] font-medium text-muted-foreground px-2 py-1.5 hover:bg-white/15 dark:hover:bg-black/25"
            onClick={() => i18n.changeLanguage('tr')}
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center rounded-sm border border-zinc-700">
                {i18n.language === 'tr' && <Check size={12} className="text-primary" />}
              </span>
              <span className="tracking-tight">Türkçe</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="!bg-neutral-200/50 dark:!bg-muted" />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-foreground">
            <div className="flex items-center gap-2">
              {t('contact.title')}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-muted-foreground pl-2 hover:bg-white/15 dark:hover:bg-black/25"
            onClick={() => window.open('mailto:info@finqt.com?subject=Business Inquiry - finqtool&body=Dear finqt Team,%0A%0AMy name is [Your Name] and I\'m contacting you regarding:%0A%0A[Please specify: Question/Support/Partnership/Advertising]%0A%0ADetails:%0A[Describe your inquiry, project, or opportunity here]%0A%0AContact Information:%0A- Name: [Your Full Name]%0A- Company/Organization: [If applicable]%0A- Website/Social Media: [If applicable]%0A- Phone: [If preferred]%0A%0ABest regards,%0A[Your Full Name]', '_blank')}
          >
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {t('contact.description')}{' '}
              <span className="text-primary font-medium">
                {t('contact.email')}
              </span>
            </p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
