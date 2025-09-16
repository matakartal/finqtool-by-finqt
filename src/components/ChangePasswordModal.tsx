import React, { useState } from "react";
import { showSuccessToast, showErrorToast } from '@/lib/notifications';
import { useNotificationStore } from '@/components/NotificationDropdown';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onClose }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Simulate password change for demo
    setTimeout(() => {
      setLoading(false);
      showSuccessToast("Your password has been changed.", "Password Changed");
      addNotification({
        title: "Password Changed",
        description: "Your password was changed successfully."
      });
      setPassword("");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded border px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            required
            minLength={6}
          />
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black font-semibold" disabled={loading || password.length < 6}>{loading ? 'Changing...' : 'Change Password'}</button>
          </div>
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
