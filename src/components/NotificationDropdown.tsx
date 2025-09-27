import React, { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";

export type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'login' | 'system' | 'update' | 'sponsored';
  sponsored?: {
    name: string;
    logoUrl: string;
    link: string;
  };
};

let notificationId = 1;
const defaultNotifications: Notification[] = [];

const notificationStore = {
  notifications: defaultNotifications.slice(),
  listeners: new Set<(notifications: Notification[]) => void>(),
  hasShownLoginNotification: false,

  addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>) {
    // Check if it's a login notification and if we've already shown it
    if (notification.type === 'login' && this.hasShownLoginNotification) {
      return;
    }

    const newNotif = {
      id: notificationId++,
      ...notification,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    // If it's a login notification, mark it as shown
    if (notification.type === 'login') {
      this.hasShownLoginNotification = true;
      // Store in localStorage to persist across page reloads
      localStorage.setItem('hasShownLoginNotification', 'true');
    }

    this.notifications = [newNotif, ...this.notifications];
    this.notifyListeners();
  },

  markAsRead(id: number) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyListeners();
  },

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notifyListeners();
  },

  clearNotifications() {
    this.notifications = [];
    this.notifyListeners();
  },

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  },

  // Initialize login notification state from localStorage
  init() {
    this.hasShownLoginNotification = localStorage.getItem('hasShownLoginNotification') === 'true';
  }
};

// Initialize the store
notificationStore.init();

export function useNotificationStore() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationStore.notifications);
  
  useEffect(() => {
    return notificationStore.subscribe(setNotifications);
  }, []);

  return {
    notifications,
    addNotification: notificationStore.addNotification.bind(notificationStore),
    markAsRead: notificationStore.markAsRead.bind(notificationStore),
    markAllAsRead: notificationStore.markAllAsRead.bind(notificationStore),
    clearNotifications: () => notificationStore.clearNotifications()
  };
}

const NotificationDropdown: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotifications();
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-white hover:bg-zinc-700 focus:outline-none"
          aria-label="Notifications"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] p-0 bg-white/10 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-zinc-800/50 rounded-xl">
        <div className="flex items-center justify-between border-b border-neutral-200/50 dark:border-zinc-800/50 bg-white/5 dark:bg-black/10 backdrop-blur-sm px-4 pb-2 pt-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold tracking-tight">
            Notifications
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Mark all as read
              </button>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-red-500"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto py-0.5">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] font-medium text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notif) => (
              notif.sponsored ? (
                <div key={notif.id} className="px-2 py-2">
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-2 flex items-center gap-2">
                      <img 
                        src={notif.sponsored.logoUrl} 
                        alt={notif.sponsored.name} 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="text-[13px] font-semibold tracking-tight">
                        {notif.sponsored.name}
                      </span>
                    </div>
                    <h3 className="mb-1 text-[13px] font-semibold tracking-tight">
                      {notif.title}
                    </h3>
                    <p className="mb-3 text-[12px] leading-relaxed text-muted-foreground">
                      {notif.description}
                    </p>
                    <a 
                      href={notif.sponsored.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              ) : (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 hover:bg-white/15 dark:hover:bg-black/25 ${!notif.read ? 'bg-white/10 dark:bg-black/20' : ''}`}
                  onClick={() => handleNotificationClick(notif.id)}
                >
                  <span className="text-[13px] font-semibold tracking-tight">
                    {notif.title}
                  </span>
                  <span className="text-[12px] leading-relaxed text-muted-foreground">
                    {notif.description}
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-zinc-400">
                    {notif.time}
                  </span>
                </DropdownMenuItem>
              )
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
