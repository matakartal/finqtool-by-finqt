import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { showInfoToast, showSuccessToast } from '@/lib/notifications';

const MAX_DISPLAY_LENGTH = 15;
const MAX_HISTORY_LENGTH = 50;

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

// Utility functions for better number handling
const formatNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return 'Error';

  const str = num.toString();
  if (str.length > MAX_DISPLAY_LENGTH) {
    // Use scientific notation for very large/small numbers
    return num.toExponential(6);
  }

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = str.split('.');

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Handle decimal places intelligently
  if (decimalPart !== undefined) {
    const decimalPlaces = Math.min(8, MAX_DISPLAY_LENGTH - formattedInteger.length - 1);
    const trimmedDecimal = decimalPart.substring(0, decimalPlaces).replace(/0+$/, '');
    return trimmedDecimal ? `${formattedInteger}.${trimmedDecimal}` : formattedInteger;
  }

  return formattedInteger;
};

const isValidNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

const BasicCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<string[]>([]);
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Improved clear functions
  const clearAll = useCallback(() => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setLastOperation(null);
    showInfoToast("Calculator reset", "Reset");
  }, []);

  const clearHistory = useCallback(() => {
    setMemory([]);
    showInfoToast("History cleared", "Cleared");
  }, []);

  // Enhanced input validation and digit handling
  const inputDigit = useCallback((digit: string) => {
    if (display.length >= MAX_DISPLAY_LENGTH && !waitingForOperand) {
      showInfoToast("Maximum digits reached", "Cannot enter more digits");
      return;
    }

    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === '0' ? digit : display + digit;
      if (isValidNumber(newDisplay)) {
        setDisplay(newDisplay);
      }
    }
  }, [display, waitingForOperand]);

  // Improved decimal input with better validation
  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1 && display.length < MAX_DISPLAY_LENGTH) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  // Enhanced sign toggle
  const toggleSign = useCallback(() => {
    if (display === '0' || display === 'Error') return;

    const newDisplay = display.startsWith('-') ? display.substring(1) : '-' + display;
    if (isValidNumber(newDisplay)) {
      setDisplay(newDisplay);
    }
  }, [display]);

  // Improved percent calculation
  const inputPercent = useCallback(() => {
    const currentValue = parseFloat(display);
    if (!isNaN(currentValue)) {
      const percentValue = currentValue / 100;
      setDisplay(formatNumber(percentValue));
    }
  }, [display]);

  // Enhanced calculation with better precision handling
  const calculate = useCallback((firstValue: number, secondValue: number, operation: string): number => {
    // Use higher precision arithmetic to avoid floating point issues
    const precision = 1000000000; // 9 decimal places

    switch (operation) {
      case '+':
        return Math.round((firstValue + secondValue) * precision) / precision;
      case '-':
        return Math.round((firstValue - secondValue) * precision) / precision;
      case '×':
        return Math.round((firstValue * secondValue) * precision) / precision;
      case '÷':
        if (secondValue === 0) {
          showInfoToast("Division by zero", "Cannot divide by zero");
          return NaN;
        }
        return Math.round((firstValue / secondValue) * precision) / precision;
      default:
        return secondValue;
    }
  }, []);

  // Improved operation handling
  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (isNaN(inputValue)) return;

    if (storedValue === null || waitingForOperand) {
      // First operation or continuing after equals - use current display value
      setStoredValue(inputValue);
    } else if (operator) {
      // Chain operations - update stored value without calculating
      setStoredValue(inputValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
    setLastOperation(`${formatNumber(inputValue)} ${nextOperator}`);
  }, [display, storedValue, operator, waitingForOperand]);

  // Enhanced equals handling with better result management
  const handleEquals = useCallback(() => {
    if (!operator || storedValue === null) return;

    const inputValue = parseFloat(display);
    if (isNaN(inputValue)) return;

    const result = calculate(storedValue, inputValue, operator);

    if (!isNaN(result)) {
      const formattedResult = formatNumber(result);
      setDisplay(result.toString());

      const calculation = `${formatNumber(storedValue)} ${operator} ${formatNumber(inputValue)} = ${formattedResult}`;
      setMemory(prev => [calculation, ...prev.slice(0, MAX_HISTORY_LENGTH - 1)]);

      showSuccessToast(calculation, "Calculation Result");

      // Prepare for next calculation
      setStoredValue(result);
      setWaitingForOperand(true);
      setOperator(null);
      setLastOperation(null);
    }
  }, [display, storedValue, operator, calculate]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;

      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === 'x' || key === 'X' || key === '/') {
        const operatorMap: { [key: string]: string } = {
          '*': '×',
          'x': '×',
          'X': '×',
          '/': '÷'
        };
        performOperation(operatorMap[key] || key);
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
      } else if (key === 'Backspace') {
        // Remove last digit
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay('0');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [inputDigit, inputDecimal, performOperation, handleEquals, clearAll, display]);

  const CalculatorButton = ({ text, className, onClick }: { text: string, className?: string, onClick: () => void }) => (
    <button
      className={`${className} backdrop-blur-sm font-medium text-base sm:text-xl h-12 sm:h-16 rounded-full transition-all focus:outline-none focus:ring-0 active:scale-[0.998] ${text === '0' ? 'col-span-2' : ''}`}
      onClick={onClick}
    >
      {text}
    </button>
  );

  return (
    <div>
      <Card className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card overflow-hidden animate-fadeScaleIn transition-all">
        <CardContent className="p-0">
          {/* Display */}
          <div className="flex flex-col gap-1.5 px-4 py-3 sm:py-4">
            <div className="flex items-center justify-end min-h-[1rem] sm:min-h-[1.25rem]">
              <div className="text-neutral-500 dark:text-neutral-400 text-xs font-medium select-none">
                {/* Show current operation */}
                {operator && storedValue !== null && (
                  <span className="opacity-75">
                    {formatNumber(storedValue)} {operator}
                  </span>
                )}
              </div>
            </div>
            <div
              className="rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-right text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white px-3 py-3 sm:py-4 focus:outline-none transition-all overflow-hidden"
              tabIndex={0}
              aria-label="Calculator display"
            >
              <div className="truncate">
                {display === 'Error' ? 'Error' : formatNumber(parseFloat(display) || 0)}
              </div>
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

                <div className="space-y-2">
                  {memory.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md transition-all"
                    >
                      <span className="text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 flex-1 break-all">
                        {item}
                      </span>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 ml-2 flex-shrink-0">
                        #{index + 1}
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
