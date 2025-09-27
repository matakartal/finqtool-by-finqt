import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Pencil, PlusCircle, Search, Tag, History, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TemplateCard from '@/components/TemplateCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast, showInfoToast } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';

const NOTES_KEY = 'multi_financial_notes';
const NOTE_TEMPLATES_KEY = 'note_templates';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  template?: boolean;
}

interface NoteTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

const defaultNote = (): Note => ({
  id: Math.random().toString(36).slice(2, 10),
  title: 'Untitled Note',
  content: '',
  category: 'General',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1
});

const defaultTemplates: NoteTemplate[] = [
  {
    id: 'template1',
    title: 'Trading Notes',
    content: `TRADING NOTES
Date/Time:
Asset/Market:

Current Analysis:
• Market Trend:
• Key Levels (Support/Resistance):
• Technical Indicators:
• Price Action:

Trade Idea:
• Entry Point:
• Target Price:
• Stop Loss:
• Position Size:
• Risk/Reward Ratio:

Execution:
• Entry Signal:
• Exit Strategy:
• Risk Management:

Notes & Follow-up:
• Actual Entry:
• Actual Exit:
• P&L Result:
• Lesson Learned:`,
    category: 'Trading'
  },
  {
    id: 'template2',
    title: 'Market Analysis',
    content: `MARKET ANALYSIS NOTES
Asset/Market:
Timeframe:
Date:

Technical Analysis:
• Trend Direction:
• Key Support Levels:
• Key Resistance Levels:
• Indicators Used:
• Chart Patterns:

Fundamental Analysis:
• Economic Data:
• News Events:
• Market Sentiment:
• External Factors:

Price Action:
• Current Price:
• Recent High/Low:
• Volume Analysis:

Conclusion & Outlook:
• Market Bias:
• Entry Opportunities:
• Risk Factors:
• Next Review Date:

Action Items:
• Watch List:
• Alerts to Set:
• Research Needed:`,
    category: 'Analysis'
  },
  {
    id: 'template3',
    title: 'Risk Management',
    content: `RISK MANAGEMENT PLAN
Account Overview:
• Total Balance:
• Available for Trading:
• Risk Capital:

Risk Parameters:
• Max Risk per Trade:
• Max Daily Loss:
• Max Weekly Loss:
• Win Rate Target:

Position Sizing:
• Risk Amount per trade:
• Stop Loss Distance:
• Position Size Formula:

Risk Rules:
• Max risk per asset:
• Max open positions:
• Profit taking levels:
• Loss cutting rules:

Performance Tracking:
• Current Win Rate:
• Average Risk/Reward:
• Best/Worst Trade:

Notes:`,
    category: 'Risk'
  },
  {
    id: 'template4',
    title: 'Trading Strategy',
    content: `TRADING STRATEGY FRAMEWORK
Strategy Name:
Timeframe:
Markets:

Strategy Overview:
• Core Concept:
• Entry Rules:
• Exit Rules:
• Risk Management:

Technical Setup:
• Indicators:
• Chart Patterns:
• Timeframes:
• Confirmation Signals:

Entry Criteria:
• Primary Signal:
• Secondary Confirmation:
• Volume Requirements:
• Market Conditions:

Exit Strategy:
• Profit Targets:
• Stop Loss Placement:
• Trailing Stop Rules:
• Time-based Exits:

Risk Parameters:
• Max Risk per Trade:
• Max Daily Loss:
• Win Rate Target:
• Reward/Risk Ratio:

Backtest Results:
• Sample Size:
• Win Rate:
• Average Win/Loss:
• Max Drawdown:

Strategy Notes:
• Strengths:
• Weaknesses:
• Adjustments Needed:`,
    category: 'Strategy'
  },
  {
    id: 'template5',
    title: 'Trading Psychology',
    content: `TRADING PSYCHOLOGY JOURNAL
Date:
Trading Session:

Emotional State Before Trading:
• Energy Level:
• Confidence Level:
• Stress Factors:
• Mental Preparation:

During Trading:
• Emotions Experienced:
• Decision Making Process:
• Discipline Level:
• Patience Level:

Post-Trading Review:
• Wins/Losses:
• What went well:
• What went wrong:
• Lessons Learned:

Psychological Patterns:
• Greed/Fear Triggers:
• Overconfidence Moments:
• Doubt/Uncertainty:
• Impatience Signs:

Improvement Plan:
• Mental Training:
• Routine Adjustments:
• Support Systems:
• Goals for Next Session:

Reflection:
• Overall Mindset:
• Areas for Growth:
• Positive Affirmations:`,
    category: 'Psychology'
  },
  {
    id: 'template6',
    title: 'Educational Notes',
    content: `FINANCIAL EDUCATION NOTES
Topic:
Source:
Date:

Key Concepts:
• Definition:
• Importance:
• Applications:

Detailed Notes:
• Main Points:
• Examples:
• Case Studies:

Practical Applications:
• In Trading:
• In Investing:
• In Risk Management:

Key Takeaways:
• Most Important Lesson:
• Action Items:
• Further Reading:

Personal Insights:
• How this applies to me:
• Questions raised:
• Areas for deeper study:

Review Schedule:
• Short-term Review:
• Long-term Review:
• Application Timeline:`,
    category: 'Education'
  },
  {
    id: 'template7',
    title: 'General Notes',
    content: `GENERAL NOTES
Topic:
Date:

Key Points:
•

Details:
•

Action Items:
•

Questions/Thoughts:
•

References:
•

Follow-up:
•`,
    category: 'General'
  }
];

