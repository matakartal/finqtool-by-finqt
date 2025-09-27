import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Pencil, PlusCircle, Search, Tag, History, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    title: 'Trade Setup',
    content: `TRADE SETUP
Entry Price:
Target Price:
Stop Loss:
Position Size:
Risk/Reward:

Analysis:
• Trend:
• Timeframe:
• Indicators:

Trade Plan:
• Entry Signal:
• Exit Strategy:
• Risk Management:

Notes:`,
    category: 'Trading'
  },
  {
    id: 'template2',
    title: 'Market Analysis',
    content: `MARKET ANALYSIS
Current Trend:
Key Levels:
• Support:
• Resistance:
• Pivot Point:

Technical Indicators:
• RSI(14):
• MACD:
• Moving Averages:
• Volume:

Price Action:
• Recent High/Low:
• Current Price:

Market Sentiment:
Conclusion:`,
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
    title: 'Performance Review',
    content: `TRADING PERFORMANCE REVIEW
Period:
Total Trading Days:

Financial Results:
• Starting Balance:
• Ending Balance:
• Net P&L:
• Best/Worst Day:

Trade Statistics:
• Total Trades:
• Winning Trades:
• Losing Trades:
• Average Win/Loss:
• Profit Factor:
• Expectancy:

Risk Metrics:
• Max Drawdown:
• Sharpe Ratio:
• Win/Loss Ratio:

Top Performing:
• Best Trade:
• Most Traded:
• Highest Win Rate:

Lessons Learned:
• What worked well:
• What needs improvement:
• Strategy adjustments:
• Goals for next period:`,
    category: 'Analysis'
  },
  {
    id: 'template5',
    title: 'Market News Tracker',
    content: `MARKET NEWS ANALYSIS
Date/Time:

News Event:
• Headline:
• Source:
• Expected Impact:

Market Impact:
• Affected Assets:
• Expected Volatility:
• Direction Bias:
• Timeframe:

Price Reaction:
• Pre-News Price:
• Post-News Target:
• Stop Loss:

Trading Plan:
• Entry Strategy:
• Position Size:
• Risk Management:
• Exit Strategy:

Follow-up Notes:
• Actual Impact:
• Price Movement:
• Lesson Learned:`,
    category: 'Trading'
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
  'Trading': 'bg-blue-500/20 border-blue-400/50 text-blue-100 hover:bg-blue-500/30',
  'Analysis': 'bg-green-500/20 border-green-400/50 text-green-100 hover:bg-green-500/30',
  'Risk': 'bg-red-500/20 border-red-400/50 text-red-100 hover:bg-red-500/30',
  'Strategy': 'bg-purple-500/20 border-purple-400/50 text-purple-100 hover:bg-purple-500/30',
  'Psychology': 'bg-pink-500/20 border-pink-400/50 text-pink-100 hover:bg-pink-500/30',
  'Education': 'bg-yellow-500/20 border-yellow-400/50 text-yellow-100 hover:bg-yellow-500/30',
  'General': 'bg-gray-500/20 border-gray-400/50 text-gray-100 hover:bg-gray-500/30'
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
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save notes and templates to localStorage
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    localStorage.setItem(NOTE_TEMPLATES_KEY, JSON.stringify(templates));
  }, [notes, templates]);

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
            <div key={note.id} className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl">
              <div className="bg-black backdrop-blur-lg border-b border-zinc-800 px-4 pt-3 pb-3 flex flex-row items-center gap-3">
                {renamingId === note.id ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      value={renameValue}
                      onChange={handleRenameChange}
                      onKeyDown={e => { if (e.key === 'Enter') finishRename(note.id); }}
                      autoFocus
                      className="flex-1 px-3 py-2 rounded bg-white dark:bg-muted border text-sm font-medium outline-none focus:ring-2 focus:ring-primary min-w-0"
                      placeholder={t('notes.noteTitle')}
                    />
                    <Button
                      onClick={() => finishRename(note.id)}
                      variant="default"
                      size="sm"
                      className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                      title="Save"
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
                      className="h-8 px-3 border-white/20 text-white/90 hover:text-white hover:bg-white/10 flex-shrink-0"
                      title="Cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <span className="text-sm font-medium text-white truncate">{note.title}</span>
                      <Button
                        onClick={() => startRename(note.id, note.title)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                        title={t('common.rename')}
                      >
                        <Pencil size={12} />
                        <span className="sr-only">{t('common.rename')}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`text-xs flex-shrink-0 border ml-1 px-2 py-0.5 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 ${CATEGORY_COLORS[note.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500/20 border-gray-400/50 text-gray-100 hover:bg-gray-500/30'}`}
                          >
                            {note.category}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40 z-[60]">
                          {PREDEFINED_CATEGORIES.map(category => (
                            <DropdownMenuItem
                              key={category}
                              onClick={() => updateCategory(note.id, category)}
                              className={`flex items-center gap-2 ${note.category === category ? 'bg-muted' : ''}`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${CATEGORY_DOT_COLORS[category as keyof typeof CATEGORY_DOT_COLORS]}`}
                              />
                              {category}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        onClick={() => confirmDelete(note.id)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/70 hover:text-red-400 hover:bg-white/10"
                        title={t('common.delete')}
                      >
                        <Trash2 size={12} />
                        <span className="sr-only">{t('common.delete')}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => exportNote(note)}
                        className="h-6 w-6 border-white/20 text-green-500 hover:text-green-400 hover:bg-black/10 dark:hover:bg-white/10"
                        title={t('common.exportNote')}
                      >
                        <Download size={12} />
                        <span className="sr-only">{t('common.exportNote')}</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col px-4 py-4 bg-muted/40">
                <Textarea
                  className="w-full min-h-[340px] rounded-lg border border-neutral-200 dark:border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-muted resize-vertical font-medium"
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
                  style={{ fontFamily: 'inherit', fontWeight: 500 }}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-muted-foreground">{note.content.length} / 500</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {/* Delete confirmation dialog for this note */}
              {showDeleteId === note.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center border border-neutral-200 dark:border-border">
                    <Trash2 size={32} className="mb-3 text-red-500" />
                    <div className="font-semibold text-lg mb-2 text-center">{t('common.deleteThisNote')}</div>
                    <div className="text-sm text-muted-foreground mb-4 text-center">{t('common.thisActionCannotBeUndone')}</div>
                    <div className="flex gap-3">
                      <Button variant="destructive" onClick={() => deleteNote(note.id)}>Delete</Button>
                      <Button variant="outline" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Floating Add Note Button */}
      <button
        onClick={() => addNote()}
        className="fixed bottom-16 right-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center"
        title={t('common.addNewNote')}
      >
        <PlusCircle size={32} />
        <span className="sr-only">{t('common.addNewNote')}</span>
      </button>
    </div>
  );
};

export default Notes;
