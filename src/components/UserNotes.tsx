import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Pencil, PlusCircle, Search, Tag, History, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast, showInfoToast } from '@/lib/notifications';

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
    content: 'Entry Price: \nStop Loss: \nTake Profit: \nPosition Size: \nRisk/Reward: \nNotes:',
    category: 'Trading'
  },
  {
    id: 'template2',
    title: 'Market Analysis',
    content: 'Market Trend: \nSupport Levels: \nResistance Levels: \nVolume Analysis: \nKey Indicators: \nConclusion:',
    category: 'Analysis'
  },
  {
    id: 'template3',
    title: 'Risk Management',
    content: 'Account Size: \nRisk Per Trade: \nMaximum Drawdown: \nPosition Sizing: \nStop Loss Strategy: \nNotes:',
    category: 'Risk'
  }
];

const MAX_NOTES = 10;
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

const UserNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [templates, setTemplates] = useState<NoteTemplate[]>(defaultTemplates);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

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
    <div className="w-full max-w-4xl mx-auto py-2 space-y-4 animate-fade-in">
      <div className="flex flex-col items-start gap-2 mb-4 px-2 sm:px-0">
        <div className="flex items-center gap-2">
          <FileText size={22} className="text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-foreground tracking-tight">Notes</h2>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
          Keep track of your trading ideas, market observations, and important reminders. Your notes are private and stored securely.
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-2 bg-white dark:bg-[#232323] border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <FileText size={16} />
          {showTemplates ? 'Hide Templates' : 'Show Templates'}
        </Button>
      </div>

      {showTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {templates.map(template => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-lg transition-all bg-white dark:bg-[#232323] border-neutral-200 dark:border-neutral-700"
              onClick={() => addNote(template)}
            >
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{template.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{template.category}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3">{template.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FileText size={48} className="mb-4 text-primary/40" />
          <div className="text-lg font-semibold mb-1">No notes yet</div>
          <div className="text-sm text-neutral-500 mb-2">Click "+ Add Note" to create your first note.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(note => (
            <Card key={note.id} className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl">
              <CardHeader className="px-3 pt-2 pb-2 flex flex-row items-center gap-2 border-b bg-gradient-to-r from-white via-neutral-50 to-white dark:from-[#232526] dark:via-[#18191a] dark:to-[#232526]">
                {renamingId === note.id ? (
                  <input
                    value={renameValue}
                    onChange={handleRenameChange}
                    onBlur={() => finishRename(note.id)}
                    onKeyDown={e => { if (e.key === 'Enter') finishRename(note.id); }}
                    autoFocus
                    className="w-full px-2 py-1 rounded bg-white dark:bg-muted border text-lg font-semibold outline-none focus:ring-2 focus:ring-primary max-w-xs"
                    placeholder="Note Title"
                  />
                ) : (
                  <>
                    <div className="flex flex-row items-center gap-2 min-w-0 flex-grow">
                      <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">{note.title}</span>
                      <Button
                        onClick={() => startRename(note.id, note.title)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-primary"
                        title="Rename"
                      >
                        <Pencil size={15} />
                        <span className="sr-only">Rename</span>
                      </Button>
                    </div>
                    <div className="flex flex-row items-center gap-2 ml-auto">
                      <Button
                        onClick={() => confirmDelete(note.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => exportNote(note)}
                        className="h-8 w-8"
                        title="Export note"
                      >
                        <Download size={16} />
                        <span className="sr-only">Export Note</span>
                      </Button>
                    </div>
                  </>
                )}
              </CardHeader>
              <CardContent className="flex flex-col px-6 py-5 bg-muted/40">
                <Textarea
                  className="w-full min-h-[180px] rounded-lg border border-neutral-200 dark:border-border p-3 text-base focus:outline-none focus:ring-2 focus:ring-primary bg-neutral-50 dark:bg-muted resize-vertical shadow font-medium"
                  value={note.content}
                  onChange={e => {
                    if (e.target.value.length > 500) {
                      showInfoToast('Character limit reached', 'Each note can be up to 500 characters.');
                      return;
                    }
                    handleContentChange(note.id, e.target.value);
                  }}
                  maxLength={500}
                  placeholder="Write your financial notes here..."
                  style={{ fontFamily: 'inherit', fontWeight: 500 }}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-neutral-400">{note.content.length} / 500</div>
                  <div className="text-xs text-neutral-400">
                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              {/* Delete confirmation dialog for this note */}
              {showDeleteId === note.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white dark:bg-muted rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center">
                    <Trash2 size={32} className="mb-2 text-red-500" />
                    <div className="font-semibold text-lg mb-1">Delete this note?</div>
                    <div className="text-sm text-muted-foreground mb-4 text-center">This action cannot be undone.</div>
                    <div className="flex gap-3">
                      <Button variant="destructive" onClick={() => deleteNote(note.id)}>Delete</Button>
                      <Button variant="outline" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      {/* Floating Add Note Button */}
      <button
        onClick={() => addNote()}
        className="fixed bottom-16 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        title="Add new note"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Note
      </button>
    </div>
  );
};

export default UserNotes;

