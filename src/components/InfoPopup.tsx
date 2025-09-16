import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';

interface InfoPopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ open, onClose, title, children }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-1">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoPopup; 