const MAX_NOTES = 10;
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

const PREDEFINED_CATEGORIES = [
  'Trading',
  'Analysis',
  'Risk',
  'Strategy',
  'Psychology',
  'Education',
  'General'
];

const CATEGORY_COLORS = {
  'Trading': 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-400/50 text-blue-800 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-500/30',
  'Analysis': 'bg-green-100 dark:bg-green-500/20 border-green-200 dark:border-green-400/50 text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-500/30',
  'Risk': 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-400/50 text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-500/30',
  'Strategy': 'bg-purple-100 dark:bg-purple-500/20 border-purple-200 dark:border-purple-400/50 text-purple-800 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-500/30',
  'Psychology': 'bg-pink-100 dark:bg-pink-500/20 border-pink-200 dark:border-pink-400/50 text-pink-800 dark:text-pink-100 hover:bg-pink-200 dark:hover:bg-pink-500/30',
  'Education': 'bg-yellow-100 dark:bg-yellow-500/20 border-yellow-200 dark:border-yellow-400/50 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-500/30',
  'General': 'bg-gray-100 dark:bg-gray-500/20 border-gray-200 dark:border-gray-400/50 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-500/30'
};

const CATEGORY_DOT_COLORS = {
  'Trading': 'bg-blue-500',
  'Analysis': 'bg-green-500',
  'Risk': 'bg-red-500',
  'Strategy': 'bg-purple-500',
  'Psychology': 'bg-pink-500',
  'Education': 'bg-yellow-500',
  'General': 'bg-gray-500'
};

