import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useNotificationStore } from './NotificationDropdown';
import { useProStatus } from '@/hooks/useProStatus';
import ProUpgradeModal from './ProUpgradeModal';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Star } from 'lucide-react';

// Exchange endpoints
const EXCHANGES = {
  BINANCE: {
    name: 'Binance',
    ticker: 'https://fapi.binance.com/fapi/v1/ticker/24hr',
    funding: 'https://fapi.binance.com/fapi/v1/premiumIndex'
  },
  BYBIT: {
    name: 'Bybit',
    ticker: 'https://api.bybit.com/v5/market/tickers?category=linear',
    funding: 'https://api.bybit.com/v5/market/funding/history?category=linear&limit=200'
  }
} as const;

type Exchange = keyof typeof EXCHANGES;

interface MarketData {
  symbol: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  priceChangePercent?: string;
  fundingRate?: string;
}

interface MarketRowProps {
  market: MarketData;
  isFavourite: boolean;
  onToggleFavorite: (symbol: string) => void;
}

// Memoize individual table rows to prevent unnecessary re-renders
const MarketRow = memo(({ market, isFavourite, onToggleFavorite }: MarketRowProps) => {
  // Extract base asset from symbol (e.g., "BTC" from "BTCUSDT")
  const baseAsset = market.symbol.replace('USDT', '');
  
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="px-2 py-2 text-left w-[120px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(market.symbol)}
            className={`text-xs hover:text-yellow-500 transition-colors ${
              isFavourite ? 'text-yellow-500' : 'text-neutral-400'
            }`}
          >
            <Star size={16} fill={isFavourite ? 'currentColor' : 'none'} />
          </button>
          <span className="font-medium truncate">{baseAsset}</span>
        </div>
      </TableCell>
      <TableCell className="px-2 py-2 text-left text-neutral-900 dark:text-foreground">
        <AnimatedNumberWithFlash value={parseFloat(market.lastPrice)} symbol={market.symbol} field="lastPrice" />
      </TableCell>
      <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground">
        <AnimatedNumberWithFlash value={market.quoteVolume} symbol={market.symbol} field="quoteVolume" compact />
      </TableCell>
      <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground">
        {typeof market.priceChangePercent !== 'undefined' && market.priceChangePercent !== '-' ? (
          <AnimatedNumberWithFlash
            value={parseFloat(market.priceChangePercent)}
            symbol={market.symbol}
            field="priceChangePercent"
            percent
            className={
              parseFloat(market.priceChangePercent) > 0
                ? 'text-green-600 dark:text-green-400 font-bold font-mono'
                : parseFloat(market.priceChangePercent) < 0
                ? 'text-red-600 dark:text-red-400 font-bold font-mono'
                : 'text-muted-foreground font-mono'
            }
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground w-[100px]">
        {market.fundingRate && market.fundingRate !== '-' ? (
          <AnimatedNumberWithFlash
            value={parseFloat(market.fundingRate) * 100}
            symbol={market.symbol}
            field="fundingRate"
            percent
            className={`font-mono ${
              parseFloat(market.fundingRate) > 0
                ? 'text-green-600 dark:text-green-400'
                : parseFloat(market.fundingRate) < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'
            }`}
            formatValue={(value) => {
              const num = parseFloat(value.toString());
              return `${num >= 0 ? '+' : ''}${num.toFixed(4)}%`;
            }}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
    </TableRow>
  );
});

MarketRow.displayName = 'MarketRow';

type SortableColumn = 'symbol' | 'lastPrice' | 'quoteVolume' | 'priceChangePercent' | 'fundingRate';

interface TableHeaderProps {
  sortBy: SortableColumn;
  sortDir: 'asc' | 'desc';
  onSort: (column: SortableColumn) => void;
}

const TableHeaderMemo = memo(({ sortBy, sortDir, onSort }: TableHeaderProps) => (
  <TableHeader>
    <TableRow>
      <TableHead className="px-2 py-2 text-left cursor-pointer hover:bg-muted/50" onClick={() => onSort('symbol')}>
        <div className="flex items-center gap-1">
          Symbol
          {sortBy === 'symbol' && (
            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-left cursor-pointer hover:bg-muted/50" onClick={() => onSort('lastPrice')}>
        <div className="flex items-center gap-1">
          Price
          {sortBy === 'lastPrice' && (
            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-right cursor-pointer hover:bg-muted/50" onClick={() => onSort('quoteVolume')}>
        <div className="flex items-center justify-end gap-1">
          Volume
          {sortBy === 'quoteVolume' && (
            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-right cursor-pointer hover:bg-muted/50" onClick={() => onSort('priceChangePercent')}>
        <div className="flex items-center justify-end gap-1">
          Change
          {sortBy === 'priceChangePercent' && (
            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-right cursor-pointer hover:bg-muted/50" onClick={() => onSort('fundingRate')}>
        <div className="flex items-center justify-end gap-1">
          Funding
          {sortBy === 'fundingRate' && (
            <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
    </TableRow>
  </TableHeader>
));

TableHeaderMemo.displayName = 'TableHeaderMemo';

interface MarketsTableProps {
  autoRefresh: boolean;
  refreshInterval?: number;
}

const MarketsTable: React.FC<MarketsTableProps> = ({ autoRefresh, refreshInterval = 8000 }) => {
  const { t } = useTranslation();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isPro] = useProStatus();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [displayedMarkets, setDisplayedMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortableColumn>('quoteVolume');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [search, setSearch] = useState('');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange>('BINANCE');
  const [retryCount, setRetryCount] = useState(0);
  const { addNotification } = useNotificationStore();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  // Favourites storage helpers
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['favourites'], result => {
        if (Array.isArray(result.favourites)) setFavourites(result.favourites);
      });
    } else {
      const favs = localStorage.getItem('favourites');
      if (favs) setFavourites(JSON.parse(favs));
    }
  }, []);

  useEffect(() => {
    if (favourites.length === 0) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove(['favourites']);
      } else {
        localStorage.removeItem('favourites');
      }
      return;
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ favourites });
    } else {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites]);

  const toggleFavourite = (symbol: string) => {
    if (!isPro) {
      setUpgradeModalOpen(true);
      return;
    }
    setFavourites(favs => favs.includes(symbol) ? favs.filter(s => s !== symbol) : [...favs, symbol]);
  };
  const isFavourite = (symbol: string) => favourites.includes(symbol);

  // Fetch data function
  const fetchData = useCallback(async (manual?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const exchange = EXCHANGES[selectedExchange];
      let rawData: any;
      try {
        const res = await fetch(exchange.ticker);
        if (!res.ok) throw new Error(`Ticker fetch failed for ${selectedExchange}: ${res.status}`);
        rawData = await res.json();
      } catch (tickerErr) {
        setError(`Failed to fetch ${selectedExchange} ticker data.`);
        console.error(`MarketsTable fetch error: ${selectedExchange} TICKER`, tickerErr);
        setLoading(false);
        return;
      }

      let usdtPairs: any[] = [];
      if (selectedExchange === 'BINANCE') {
        usdtPairs = rawData.filter((item: any) => item.symbol.endsWith('USDT'));
      } else if (selectedExchange === 'BYBIT') {
        usdtPairs = rawData.result.list.filter((item: any) => item.symbol.endsWith('USDT'));
        // Sort by volume
        usdtPairs.sort((a: any, b: any) => {
          const aVol = parseFloat(a.volume24h) * parseFloat(a.lastPrice);
          const bVol = parseFloat(b.volume24h) * parseFloat(b.lastPrice);
          return bVol - aVol;
        });
        usdtPairs = usdtPairs.slice(0, 100);
      }

      const fundingMap: Record<string, string> = {};
      if (selectedExchange === 'BINANCE') {
        try {
          const fundingRes = await fetch(exchange.funding);
          if (!fundingRes.ok) throw new Error(`Funding fetch failed for ${selectedExchange}: ${fundingRes.status}`);
          const fundingData = await fundingRes.json();
          for (const f of fundingData) {
            fundingMap[f.symbol] = f.lastFundingRate;
          }
        } catch (fundingErr) {
          console.error(`MarketsTable fetch error: ${selectedExchange} FUNDING`, fundingErr);
        }
      } else if (selectedExchange === 'BYBIT') {
        try {
          // Fetch funding rates for each symbol individually
          const fundingPromises = usdtPairs.map(async (item) => {
            try {
              const symbol = item.symbol;
              const fundingRes = await fetch(`https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=1`);
              if (!fundingRes.ok) throw new Error(`Funding fetch failed for ${symbol}: ${fundingRes.status}`);
          const fundingData = await fundingRes.json();
              if (fundingData.retCode === 0 && fundingData.result && fundingData.result.list && fundingData.result.list.length > 0) {
                return { symbol, rate: fundingData.result.list[0].fundingRate };
              }
              return null;
            } catch (err) {
              console.error(`Failed to fetch funding rate for ${item.symbol}:`, err);
              return null;
            }
          });

          const fundingResults = await Promise.all(fundingPromises);
          for (const result of fundingResults) {
            if (result) {
              fundingMap[result.symbol] = result.rate;
            }
          }
          console.log('Final funding map:', fundingMap);
        } catch (fundingErr) {
          console.error(`MarketsTable fetch error: ${selectedExchange} FUNDING`, fundingErr);
        }
      }

      const merged = usdtPairs.map((item: any) => {
        let marketData: MarketData = {
          symbol: '',
          lastPrice: '',
          volume: '',
          quoteVolume: '',
          priceChangePercent: '',
          fundingRate: ''
        };

        if (selectedExchange === 'BINANCE') {
          marketData = {
            symbol: item.symbol,
            lastPrice: item.lastPrice,
            volume: item.volume,
            quoteVolume: item.quoteVolume,
            priceChangePercent: item.priceChangePercent,
            fundingRate: fundingMap[item.symbol] ?? '-'
          };
        } else if (selectedExchange === 'BYBIT') {
          const price = parseFloat(item.lastPrice);
          const volume24h = parseFloat(item.volume24h);
          marketData = {
            symbol: item.symbol,
            lastPrice: item.lastPrice,
            volume: volume24h.toString(),
            quoteVolume: (volume24h * price).toString(),
            priceChangePercent: ((parseFloat(item.price24hPcnt) * 100).toFixed(2)),
            fundingRate: fundingMap[item.symbol] ?? '-'
          };
        }

        return marketData;
      });

      setMarkets(merged);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDisplayedMarkets(applySortAndSearch(merged, sortBy, sortDir, search));
      if (manual) {
        addNotification({
          title: 'Markets updated',
          description: 'Market data was refreshed.'
        });
      }
    } catch (e: any) {
      setError('Failed to fetch market data.');
      console.error('MarketsTable fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortDir, selectedExchange]);

  // Manual refresh
  const refreshMarkets = () => {
    fetchData();
  };

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;
    
    // Initial fetch
    fetchData();
    
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, fetchData, refreshInterval]);

  // Sorting and searching helpers
  function applySortAndSearch(data: MarketData[], sortBy: string, sortDir: string, search: string) {
    let filtered = data;
    if (search) {
      filtered = filtered.filter(m => m.symbol.toLowerCase().includes(search.toLowerCase()));
    }
    let sorted = [...filtered];
    sorted.sort((a, b) => {
      let aVal: string|number = a[sortBy as keyof MarketData] ?? '';
      let bVal: string|number = b[sortBy as keyof MarketData] ?? '';
      if (sortBy === 'lastPrice' || sortBy === 'quoteVolume' || sortBy === 'fundingRate' || sortBy === 'priceChangePercent') {
        aVal = parseFloat(aVal as string);
        bVal = parseFloat(bVal as string);
        if (isNaN(aVal as number)) aVal = -Infinity;
        if (isNaN(bVal as number)) bVal = -Infinity;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  // Update displayedMarkets on sort/search change
  useEffect(() => {
    setDisplayedMarkets(applySortAndSearch(markets, sortBy, sortDir, search));
  }, [markets, sortBy, sortDir, search]);

  // Memoize handlers
  const handleToggleFavorite = useCallback((symbol: string) => {
    setFavourites(prev => {
      const newFavorites = prev.includes(symbol)
        ? prev.filter(f => f !== symbol)
        : [...prev, symbol];
      localStorage.setItem('favourites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Add handleSort function
  const handleSort = useCallback((column: SortableColumn) => {
    setSortBy(column);
    setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  return (
    <>
      <div className="w-full max-w-4xl mx-auto py-2">
      <div className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn">
        <div className="px-3 md:px-6 pt-4 pb-3 bg-muted/60 rounded-t-xl border-b border-border shadow-sm">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center w-56 h-10">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-muted-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder={t('common.searchSymbol')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-neutral-50 dark:bg-muted border border-neutral-200 dark:border-border rounded-lg py-1.5 pl-9 pr-3 text-sm text-neutral-900 dark:text-foreground placeholder:text-neutral-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all w-full shadow-sm"
                    style={{ fontFamily: 'inherit', fontWeight: 500 }}
                  />
                </div>
                <select
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value as Exchange)}
                  className="bg-neutral-50 dark:bg-muted border border-neutral-200 dark:border-border rounded-lg px-3 text-sm text-neutral-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all shadow-sm font-medium h-8"
                >
                  {Object.entries(EXCHANGES).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => fetchData(true)}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-neutral-100 dark:bg-muted hover:bg-neutral-200 dark:hover:bg-muted/70 border border-neutral-200 dark:border-border transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Refresh"
                  style={{ verticalAlign: 'middle' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: 'block' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m-2.838-7.362A7.963 7.963 0 004.582 9M19.418 15A7.963 7.963 0 0112 19a7.963 7.963 0 01-7.418-5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFavouritesOnly(v => !v)}
                  className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-all focus:outline-none ${showFavouritesOnly ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' : 'bg-neutral-100 dark:bg-muted hover:bg-neutral-200 dark:hover:bg-muted/70 border-neutral-200 dark:border-border'}`}
                  aria-label={showFavouritesOnly ? 'Show all assets' : 'Show only favourites'}
                  title={showFavouritesOnly ? 'Show all assets' : 'Show only favourites'}
                  style={{ verticalAlign: 'middle' }}
                >
                  {showFavouritesOnly ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : markets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No data available.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeaderMemo sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <TableBody>
                {(showFavouritesOnly ? displayedMarkets.filter(m => isFavourite(m.symbol)) : displayedMarkets).map((market) => (
                  <MarketRow
                    key={market.symbol}
                    market={market}
                    isFavourite={isFavourite(market.symbol)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-xs text-muted-foreground text-left p-2 bg-muted/40 rounded-b-xl">
                    Data from {EXCHANGES[selectedExchange].name} Futures API. Funding rates shown for perpetual futures only.
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            {error && (
              <div className="text-red-500 mt-2">
                {error} <button onClick={() => fetchData(true)} className="underline ml-2">Retry</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
      <ProUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={() => {
          setUpgradeModalOpen(false);
          // Optionally trigger subscription flow here
        }}
      />
    </>
  );
}

MarketsTable.displayName = 'MarketsTable';

function formatCompactNumber(num: string | number) {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '-';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toLocaleString();
}

// --- ANIMATION/UTIL COMPONENTS ---
// (useRef already imported above, remove duplicate imports)

function AssetIcon({ symbol }: { symbol: string }) {
  // Try to get icon from cryptoicons.org, fallback to empty span if fails
  const asset = symbol.replace('USDT', '').toLowerCase();
  const url = `https://cryptoicons.org/api/icon/${asset}/32`;
  // Could add fallback logic for trustwallet/assets if desired
  return (
    <img
      src={url}
      alt={asset.toUpperCase()}
      className="w-5 h-5 rounded-full bg-white object-contain border border-border"
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      style={{ minWidth: 20, minHeight: 20 }}
    />
  );
}

function AnimatedNumber({ value, compact = false }: { value: number|string, compact?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove('flash');
      // force reflow
      void ref.current.offsetWidth;
      ref.current.classList.add('flash');
    }
  }, [value]);
  let display = value;
  if (compact) display = formatCompactNumber(value);
  else if (typeof value === 'number') display = value.toLocaleString();
  return <span ref={ref} className="transition-all duration-200 flash">{display}</span>;
}

// Animated number with flash on change (yellow)
const prevValues: Record<string, number> = {};
function AnimatedNumberWithFlash({ 
  value, 
  symbol, 
  field, 
  compact = false, 
  percent = false, 
  decimals = 2, 
  className = '',
  formatValue
}: { 
  value: number|string, 
  symbol: string, 
  field: string, 
  compact?: boolean, 
  percent?: boolean, 
  decimals?: number, 
  className?: string,
  formatValue?: (value: number|string) => string 
}) {
  const key = symbol + ':' + field;
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prev = prevValues[key];
  useEffect(() => {
    if (typeof value === 'number' && typeof prev === 'number' && value !== prev) {
      setFlash(value > prev ? 'up' : 'down');
      const timeout = setTimeout(() => setFlash(null), 400);
      return () => clearTimeout(timeout);
    }
    prevValues[key] = typeof value === 'number' ? value : parseFloat(value as string);
  }, [value, prev, key]);

  let display = value;
  if (formatValue) {
    display = formatValue(value);
  } else if (compact) {
    display = formatCompactNumber(value);
  } else if (percent && typeof value === 'number') {
    display = `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  } else if (typeof value === 'number') {
    display = value.toLocaleString();
  }

  return (
    <span className={`inline-block px-1 rounded transition-all duration-300 ${
      flash === 'up' ? 'bg-green-100 dark:bg-green-900' : 
      flash === 'down' ? 'bg-red-100 dark:bg-red-900' : ''
    } ${className}`}>
      {display}
    </span>
  );
}

// Example breathing SVG animation (not rendered, just for reference)
// <svg className="animate-breathing" ...>...</svg>
// .animate-breathing { animation: breathing 1.6s infinite ease-in-out; }
// @keyframes breathing { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }

// --- ADDITIONAL CSS ---
// Add these to your global CSS or Tailwind config:
// .animate-fadeIn { animation: fadeIn 0.5s; }
// .animate-fadeNumber .flash { animation: fadeNumber 0.5s; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(12px);} to { opacity: 1; transform: none; } }
// @keyframes fadeNumber { from { background: #ffe066; } to { background: none; } }

export default memo(MarketsTable);
