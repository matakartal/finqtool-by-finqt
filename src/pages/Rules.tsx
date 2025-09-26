import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import Footer from '@/components/Footer';

const RULES_STORAGE_KEY = 'trading-rules';

function getInitialRules() {
  return [
    { id: 1, text: 'Check trend direction', done: false },
    { id: 2, text: 'Set stop-loss and target', done: false },
    { id: 3, text: 'Position size calculated', done: false },
    { id: 4, text: 'No news event imminent', done: false }
  ];
}

const Rules: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rules, setRules] = useState(getInitialRules());
  const [input, setInput] = useState('');

  // Load rules from storage on component mount
  useEffect(() => {
    const loadRules = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get([RULES_STORAGE_KEY]);
          if (result[RULES_STORAGE_KEY]) {
            setRules(result[RULES_STORAGE_KEY]);
          }
        } else {
          const savedRules = localStorage.getItem(RULES_STORAGE_KEY);
          if (savedRules) {
            setRules(JSON.parse(savedRules));
          }
        }
      } catch (error) {
        console.error('Error loading rules:', error);
      }
    };
    loadRules();
  }, []);

  // Save rules to storage whenever they change
  useEffect(() => {
    const saveRules = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({ [RULES_STORAGE_KEY]: rules });
        } else {
          localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
        }
      } catch (error) {
        console.error('Error saving rules:', error);
      }
    };
    saveRules();
  }, [rules]);

  const handleAdd = () => {
    if (input.trim() === '') {
      toast({
        title: t('common.error'),
        description: t('rules.emptyRuleError'),
        variant: "destructive"
      });
      return;
    }
    setRules([
      ...rules,
      { id: Date.now(), text: input.trim(), done: false }
    ]);
    setInput('');
  };

  const handleToggle = (id: number) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, done: !rule.done } : rule));
  };

  const handleDelete = (id: number) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const allDone = rules.length > 0 && rules.every(r => r.done);

  return (
    <>
      <div className="flex flex-col min-h-full bg-[#f5f5f7] dark:bg-[#121212]">
        <div className="flex-1 w-full max-w-4xl mx-auto py-4 px-4 space-y-3 animate-fade-in overflow-y-auto">
      <Card className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl">
        <CardHeader className="pb-0">
          <div className="flex mb-4 gap-2">
            <input
              className="flex-1 border border-border dark:border-zinc-700 bg-muted dark:bg-zinc-900 text-foreground dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-zinc-800"
              placeholder={t('rules.addRule')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            />
            <Button variant="default" className="flex items-center gap-1 h-10 px-4 py-2 text-sm font-medium rounded-md" onClick={handleAdd}>
              <PlusCircle size={16} /> {t('common.add')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4 py-3 bg-muted/40">
          <ul className="flex flex-col gap-2">
            {rules.map(rule => (
              <li key={rule.id} className={`flex items-center bg-neutral-50 dark:bg-muted rounded-xl px-3 py-2 border border-neutral-200 dark:border-border shadow-sm transition-all ${rule.done ? 'opacity-70' : ''}`}>
                <input
                  type="checkbox"
                  checked={rule.done}
                  onChange={() => handleToggle(rule.id)}
                  className="mr-3 accent-primary w-5 h-5"
                />
                <span className={`flex-1 text-sm font-medium ${rule.done ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-neutral-900 dark:text-neutral-100'}`}>{rule.text}</span>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 ml-2" onClick={() => handleDelete(rule.id)} title={t('common.delete')}>
                  <Trash2 size={16} />
                </Button>
              </li>
            ))}
          </ul>
          {allDone && (
            <div className="flex items-center justify-center mt-6">
              <span className="text-green-600 dark:text-green-400 text-base font-semibold flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                {t('rules.allChecked')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default Rules;
