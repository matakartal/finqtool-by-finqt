import React from "react";

interface SponsoredNotificationProps {
  partner: {
    name: string;
    logoUrl: string;
    link: string;
  };
  title: string;
  description: string;
  actions?: { label: string; href: string }[];
  onClose?: () => void;
}

const SponsoredNotification: React.FC<SponsoredNotificationProps> = ({
  partner,
  title,
  description,
  actions = [],
  onClose,
}) => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-2 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-0.5">
        <img src={partner.logoUrl} alt={partner.name} className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" />
        <span className="bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 font-medium rounded px-2 py-0.5">Sponsored</span>
        <span className="text-xs text-zinc-500 font-medium ml-1">by {partner.name}</span>
      </div>
      <div className="flex items-start gap-2">
        <span role="img" aria-label="rocket" className="text-base mt-0.5">🚀</span>
        <div>
          <div className="font-medium text-sm text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        </div>
      </div>
      <div className="flex gap-2 mt-1">
        {actions.map((action, idx) => (
          <a
            key={idx}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline text-xs font-medium hover:opacity-80 transition-opacity"
          >
            {action.label}
          </a>
        ))}
        <a
          href={partner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline text-xs font-medium hover:opacity-80 transition-opacity"
        >
          Go to {partner.name}
        </a>
      </div>
    </div>
  );
};

export default SponsoredNotification;
