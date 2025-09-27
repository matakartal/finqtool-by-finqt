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
  'Trading': 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-400/50 text-blue-800 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-500/30',
  'Analysis': 'bg-green-100 dark:bg-green-500/20 border-green-200 dark:border-green-400/50 text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-500/30',
  'Risk': 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-400/50 text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-500/30',
  'Strategy': 'bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-400/50 text-purple-800 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-500/30',
  'Psychology': 'bg-pink-100 dark:bg-pink-500/20 border-pink-200 dark:border-pink-400/50 text-pink-800 dark:text-pink-100 hover:bg-pink-200 dark:hover:bg-pink-500/30',
  'Education': 'bg-yellow-100 dark:bg-yellow-500/20 border-yellow-200 dark:border-yellow-400/50 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-500/30',
  'General': 'bg-gray-100 dark:bg-gray-500/20 border-gray-200 dark:border-gray-400/50 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500/30'
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  // Format the content preview by taking first few lines
  const contentPreview = template.content
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 3)
    .join('\n');

  const handleClick = () => {
    onClick();
  };

  return (
    <div
      className="cursor-pointer transition-all rounded-lg border bg-card shadow-sm overflow-hidden animate-fadeScaleIn hover:shadow-md hover:border-primary/50 active:scale-95 relative group"
      onClick={handleClick}
    >
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-xs text-primary font-medium bg-card px-2 py-1 rounded border shadow-sm">
          Click to create note
        </span>
      </div>
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground truncate flex-1">{template.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded border ml-2 ${CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || 'bg-muted text-muted-foreground'}`}>
            {template.category}
          </span>
        </div>
      </div>
      <div className="px-4 py-3 min-h-[80px]">
        <div className="text-xs text-muted-foreground leading-relaxed">
          {contentPreview.split('\n').map((line, index) => (
            <div key={index} className="truncate mb-1 last:mb-0">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
