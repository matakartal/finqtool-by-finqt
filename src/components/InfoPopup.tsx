import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface InfoPopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  infoKey?: string;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ open, onClose, title, children, infoKey }) => {
  const { t } = useTranslation();

  const renderStructuredInfo = (key: string) => {
    try {
      const infoData = t(`${key}.info`, { returnObjects: true }) as any;

      if (!infoData || typeof infoData !== 'object') {
        return null;
      }

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            {infoData.description}
          </p>
          {infoData.features && Array.isArray(infoData.features) && infoData.features.length > 0 && (
            <ul className="space-y-1 ml-1">
              {infoData.features.map((feature: string, index: number) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary text-xs mt-0.5">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
    } catch (error) {
      console.error('Error rendering structured info:', error);
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-left pb-3">
          <DialogTitle className="text-xl font-bold text-foreground text-left">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Learn more about this feature and how to use it effectively.
          </DialogDescription>
        </DialogHeader>
        <div className="px-1">
          {infoKey ? renderStructuredInfo(infoKey) : children}
        </div>
        <div className="flex justify-end pt-4 px-1">
          <Button
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black px-4 py-2"
          >
            Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoPopup; 