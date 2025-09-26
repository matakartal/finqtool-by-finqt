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
import { Settings, RefreshCcw, Building, Info, Mail, Globe, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

const ProfileDropdown: React.FC<{
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
}> = ({ autoRefresh, onAutoRefreshChange }) => {
  const { i18n, t } = useTranslation();

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
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel className="text-[13px] font-semibold tracking-tight">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-muted-foreground">Settings</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info size={15} />
              {t('about.title')}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 text-[13px] pl-2">
            <p className="text-[13px] text-muted-foreground">
              {t('about.description')}
            </p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building size={15} />
              Exchanges
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className="flex cursor-pointer items-center gap-2 text-[13px] pl-9"
            onClick={() => window.open('https://www.binance.com/activity/referral-entry/CPA?ref=CPA_00PIE1VCKT', '_blank')}
          >
            <img src="/binance.svg" alt="Binance" className="w-4 h-4" />
            Binance
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex cursor-pointer items-center gap-2 text-[13px] pl-9"
            onClick={() => window.open('https://partner.bybit.com/b/971', '_blank')}
          >
            <img src="/bybit.svg" alt="Bybit" className="w-4 h-4" />
            Bybit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex cursor-pointer items-center justify-between text-[13px]">
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe size={15} />
              {t('settings.language')}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem 
            className="flex cursor-pointer items-center justify-between text-[13px] px-2 py-1.5"
            onClick={() => i18n.changeLanguage('en')}
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center rounded-sm border border-zinc-700">
                {i18n.language === 'en' && <Check size={12} className="text-primary" />}
              </span>
              English
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex cursor-pointer items-center justify-between text-[13px] px-2 py-1.5"
            onClick={() => i18n.changeLanguage('tr')}
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center rounded-sm border border-zinc-700">
                {i18n.language === 'tr' && <Check size={12} className="text-primary" />}
              </span>
              Türkçe
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-[13px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail size={15} />
              {t('contact.title')}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2 text-[13px] pl-2">
            <p className="text-[13px] text-muted-foreground">
              {t('contact.description')}{' '}
              <a 
                href="mailto:info@finqt.com"
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('mailto:info@finqt.com', '_blank');
                }}
              >
                {t('contact.email')}
              </a>
            </p>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
