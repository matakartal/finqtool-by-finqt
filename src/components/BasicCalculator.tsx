import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { showInfoToast, showSuccessToast } from '@/lib/notifications';

const BUTTONS = [
  [
    { text: 'C', type: 'action' },
    { text: '±', type: 'action' },
    { text: '%', type: 'action' },
    { text: '÷', type: 'operator' },
  ],
  [
    { text: '7', type: 'digit' },
    { text: '8', type: 'digit' },
    { text: '9', type: 'digit' },
    { text: '×', type: 'operator' },
  ],
  [
    { text: '4', type: 'digit' },
    { text: '5', type: 'digit' },
    { text: '6', type: 'digit' },
    { text: '-', type: 'operator' },
  ],
  [
    { text: '1', type: 'digit' },
    { text: '2', type: 'digit' },
    { text: '3', type: 'digit' },
    { text: '+', type: 'operator' },
  ],
  [
    { text: '0', type: 'digit', wide: true },
    { text: '.', type: 'digit' },
    { text: '=', type: 'operator' },
  ],
];

const BasicCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const isMobile = useIsMobile();

  const clearAll = () => {
    setDisplay('0');
    setCurrentValue('0');
    setOperator(null);
    setWaitingForOperand(false);
    showInfoToast("Calculator reset", "Reset");
  };

  const clearHistory = () => {
    setMemory([]);
    showInfoToast("History cleared", "Cleared");
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    setDisplay(display.charAt(0) === '-' ? display.substring(1) : '-' + display);
  };

  const inputPercent = () => {
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (currentValue === '0' && operator === null) {
      setCurrentValue(display);
    } else if (operator) {
      const result = calculate(parseFloat(currentValue), inputValue, operator);
      setDisplay(result.toString());
      setCurrentValue(result.toString());
      setMemory([...memory, `${currentValue} ${operator} ${inputValue} = ${result}`]);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : NaN;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (!operator) return;

    const inputValue = parseFloat(display);
    const result = calculate(parseFloat(currentValue), inputValue, operator);
    setDisplay(result.toString());
    setMemory([...memory, `${currentValue} ${operator} ${inputValue} = ${result}`]);
    
    showSuccessToast(`${currentValue} ${operator} ${inputValue} = ${result}`, "Calculation Result");
    
    setCurrentValue('0');
    setOperator(null);
    setWaitingForOperand(true);
  };

  const CalculatorButton = ({ text, className, onClick }: { text: string, className?: string, onClick: () => void }) => (
    <button
      className={`${className} backdrop-blur-sm font-medium text-base sm:text-xl h-12 sm:h-16 rounded-full transition-all focus:outline-none focus:ring-0 active:scale-95 ${text === '0' ? 'col-span-2' : ''}`}
      onClick={onClick}
    >
      {text}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      <Card className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl">
        <CardContent className="p-0">
          {/* Display */}
          <div className="flex flex-col gap-1 px-6 pt-8 pb-4">
            <div className="text-crypto-neutral-400 text-xs sm:text-sm min-h-[1.5em] text-right pr-1 select-none">
              {/* Show operation if present */}
              {operator && (
                <span>{currentValue} {operator}</span>
              )}
            </div>
            <div
              className="rounded-xl bg-black/20 dark:bg-black/40 border border-[rgba(255,255,255,0.13)] shadow-inner text-right text-3xl sm:text-5xl font-bold text-white dark:text-white px-4 py-5 sm:py-7 mb-2 focus:outline-none transition-all"
              tabIndex={0}
              aria-label="Calculator display"
            >
              {display}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-6">
            {BUTTONS.flat().map((btn, idx) => {
              const base =
                'rounded-full font-semibold text-lg sm:text-2xl h-14 sm:h-20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:scale-95 select-none';
              const color =
                btn.type === 'operator'
                  ? 'bg-[#ff9500]/90 text-white hover:bg-[#ff9500] shadow-orange-200/30'
                  : btn.type === 'action'
                  ? 'bg-[#a0a0a0]/80 text-white hover:bg-[#a0a0a0]'
                  : 'bg-[#323232]/80 text-white hover:bg-[#323232]';
              return (
                <button
                  key={btn.text + idx}
                  className={
                    base +
                    ' ' +
                    color +
                    (btn.wide ? ' col-span-2' : '')
                  }
                  style={btn.wide ? { gridColumn: 'span 2 / span 2' } : {}}
                  aria-label={btn.text === '÷' ? 'divide' : btn.text === '×' ? 'multiply' : btn.text}
                  onClick={() => {
                    if (btn.type === 'digit') {
                      if (btn.text === '.') inputDecimal();
                      else inputDigit(btn.text);
                    } else if (btn.type === 'action') {
                      if (btn.text === 'C') clearAll();
                      else if (btn.text === '±') toggleSign();
                      else if (btn.text === '%') inputPercent();
                    } else if (btn.type === 'operator') {
                      if (btn.text === '=') handleEquals();
                      else performOperation(btn.text);
                    }
                  }}
                  tabIndex={0}
                >
                  {btn.text}
                </button>
              );
            })}
          </div>

          {/* History */}
          {memory.length > 0 && (
            <div className="bg-white/40 dark:bg-[#23232a]/70 rounded-b-2xl border-t border-[rgba(255,255,255,0.08)] px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-crypto-neutral-400">History</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-8 px-2 text-crypto-neutral-400 hover:text-crypto-neutral-200 focus:ring-0"
                  onClick={clearHistory}
                  aria-label="Clear history"
                >
                  <Trash2 size={isMobile ? 12 : 14} className="mr-1" />
                  Clear
                </Button>
              </div>
              <div className="max-h-32 sm:max-h-44 overflow-y-auto space-y-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] p-2 bg-black/10 dark:bg-black/20">
                {memory.map((item, index) => (
                  <div
                    key={index}
                    className="text-[10px] sm:text-xs p-1.5 sm:p-2.5 bg-black/10 dark:bg-black/30 rounded-md"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicCalculator;
