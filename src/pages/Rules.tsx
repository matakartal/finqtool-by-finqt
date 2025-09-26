import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

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
      <div className="w-full max-w-4xl mx-auto py-2">
        <div className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn">
          <div className="bg-black backdrop-blur-lg border-b border-zinc-800 px-3 md:px-6 pt-3 sm:pt-2 pb-3 rounded-t-xl shadow-sm">
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                placeholder={t('rules.addRule')}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg py-1.5 px-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all flex-1 shadow-sm"
                style={{ fontFamily: 'inherit', fontWeight: 500 }}
              />
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-crypto-green text-white hover:bg-green-600 border border-crypto-green transition-all focus:outline-none focus:ring-2 focus:ring-crypto-green"
                aria-label="Add rule"
              >
                <PlusCircle size={16} />
              </button>
            </div>
          </div>
          {rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No rules added yet.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2 text-left">Rules</TableHead>
                    <TableHead className="px-2 py-2 text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map(rule => (
                    <TableRow key={rule.id} className="hover:bg-muted/50">
                      <TableCell className="px-2 py-2 text-left">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={rule.done}
                            onChange={() => handleToggle(rule.id)}
                            className="accent-primary w-5 h-5"
                          />
                          <span className={`text-sm font-medium ${rule.done ? 'line-through text-zinc-400 dark:text-zinc-500 opacity-70' : 'text-neutral-900 dark:text-foreground'}`}>
                            {rule.text}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 py-2 text-right w-[80px]">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                          onClick={() => handleDelete(rule.id)}
                          title={t('common.delete')}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="text-xs text-muted-foreground text-center p-2 bg-muted/40 rounded-b-xl">
                      {allDone ? (
                        <span className="text-crypto-green dark:text-green-400 text-xs font-semibold flex items-center justify-center gap-2">
                          All rules checked. Ready to trade.
                        </span>
                      ) : (
                        `${rules.filter(r => r.done).length}/${rules.length} rules completed`
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Rules;
