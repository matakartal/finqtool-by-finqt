import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

const getBadgeVariant = (category: string) => {
  switch (category.toLowerCase()) {
    case 'trading':
      return 'default'; // Primary blue
    case 'analysis':
      return 'secondary'; // Gray/secondary
    case 'risk':
      return 'destructive'; // Red for risk management
    default:
      return 'outline'; // Outline for unknown categories
  }
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  // Format the content preview by taking first few lines
  const contentPreview = template.content
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 2)
    .join('\n');

  const handleClick = () => {
    // Add a brief visual feedback
    onClick();
  };

  return (
    <Card
      className="cursor-pointer transition-all bg-white dark:bg-[#232323] border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-primary/50 group active:scale-95"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate flex-1">{template.title}</h3>
          <Badge variant={getBadgeVariant(template.category)} className="text-xs flex-shrink-0">
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-2 px-3 pb-3 relative">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {contentPreview.split('\n').map((line, index) => (
            <div key={index} className="truncate">
              {line}
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 right-3 text-xs text-primary">
          Click to create note
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
