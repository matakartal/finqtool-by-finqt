import React from 'react';

interface NoteTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface TemplateCardProps {
  template: NoteTemplate;
  onClick: () => void;
}

const CATEGORY_COLORS = {
  'Trading': 'bg-blue-500/20 border-blue-400/50 text-blue-100 hover:bg-blue-500/30',
  'Analysis': 'bg-green-500/20 border-green-400/50 text-green-100 hover:bg-green-500/30',
  'Risk': 'bg-red-500/20 border-red-400/50 text-red-100 hover:bg-red-500/30',
  'Strategy': 'bg-purple-500/20 border-purple-400/50 text-purple-100 hover:bg-purple-500/30',
  'Psychology': 'bg-pink-500/20 border-pink-400/50 text-pink-100 hover:bg-pink-500/30',
  'Education': 'bg-yellow-500/20 border-yellow-400/50 text-yellow-100 hover:bg-yellow-500/30',
  'General': 'bg-gray-500/20 border-gray-400/50 text-gray-100 hover:bg-gray-500/30'
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  // Format the content preview by taking first few lines
  const contentPreview = template.content
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 4)
    .join('\n');

  const handleClick = () => {
    // Add a brief visual feedback
    onClick();
  };

  return (
    <div
      className="cursor-pointer transition-all rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn hover:shadow-xl hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 active:scale-95"
      onClick={handleClick}
    >
      <div className="bg-black backdrop-blur-lg border-b border-zinc-800 px-4 pt-3 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium text-white text-sm truncate flex-1">{template.title}</h3>
          <button
            className={`text-xs flex-shrink-0 border px-2 py-0.5 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 ${CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500/20 border-gray-400/50 text-gray-100 hover:bg-gray-500/30'}`}
          >
            {template.category}
          </button>
        </div>
      </div>
      <div className="flex flex-col px-4 py-4 bg-muted/40 relative min-h-[100px]">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {contentPreview.split('\n').map((line, index) => (
            <div key={index} className="truncate">
              {line}
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 right-4 text-xs text-primary font-medium">
          Click to create note
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
