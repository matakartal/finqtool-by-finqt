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
    <div>
      <Card className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl">
        <CardContent className="p-0">
          {/* Display */}
          <div className="flex flex-col gap-1.5 px-4 py-3 sm:py-4">
            <div className="flex items-center justify-end min-h-[1rem] sm:min-h-[1.25rem]">
              <div className="text-neutral-500 dark:text-neutral-400 text-xs font-medium select-none">
                {/* Show operation if present */}
                {operator && (
                  <span className="opacity-75">{currentValue} {operator}</span>
                )}
              </div>
            </div>
            <div
              className="rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-right text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white px-3 py-3 sm:py-4 focus:outline-none transition-all shadow-sm"
              tabIndex={0}
              aria-label="Calculator display"
            >
              {display}
            </div>
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 px-4 pb-4 sm:pb-6">
            {BUTTONS.flat().map((btn, idx) => {
              const base =
                'rounded-lg font-semibold text-base sm:text-lg lg:text-xl h-11 sm:h-12 lg:h-16 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 select-none shadow-sm';
              const color =
                btn.type === 'operator'
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : btn.type === 'action'
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-600';
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

          {/* History/Results */}
          {memory.length > 0 && (
            <div className="px-4 pb-4">
              <div className="mt-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-scale-in">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Calculation History</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 border-neutral-300 dark:border-neutral-600 hover:border-red-300 dark:hover:border-red-500"
                    onClick={clearHistory}
                    aria-label="Clear history"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Clear All
                  </Button>
                </div>

                <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-2">
                  {memory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 flex-1 break-all">
                        {item}
                      </span>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 ml-2 flex-shrink-0">
                        #{memory.length - index}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                  <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Total calculations: {memory.length}</span>
                    <span>Most recent first</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicCalculator;
