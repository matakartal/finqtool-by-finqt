import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ProUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ open, onClose, onUpgrade }) => {
  const { t } = useTranslation();
  const features = t('pro.features', { returnObjects: true }) as string[];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-1">{t('pro.title')}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          <div className="mb-3 text-base text-neutral-800 dark:text-neutral-100 font-semibold">{t('pro.description')}</div>
          <div className="mb-4 text-base text-neutral-700 dark:text-neutral-200">
            <p className="mb-2">{t('pro.description.p1')}</p>
            <ul className="list-disc pl-5 space-y-2">
              {features.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 mb-2 text-base font-medium text-neutral-800 dark:text-neutral-100 text-left">
            {t('pro.message')}
          </div>
          <div className="mb-4 flex flex-col items-center">
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{t('pro.price')}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('pro.cancel')}</span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onUpgrade} className="w-full text-lg font-bold py-4 rounded-xl">{t('pro.upgrade')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeModal;