const Notes: React.FC<{ showTemplates: boolean; onHideTemplates?: () => void }> = ({ showTemplates, onHideTemplates }) => {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [templates, setTemplates] = useState<NoteTemplate[]>(defaultTemplates);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  // Load notes and templates from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_KEY);
    const savedTemplates = localStorage.getItem(NOTE_TEMPLATES_KEY);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    if (savedTemplates) {
      const parsedTemplates = JSON.parse(savedTemplates);
      // Merge saved templates with default templates, prioritizing saved custom templates
      const mergedTemplates = [...defaultTemplates];
      parsedTemplates.forEach((savedTemplate: NoteTemplate) => {
        const existingIndex = mergedTemplates.findIndex(t => t.id === savedTemplate.id);
        if (existingIndex >= 0) {
          // Update existing default template
          mergedTemplates[existingIndex] = savedTemplate;
        } else {
          // Add new custom template
          mergedTemplates.push(savedTemplate);
        }
      });
      setTemplates(mergedTemplates);
    } else {
      // No saved templates, use defaults and save them
      setTemplates(defaultTemplates);
      localStorage.setItem(NOTE_TEMPLATES_KEY, JSON.stringify(defaultTemplates));
    }
  }, []);

  // Save notes and templates to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [notes]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(NOTE_TEMPLATES_KEY, JSON.stringify(templates));
      } catch (error) {
        console.error('Failed to save templates:', error);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [templates]);

  function addNote(template?: NoteTemplate) {
    if (notes.length >= MAX_NOTES) {
      showInfoToast(
        `Note limit reached`,
        'You can create up to 10 notes.'
      );
      return;
    }

    const newNote = template ? {
      ...defaultNote(),
      title: template.title,
      content: template.content,
      category: template.category
    } : defaultNote();

    setNotes([...notes, newNote]);

    // Hide templates when a note is created from a template
    if (template && onHideTemplates) {
      onHideTemplates();
    }
  }

  function handleContentChange(id: string, value: string) {
    setNotes(notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          content: value,
          updatedAt: new Date().toISOString(),
          version: n.version + 1
        };
      }
      return n;
    }));
  }

  function startRename(id: string, current: string) {
    setRenamingId(id);
    setRenameValue(current);
  }

  function handleRenameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRenameValue(e.target.value);
  }

  function finishRename(id: string) {
    setNotes(notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          title: renameValue.trim() || 'Untitled Note',
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
    setRenamingId(null);
    setRenameValue('');
  }

  function updateCategory(id: string, newCategory: string) {
    setNotes(notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          category: newCategory,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    }));
  }

  function exportNote(note: Note) {
    const content = `Title: ${note.title}\nCategory: ${note.category}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  function confirmDelete(id: string) {
    setShowDeleteId(id);
  }

  function deleteNote(id: string) {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    setShowDeleteId(null);
    if (updatedNotes.length === 0) {
      localStorage.removeItem(NOTES_KEY);
    }
    showSuccessToast('Note deleted', 'The note has been removed.');
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {showTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => addNote(template)}
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileText size={48} className="mb-4 text-primary/40" />
          <div className="text-lg font-semibold mb-1">{t('notes.noNotes')}</div>
          <div className="text-sm text-neutral-500 mb-2">{t('notes.clickAddNote')}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <div key={note.id} className="bg-card border rounded-lg shadow-sm overflow-hidden animate-fadeScaleIn transition-all hover:shadow-md">
              <div className="px-4 py-3 border-b">
                {renamingId === note.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={renameValue}
                      onChange={handleRenameChange}
                      onKeyDown={e => { if (e.key === 'Enter') finishRename(note.id); }}
                      autoFocus
                      className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t('notes.noteTitle')}
                    />
                    <Button
                      onClick={() => finishRename(note.id)}
                      variant="default"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setRenamingId(null);
                        setRenameValue('');
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3
                        className={`text-sm font-semibold truncate ${note.title === 'Untitled Note' ? 'text-muted-foreground cursor-pointer hover:text-foreground' : 'text-foreground cursor-pointer hover:text-primary'}`}
                        onClick={() => startRename(note.id, note.title)}
                        title="Click to rename"
                      >
                        {note.title}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`text-xs px-2 py-0.5 rounded border transition-colors ${CATEGORY_COLORS[note.category as keyof typeof CATEGORY_COLORS] || 'bg-muted text-muted-foreground'}`}>
                            {note.category}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {PREDEFINED_CATEGORIES.map(category => (
                            <DropdownMenuItem
                              key={category}
                              onClick={() => updateCategory(note.id, category)}
                              className="flex items-center gap-2"
                            >
                              <div className={`w-2 h-2 rounded-full ${CATEGORY_DOT_COLORS[category as keyof typeof CATEGORY_DOT_COLORS]}`} />
                              {category}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => startRename(note.id, note.title)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        title={t('common.rename')}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        onClick={() => exportNote(note)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-600"
                        title={t('common.exportNote')}
                      >
                        <Download size={12} />
                      </Button>
                      <Button
                        onClick={() => confirmDelete(note.id)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600"
                        title={t('common.delete')}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 py-3">
                <Textarea
                  className="w-full min-h-[280px] text-sm border rounded p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
                  value={note.content}
                  onChange={e => {
                    if (e.target.value.length > 500) {
                      showInfoToast('Character limit reached', 'Each note can be up to 500 characters.');
                      return;
                    }
                    handleContentChange(note.id, e.target.value);
                  }}
                  maxLength={500}
                  placeholder={t('notes.writeFinancialNotes')}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>{note.content.length} / 500</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              {/* Delete confirmation dialog for this note */}
              <Dialog open={showDeleteId === note.id} onOpenChange={(open) => !open && setShowDeleteId(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader className="text-left pb-3">
                    <DialogTitle className="text-xl font-bold text-foreground text-left">{t('common.deleteThisNote')}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      This action cannot be undone. The note will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="px-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {t('common.thisActionCannotBeUndone')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This will permanently remove this note from your collection.
                          </p>
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button variant="destructive" onClick={() => deleteNote(note.id)}>
                            Delete Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      )}
      {/* Floating Add Note Button */}
      <button
        onClick={() => addNote()}
        className="fixed bottom-16 right-6 w-14 h-14 rounded-full backdrop-blur-md bg-[#05d53d]/20 border border-[#05d53d]/30 shadow-2xl hover:bg-[#05d53d]/30 hover:border-[#05d53d]/50 hover:shadow-3xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#05d53d]/60 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center group"
        title={t('common.addNewNote')}
      >
        <PlusCircle size={28} className="text-[#05d53d] group-hover:text-white transition-colors duration-300 drop-shadow-sm" />
        <span className="sr-only">{t('common.addNewNote')}</span>
      </button>
    </div>
  );
};

export default Notes;
