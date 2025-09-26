import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Calculator, TrendingUp, BarChart3, DollarSign, ArrowDownUp, PlusCircle, Trash, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { showSuccessToast, showInfoToast } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';

const FinancialCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [calculatorType, setCalculatorType] = useState('pnl');

  return (
    <div className="w-full max-w-4xl mx-auto py-1 space-y-3 animate-fade-in">
      <Card className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl">
        <div className="px-3 sm:px-4 pt-3">
          <Tabs defaultValue="pnl" className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-3 bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-lg">
              <TabsTrigger 
                value="pnl" 
                className="text-xs sm:text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100"
              >
                {t('financial.calculator.tabs.pnl')}
              </TabsTrigger>
              <TabsTrigger 
                value="breakeven" 
                className="text-xs sm:text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100"
              >
                {t('financial.calculator.tabs.breakeven')}
              </TabsTrigger>
              <TabsTrigger 
                value="position" 
                className="text-xs sm:text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100"
              >
                {t('financial.calculator.tabs.position')}
              </TabsTrigger>
              <TabsTrigger 
                value="drawdown" 
                className="text-xs sm:text-sm transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100"
              >
                {t('financial.calculator.tabs.drawdown')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pnl" className="animate-fade-in">
              <ProfitLossCalculator />
            </TabsContent>
            
            <TabsContent value="breakeven" className="animate-fade-in">
              <BreakevenCalculator />
            </TabsContent>
            
            <TabsContent value="position" className="animate-fade-in">
              <PositionSizeCalculator />
            </TabsContent>
            
            <TabsContent value="drawdown" className="animate-fade-in">
              <DrawdownCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

// Update the result card styles in each calculator component
const resultCardStyles = "mt-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-scale-in";
const resultLabelStyles = "text-sm text-neutral-600 dark:text-neutral-400";
const resultValueStyles = "text-xl font-bold text-neutral-900 dark:text-neutral-100";
const resultSubtextStyles = "text-xs mt-1 text-neutral-500 dark:text-neutral-400";

// Update the input styles
const inputStyles = "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary dark:focus:border-primary";
const labelStyles = "text-sm font-medium text-neutral-700 dark:text-neutral-300";

// Update the select styles
const selectStyles = "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:border-primary dark:focus:border-primary";

// Update the button styles
const buttonStyles = "w-full mt-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.01] shadow-sm";

// Update the switch styles
const switchStyles = "data-[state=checked]:bg-primary";

// Update the info text styles
const infoTextStyles = "text-xs text-neutral-600 dark:text-neutral-400";

// Profit/Loss Calculator Component
const ProfitLossCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [position, setPosition] = useState('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [fee, setFee] = useState('0.1');
  const [includeFees, setIncludeFees] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [result, setResult] = useState<{
    pl: string;
    roi: string;
    effectiveCost: string;
    profit: boolean;
    breakEven: string;
  } | null>(null);

  const calculateResults = () => {
    if (!entryPrice || !positionSize || !exitPrice) {
      showInfoToast(t('financial.calculator.messages.incompleteInfo'), t('financial.calculator.messages.missingData'));
      return;
    }
    
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const size = parseFloat(positionSize);
    const lev = parseFloat(leverage);
    const feePercentage = includeFees ? parseFloat(fee) / 100 : 0;

    const entryFee = entry * size * feePercentage;
    const exitFee = exit * size * feePercentage;
    const totalFees = entryFee + exitFee;

    const effectiveCost = entry * size / lev;

    let pl;
    if (position === 'long') {
      pl = (exit - entry) * size * lev - totalFees;
    } else {
      pl = (entry - exit) * size * lev - totalFees;
    }

    const roi = pl / effectiveCost * 100;

    let breakEven;
    if (position === 'long') {
      breakEven = entry * (1 + feePercentage * 2);
    } else {
      breakEven = entry * (1 - feePercentage * 2);
    }
    setResult({
      pl: pl.toFixed(2),
      roi: roi.toFixed(2),
      effectiveCost: effectiveCost.toFixed(2),
      profit: pl > 0,
      breakEven: breakEven.toFixed(2)
    });

    showSuccessToast(
      `${t('financial.calculator.messages.calculationComplete')}: $${pl.toFixed(2)} (${t('financial.calculator.labels.roi')}: ${roi.toFixed(2)}%)`,
      t('financial.calculator.messages.calculationComplete')
    );
  };

  const togglePosition = () => {
    setPosition(position === 'long' ? 'short' : 'long');
  };
  return <CardContent className="pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <Label htmlFor="entry-price" className={labelStyles}>{t('financial.calculator.labels.entryPrice')}</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
            <Input 
              id="entry-price" 
              type="number" 
              placeholder="0.00" 
              className={`pl-6 ${inputStyles}`}
              value={entryPrice} 
              onChange={e => setEntryPrice(e.target.value)} 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="exit-price" className={labelStyles}>{t('financial.calculator.labels.exitPrice')}</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
            <Input 
              id="exit-price" 
              type="number" 
              placeholder="0.00" 
              className={`pl-6 ${inputStyles}`}
              value={exitPrice} 
              onChange={e => setExitPrice(e.target.value)} 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="quantity" className={labelStyles}>{t('financial.calculator.labels.quantity')}</Label>
          <Input 
            id="quantity" 
            type="number" 
            placeholder="0.00" 
            className={inputStyles}
            value={positionSize} 
            onChange={e => setPositionSize(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="leverage" className={labelStyles}>{t('financial.calculator.labels.leverage')}</Label>
          <Select value={leverage} onValueChange={setLeverage}>
            <SelectTrigger id="leverage" className={selectStyles}>
              <SelectValue placeholder={t('financial.calculator.labels.leverage')} />
            </SelectTrigger>
            <SelectContent className={selectStyles}>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="3">3x</SelectItem>
              <SelectItem value="5">5x</SelectItem>
              <SelectItem value="10">10x</SelectItem>
              <SelectItem value="20">20x</SelectItem>
              <SelectItem value="50">50x</SelectItem>
              <SelectItem value="100">100x</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="fee-percentage" className={labelStyles}>{t('financial.calculator.labels.tradingFees')}</Label>
          <Input 
            id="fee-percentage" 
            type="number" 
            placeholder="0.1" 
            className={inputStyles}
            value={fee} 
            onChange={e => setFee(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-6">
          <Switch 
            id="include-fees" 
            checked={includeFees} 
            onCheckedChange={setIncludeFees}
            className={switchStyles}
          />
          <Label htmlFor="include-fees" className={labelStyles}>{t('financial.calculator.labels.includeFees')}</Label>
        </div>
      </div>
      
      <Button
        className={buttonStyles}
        onClick={calculateResults}
      >
        {t('financial.calculator.labels.calculate')}
      </Button>
      
      {result && (
        <div className={resultCardStyles}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{t('financial.calculator.labels.results')}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              {showDetails ? t('financial.calculator.labels.hideDetails') : t('financial.calculator.labels.showDetails')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={resultLabelStyles}>{t('financial.calculator.labels.profitLoss')}</p>
              <p className={`text-xl font-bold ${result.profit ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${result.pl}
              </p>
            </div>
            
            <div>
              <p className={resultLabelStyles}>{t('financial.calculator.labels.roi')}</p>
              <p className={`text-xl font-bold ${parseFloat(result.roi) > 0 ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.roi}%
              </p>
            </div>
            
            {showDetails && (
              <>
                <div>
                  <p className={resultLabelStyles}>{t('financial.calculator.labels.effectiveCost')}</p>
                  <p className={resultValueStyles}>
                    ${result.effectiveCost}
                  </p>
                </div>
                
                <div>
                  <p className={resultLabelStyles}>{t('financial.calculator.labels.breakEvenPrice')}</p>
                  <p className={resultValueStyles}>
                    ${result.breakEven}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </CardContent>;
};

// Breakeven Calculator Component
const BreakevenCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [position, setPosition] = useState('long');
  const [entries, setEntries] = useState([
    { price: '', quantity: '', fee: '0.1' }
  ]);
  const [fees, setFees] = useState('0.1');
  const [result, setResult] = useState<{
    breakEvenPrice: string;
    totalQuantity: string;
    totalCost: string;
  } | null>(null);

  const addEntry = () => {
    setEntries([...entries, { price: '', quantity: '', fee: fees }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      const newEntries = [...entries];
      newEntries.splice(index, 1);
      setEntries(newEntries);
    }
  };

  const updateEntry = (index: number, field: 'price' | 'quantity' | 'fee', value: string) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
    
    if (field === 'fee') {
      setFees(value);
    }
  };

  const calculateBreakeven = () => {
    for (const entry of entries) {
      if (!entry.price || !entry.quantity) {
        showInfoToast(t('financial.calculator.messages.missingData'), t('financial.calculator.messages.incompleteInfo'));
        return;
      }
    }

    let totalCost = 0;
    let totalQuantity = 0;

    if (position === 'long') {
      for (const entry of entries) {
        const price = parseFloat(entry.price);
        const quantity = parseFloat(entry.quantity);
        const feeRate = parseFloat(entry.fee) / 100;
        
        const entryCost = price * quantity;
        const entryFees = entryCost * feeRate;
        
        totalCost += entryCost + entryFees;
        totalQuantity += quantity;
      }
      
      const avgFeeRate = parseFloat(fees) / 100;
      const breakEvenBeforeFees = totalCost / totalQuantity;
      const breakEvenPrice = breakEvenBeforeFees * (1 + avgFeeRate);
      
      setResult({
        breakEvenPrice: breakEvenPrice.toFixed(8),
        totalQuantity: totalQuantity.toFixed(8),
        totalCost: totalCost.toFixed(2)
      });
    } else {
      for (const entry of entries) {
        const price = parseFloat(entry.price);
        const quantity = parseFloat(entry.quantity);
        const feeRate = parseFloat(entry.fee) / 100;
        
        const entryCredit = price * quantity;
        const entryFees = entryCredit * feeRate;
        
        totalCost += entryCredit - entryFees;
        totalQuantity += quantity;
      }
      
      const avgFeeRate = parseFloat(fees) / 100;
      const breakEvenBeforeFees = totalCost / totalQuantity;
      const breakEvenPrice = breakEvenBeforeFees * (1 - avgFeeRate);
      
      setResult({
        breakEvenPrice: breakEvenPrice.toFixed(8),
        totalQuantity: totalQuantity.toFixed(8),
        totalCost: totalCost.toFixed(2)
      });
    }
  };

  return (
    <CardContent className="pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <Label htmlFor="position-type" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.positionType')}
          </Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger id="position-type" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectValue placeholder={t('financial.calculator.labels.positionType')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="default-fee" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.defaultFeeRate')}
          </Label>
          <Input
            id="default-fee"
            type="number"
            placeholder="0.1"
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 mt-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.entryPositions')}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEntry}
            className="flex items-center text-xs bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          >
            <PlusCircle size={14} className="mr-1" />
            {t('financial.calculator.labels.addEntry')}
          </Button>
        </div>

        {entries.map((entry, index) => (
          <div key={index} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {t('financial.calculator.labels.entry')} #{index + 1}
              </h4>
              {entries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(index)}
                  className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500"
                >
                  <Trash size={14} />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label htmlFor={`entry-price-${index}`} className="text-xs text-neutral-700 dark:text-neutral-300">
                  {t('financial.calculator.labels.price')}
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                  <Input
                    id={`entry-price-${index}`}
                    type="number"
                    placeholder="0.00"
                    className="pl-6 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                    value={entry.price}
                    onChange={(e) => updateEntry(index, 'price', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`entry-quantity-${index}`} className="text-xs text-neutral-700 dark:text-neutral-300">
                  {t('financial.calculator.labels.quantity')}
                </Label>
                <Input
                  id={`entry-quantity-${index}`}
                  type="number"
                  placeholder="0.00"
                  className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  value={entry.quantity}
                  onChange={(e) => updateEntry(index, 'quantity', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`entry-fee-${index}`} className="text-xs text-neutral-700 dark:text-neutral-300">
                  {t('financial.calculator.labels.fee')}
                </Label>
                <Input
                  id={`entry-fee-${index}`}
                  type="number"
                  placeholder="0.1"
                  className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  value={entry.fee}
                  onChange={(e) => updateEntry(index, 'fee', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button 
        className="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.01] shadow-sm" 
        onClick={calculateBreakeven}
      >
        {t('financial.calculator.labels.calculateBreakeven')}
      </Button>

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.breakEvenPrice')}
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                ${result.breakEvenPrice}
              </p>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.messages.breakEvenInfo')}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.totalQuantity')}
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {result.totalQuantity}
              </p>
            </div>

            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {position === 'long' ? t('financial.calculator.labels.totalCost') : t('financial.calculator.labels.totalCredit')}
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                ${result.totalCost}
              </p>
            </div>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 flex items-start">
            <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
            <span>
              {position === 'long'
                ? t('financial.calculator.messages.breakEvenInfo')
                : t('financial.calculator.messages.shortBreakEvenInfo')}
            </span>
          </div>
        </div>
      )}
    </CardContent>
  );
};

// Position Size Calculator Component
const PositionSizeCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [accountSize, setAccountSize] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('1');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [result, setResult] = useState<{
    positionSize: string;
    riskAmount: string;
    liquidationPrice: string;
  } | null>(null);

  const calculatePositionSize = () => {
    if (!accountSize || !entryPrice || !stopLoss) {
      showInfoToast(t('financial.calculator.messages.missingFields'), t('financial.calculator.messages.missingData'));
      return;
    }
    
    const account = parseFloat(accountSize);
    const risk = parseFloat(riskPercentage) / 100;
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const lev = parseFloat(leverage);

    const riskAmount = account * risk;
    const priceDiff = Math.abs(entry - stop);
    const positionSize = riskAmount / priceDiff * lev;

    const isLong = entry > stop;
    const liquidationPercentage = 1 / lev;
    let liquidationPrice;
    if (isLong) {
      liquidationPrice = entry * (1 - liquidationPercentage);
    } else {
      liquidationPrice = entry * (1 + liquidationPercentage);
    }
    setResult({
      positionSize: positionSize.toFixed(8),
      riskAmount: riskAmount.toFixed(2),
      liquidationPrice: liquidationPrice.toFixed(8)
    });

    showSuccessToast(
      `${t('financial.calculator.messages.positionSizeCalculated')}: ${positionSize.toFixed(8)} ${t('financial.calculator.labels.unitsToTrade')} ${t('financial.calculator.labels.amountAtRisk')}: $${riskAmount.toFixed(2)}`,
      t('financial.calculator.messages.calculationComplete')
    );
  };

  return <CardContent className="pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <Label htmlFor="account-size" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.accountSize')}
          </Label>
          <Input 
            id="account-size" 
            type="number" 
            placeholder="0.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={accountSize} 
            onChange={e => setAccountSize(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="risk-percentage" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.riskPercentage')}
          </Label>
          <Input 
            id="risk-percentage" 
            type="number" 
            placeholder="1.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={riskPercentage} 
            onChange={e => setRiskPercentage(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="entry-price-ps" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.entryPrice')}
          </Label>
          <Input 
            id="entry-price-ps" 
            type="number" 
            placeholder="0.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={entryPrice} 
            onChange={e => setEntryPrice(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="stop-loss" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.stopLoss')}
          </Label>
          <Input 
            id="stop-loss" 
            type="number" 
            placeholder="0.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={stopLoss} 
            onChange={e => setStopLoss(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="leverage-ps" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.leverage')}
          </Label>
          <Select value={leverage} onValueChange={setLeverage}>
            <SelectTrigger id="leverage-ps" className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectValue placeholder={t('financial.calculator.labels.leverage')} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
              <SelectItem value="3">3x</SelectItem>
              <SelectItem value="5">5x</SelectItem>
              <SelectItem value="10">10x</SelectItem>
              <SelectItem value="20">20x</SelectItem>
              <SelectItem value="50">50x</SelectItem>
              <SelectItem value="100">100x</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        className="w-full mt-2 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.01] shadow-sm" 
        onClick={calculatePositionSize}
      >
        {t('financial.calculator.labels.calculate')}
      </Button>
      
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.positionSize')}
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {result.positionSize}
              </p>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.unitsToTrade')}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.riskAmount')}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                ${result.riskAmount}
              </p>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.amountAtRisk')}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.liquidationPrice')}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                ${result.liquidationPrice}
              </p>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.approximate')}
              </p>
            </div>
          </div>
        </div>
      )}
    </CardContent>;
};

// Drawdown Calculator Component
const DrawdownCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [peakValue, setPeakValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [result, setResult] = useState<{
    drawdownAmount: string;
    drawdownPercentage: string;
    totalReturn: string;
  } | null>(null);

  const calculateDrawdown = () => {
    if (!peakValue || !currentValue) {
      showInfoToast(t('financial.calculator.messages.missingValues'), t('financial.calculator.messages.missingData'));
      return;
    }
    
    const peak = parseFloat(peakValue);
    const current = parseFloat(currentValue);
    const initial = initialInvestment ? parseFloat(initialInvestment) : null;

    const drawdownAmount = peak - current;
    const drawdownPercentage = drawdownAmount / peak * 100;

    let totalReturn = null;
    if (initial !== null) {
      totalReturn = (current - initial) / initial * 100;
    }
    setResult({
      drawdownAmount: drawdownAmount.toFixed(2),
      drawdownPercentage: drawdownPercentage.toFixed(2),
      totalReturn: totalReturn !== null ? totalReturn.toFixed(2) : 'N/A'
    });

    showSuccessToast(
      `${t('financial.calculator.messages.drawdownAnalysis')}: ${drawdownPercentage.toFixed(2)}% ($${drawdownAmount.toFixed(2)})`,
      t('financial.calculator.messages.calculationComplete')
    );
  };

  return <CardContent className="pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <Label htmlFor="peak-value" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.peakValue')}
          </Label>
          <Input 
            id="peak-value" 
            type="number" 
            placeholder="0.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={peakValue} 
            onChange={e => setPeakValue(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="current-value" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.currentValue')}
          </Label>
          <Input 
            id="current-value" 
            type="number" 
            placeholder="0.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={currentValue} 
            onChange={e => setCurrentValue(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="initial-investment" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('financial.calculator.labels.initialInvestment')}
          </Label>
          <Input 
            id="initial-investment" 
            type="number" 
            placeholder="0.00" 
            className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700" 
            value={initialInvestment} 
            onChange={e => setInitialInvestment(e.target.value)} 
          />
        </div>
      </div>
      
      <Button 
        className="w-full mt-2 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.01] shadow-sm" 
        onClick={calculateDrawdown}
      >
        {t('financial.calculator.labels.calculate')}
      </Button>
      
      {result && (
        <div className="mt-4 p-4 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.drawdownAmount')}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                ${result.drawdownAmount}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('financial.calculator.labels.drawdownPercentage')}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {result.drawdownPercentage}%
              </p>
            </div>
            
            {initialInvestment && (
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('financial.calculator.labels.totalReturn')}
                </p>
                <p className={`text-xl font-bold ${parseFloat(result.totalReturn) >= 0 ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {result.totalReturn}%
                </p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 flex items-start">
            <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
            <span>
              {t('financial.calculator.messages.drawdownInfo')}
            </span>
          </div>
        </div>
      )}
    </CardContent>;
};

export default FinancialCalculator;
