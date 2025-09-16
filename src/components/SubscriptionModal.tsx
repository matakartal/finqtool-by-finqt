import React from "react";
import { cancelSubscription } from '@/lib/stripe'; // mock only, no backend
import { useProStatus } from '@/hooks/useProStatus';
import { showSuccessToast, showInfoToast } from '@/lib/notifications';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  isPro?: boolean;
  userId?: string;
  subscriptionId?: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose, isPro, userId, subscriptionId }) => {
  const [, setPro] = useProStatus();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-neutral-200 dark:border-border w-full max-w-sm">
        <div className="px-6 pt-6 pb-0">
          <h2 className="text-xl font-bold mb-1">Subscription</h2>
          <p className="mb-4 text-sm text-muted-foreground">Toggle Pro status for testing. Both buttons are always visible.</p>
        </div>
        <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-neutral-200 dark:border-border bg-neutral-100 dark:bg-zinc-800 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm hover:bg-neutral-200 dark:hover:bg-zinc-700 transition"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-neutral-200 dark:border-border bg-neutral-50 dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-sm hover:bg-neutral-200 dark:hover:bg-zinc-800 transition"
              onClick={() => {
                setPro(true);
                showSuccessToast('Pro activated! Enjoy your new features.', 'Pro Activated');
              }}
            >
              Activate PRO
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-neutral-200 dark:border-border bg-neutral-50 dark:bg-zinc-900 text-neutral-900 dark:text-neutral-100 font-semibold shadow-sm hover:bg-neutral-100 dark:hover:bg-zinc-800 transition"
              onClick={() => {
                setPro(false);
                showInfoToast('Pro deactivated. You are now a normal user.', 'Pro Deactivated');
              }}
            >
              Deactivate PRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
