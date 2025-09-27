import React, { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
import { useNotificationStore } from './NotificationDropdown';
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

// Cache for API responses
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();

  set<T>(key: string, data: T, ttl: number = 30000) { // Default 30 seconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear() {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

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
  const baseAsset = useMemo(() => market.symbol.replace('USDT', ''), [market.symbol]);
  
  return (
    <TableRow className="hover:bg-green-50 dark:hover:bg-green-950/20">
      <TableCell className="px-2 py-2 text-left w-[110px]">
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
      <TableCell className="px-2 py-2 text-left text-neutral-900 dark:text-foreground w-[140px]">
        <AnimatedNumber
          value={parseFloat(market.lastPrice)}
          symbol={market.symbol}
          field="lastPrice"
          className="font-mono"
        />
      </TableCell>
      <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground w-[120px]">
        <AnimatedNumber
          value={market.quoteVolume}
          symbol={market.symbol}
          field="quoteVolume"
          compact
          className="font-mono"
        />
      </TableCell>
      <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground w-[80px]">
        {typeof market.priceChangePercent !== 'undefined' && market.priceChangePercent !== '-' ? (
          <AnimatedNumber
            value={parseFloat(market.priceChangePercent)}
            symbol={market.symbol}
            field="priceChangePercent"
            percent
            className={`font-mono ${
              parseFloat(market.priceChangePercent) > 0
                ? 'text-crypto-green dark:text-green-400'
                : parseFloat(market.priceChangePercent) < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'
            }`}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground w-[90px]">
        {market.fundingRate && market.fundingRate !== '-' ? (
          <AnimatedNumber
            value={parseFloat(market.fundingRate) * 100}
            symbol={market.symbol}
            field="fundingRate"
            percent
            decimals={4}
            className={`font-mono ${
              parseFloat(market.fundingRate) > 0
                ? 'text-crypto-green dark:text-green-400'
                : parseFloat(market.fundingRate) < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground'
            }`}
            formatValue={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(4)}%`}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
    </TableRow>
  );
});

MarketRow.displayName = 'MarketRow';

// Optimized animated number with flash effect and memoization
const priceCache = new Map<string, number>();

const AnimatedNumber = memo(function AnimatedNumber({
  value,
  compact = false,
  percent = false,
  decimals = 2,
  className = '',
  formatValue,
  symbol,
  field
}: {
  value: number|string,
  compact?: boolean,
  percent?: boolean,
  decimals?: number,
  className?: string,
  formatValue?: (value: number) => string,
  symbol?: string,
  field?: string
}) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const currentValue = typeof value === 'number' ? value : parseFloat(value as string);
  const cacheKey = symbol && field ? `${symbol}-${field}` : '';

  useEffect(() => {
    if (cacheKey && priceCache.has(cacheKey)) {
      const prevValue = priceCache.get(cacheKey)!;
      if (prevValue !== currentValue) {
        setFlash(currentValue > prevValue ? 'up' : 'down');
        const timeout = setTimeout(() => setFlash(null), 300);
        return () => clearTimeout(timeout);
      }
    }
    if (cacheKey) {
      priceCache.set(cacheKey, currentValue);
    }
  }, [currentValue, cacheKey]);

  // Memoize the display value calculation
  const display = useMemo(() => {
    if (formatValue) {
      return formatValue(typeof value === 'number' ? value : parseFloat(value));
    } else if (compact) {
      return formatCompactNumber(value);
    } else if (percent && typeof value === 'number') {
      return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
    } else if (typeof value === 'number') {
      // For small prices, show more decimal places
      if (value < 0.001 && value > 0) {
        return value.toFixed(6);
      } else {
        return value.toLocaleString();
      }
    }
    return value;
  }, [value, compact, percent, decimals, formatValue]);

  return (
    <span className={`inline-block px-1 py-0.5 rounded transition-all duration-300 ${
      flash === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
      flash === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''
    } ${className}`}>
      {display}
    </span>
  );
});

type SortableColumn = 'symbol' | 'lastPrice' | 'quoteVolume' | 'priceChangePercent' | 'fundingRate';

interface TableHeaderProps {
  sortBy: SortableColumn;
  sortDir: 'asc' | 'desc';
  onSort: (column: SortableColumn) => void;
}

const TableHeaderMemo = memo(({ sortBy, sortDir, onSort }: TableHeaderProps) => (
  <TableHeader>
    <TableRow>
      <TableHead className="px-2 py-2 text-left cursor-pointer w-[110px]" onClick={() => onSort('symbol')}>
        <div className="flex items-center gap-1">
          Symbol
          {sortBy === 'symbol' && (
            <span className={`text-xs ${sortDir === 'asc' ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-left cursor-pointer w-[140px]" onClick={() => onSort('lastPrice')}>
        <div className="flex items-center gap-1">
          Price
          {sortBy === 'lastPrice' && (
            <span className={`text-xs ${sortDir === 'asc' ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-right cursor-pointer w-[120px]" onClick={() => onSort('quoteVolume')}>
        <div className="flex items-center justify-end gap-1">
          Volume
          {sortBy === 'quoteVolume' && (
            <span className={`text-xs ${sortDir === 'asc' ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-right cursor-pointer w-[80px]" onClick={() => onSort('priceChangePercent')}>
        <div className="flex items-center justify-end gap-1">
          Change
          {sortBy === 'priceChangePercent' && (
            <span className={`text-xs ${sortDir === 'asc' ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{sortDir === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </TableHead>
      <TableHead className="px-2 py-2 text-right cursor-pointer w-[90px]" onClick={() => onSort('fundingRate')}>
        <div className="flex items-center justify-end gap-1">
          Funding
          {sortBy === 'fundingRate' && (
            <span className={`text-xs ${sortDir === 'asc' ? 'text-crypto-green dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{sortDir === 'asc' ? '↑' : '↓'}</span>
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

const MarketsTable: React.FC<MarketsTableProps> = memo(({ autoRefresh, refreshInterval = 5000 }) => {
  const { t } = useTranslation();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortableColumn>('quoteVolume');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [favourites, setFavourites] = useState<string[]>([]);

  // Debounce search input to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange>('BINANCE');
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    const saveToStorage = async () => {
      try {
        if (favourites.length === 0) {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.remove(['favourites']);
          } else {
            localStorage.removeItem('favourites');
          }
          return;
        }
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ favourites });
        } else {
          localStorage.setItem('favourites', JSON.stringify(favourites));
        }
      } catch (error) {
        console.error('Failed to save favourites:', error);
      }
    };
    
    const timeoutId = setTimeout(saveToStorage, 300);
    return () => clearTimeout(timeoutId);
  }, [favourites]);

  const toggleFavourite = useCallback((symbol: string) => {
    setFavourites(favs => favs.includes(symbol) ? favs.filter(s => s !== symbol) : [...favs, symbol]);
  }, []);

  // Memoize favourites set for better performance
  const favouritesSet = useMemo(() => new Set(favourites), [favourites]);
  const isFavourite = useCallback((symbol: string) => favouritesSet.has(symbol), [favouritesSet]);

  // Memoized fetch configuration to reduce dependency changes
  const fetchConfig = useMemo(() => ({
    selectedExchange,
    search: debouncedSearch,
    sortBy,
    sortDir
  }), [selectedExchange, debouncedSearch, sortBy, sortDir]);

  // Fetch data function with caching
  const fetchData = useCallback(async (manual?: boolean, forceRefresh?: boolean, showNotification?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      if (manual) setIsRefreshing(true);

      const exchange = EXCHANGES[selectedExchange];
      const tickerCacheKey = `${selectedExchange}-ticker`;

      // Try to get ticker data from cache first (unless manual refresh or force refresh)
      let rawData: any = null;
      if (!manual && !forceRefresh) {
        rawData = apiCache.get(tickerCacheKey);
      }

      // Fetch ticker data if not cached or manual refresh
      if (!rawData) {
        try {
          const res = await fetch(exchange.ticker);
          if (!res.ok) throw new Error(`Ticker fetch failed for ${selectedExchange}: ${res.status}`);
          rawData = await res.json();
          // Cache ticker data for 30 seconds
          apiCache.set(tickerCacheKey, rawData, 30000);
        } catch (tickerErr) {
          setError(`Failed to fetch ${selectedExchange} ticker data.`);
          console.error(`MarketsTable fetch error: ${selectedExchange} TICKER`, tickerErr);
          setLoading(false);
          return;
        }
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
      const fundingCacheKey = `${selectedExchange}-funding`;

      // Try to get funding data from cache first (unless manual refresh or force refresh)
      let fundingData: any = null;
      if (!manual && !forceRefresh) {
        fundingData = apiCache.get(fundingCacheKey);
      }

      if (selectedExchange === 'BINANCE') {
        if (!fundingData) {
          try {
            const fundingRes = await fetch(exchange.funding);
            if (!fundingRes.ok) throw new Error(`Funding fetch failed for ${selectedExchange}: ${fundingRes.status}`);
            fundingData = await fundingRes.json();
            // Cache funding data for 5 minutes (funding rates change less frequently)
            apiCache.set(fundingCacheKey, fundingData, 300000);
          } catch (fundingErr) {
            console.error(`MarketsTable fetch error: ${selectedExchange} FUNDING`, fundingErr);
            fundingData = null;
          }
        }

        if (fundingData) {
          for (const f of fundingData) {
            fundingMap[f.symbol] = f.lastFundingRate;
          }
        }
      } else if (selectedExchange === 'BYBIT') {
        // Try to get cached funding data for Bybit
        let cachedFundingMap: Record<string, string> | null = null;
        if (!manual && !forceRefresh) {
          cachedFundingMap = apiCache.get(fundingCacheKey);
        }

        if (!cachedFundingMap) {
          try {
            // Batch funding rate requests in chunks to avoid rate limiting
            const BATCH_SIZE = 10;
            const freshFundingMap: Record<string, string> = {};

            for (let i = 0; i < usdtPairs.length; i += BATCH_SIZE) {
              const batch = usdtPairs.slice(i, i + BATCH_SIZE);
              const fundingPromises = batch.map(async (item) => {
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

              const batchResults = await Promise.all(fundingPromises);
              for (const result of batchResults) {
                if (result) {
                  freshFundingMap[result.symbol] = result.rate;
                }
              }

              // Small delay between batches to be respectful to the API
              if (i + BATCH_SIZE < usdtPairs.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            // Cache funding data for 5 minutes
            apiCache.set(fundingCacheKey, freshFundingMap, 300000);
            Object.assign(fundingMap, freshFundingMap);
          } catch (fundingErr) {
            console.error(`MarketsTable fetch error: ${selectedExchange} FUNDING`, fundingErr);
          }
        } else {
          // Use cached funding data
          Object.assign(fundingMap, cachedFundingMap);
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
      if (showNotification) {
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
      if (manual) setIsRefreshing(false);
    }
  }, [fetchConfig]);

  // Manual refresh - clears cache and fetches fresh data
  const refreshMarkets = useCallback(() => {
    // Clear cache for current exchange before fetching
    apiCache.clear();
    fetchData(true, true, true); // showNotification = true
  }, [fetchData]);

  // Clear cache when switching exchanges
  useEffect(() => {
    apiCache.clear();
    fetchData(true, true, false); // no notification
  }, [selectedExchange]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial fetch
    fetchData(undefined, true, false); // no notification

    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchData(undefined, true, false); // no notification
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, fetchData, refreshInterval]);

  // Optimized sorting and searching helpers with memoization
  const applySortAndSearch = useCallback((data: MarketData[], sortBy: string, sortDir: string, search: string) => {
    if (!data.length) return [];

    // Filter first (more selective operation)
    let filtered = data;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(m => m.symbol.toLowerCase().includes(searchLower));
    }

    // Always sort by USD volume (quoteVolume) to ensure correct ordering

    // Sort with optimized comparison
    const sorted = [...filtered].sort((a, b) => {
      let aVal: string|number = a[sortBy as keyof MarketData] ?? '';
      let bVal: string|number = b[sortBy as keyof MarketData] ?? '';

      // Numeric sorting for specific columns
      if (sortBy === 'lastPrice' || sortBy === 'quoteVolume' || sortBy === 'fundingRate' || sortBy === 'priceChangePercent') {
        const aNum = parseFloat(aVal as string);
        const bNum = parseFloat(bVal as string);
        aVal = isNaN(aNum) ? -Infinity : aNum;
        bVal = isNaN(bNum) ? -Infinity : bNum;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, []);

  // Memoize sorted and filtered markets
  const displayedMarkets = useMemo(() => {
    if (!markets.length) return [];
    return applySortAndSearch(markets, sortBy, sortDir, debouncedSearch);
  }, [markets, sortBy, sortDir, debouncedSearch, applySortAndSearch]);

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
      <div>
      <div className="rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn">
        <div className="bg-black backdrop-blur-lg border-b border-zinc-800 px-3 md:px-6 pt-2 pb-3 rounded-t-xl shadow-sm">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center w-56 h-10">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder={t('common.searchSymbol')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all w-full shadow-sm"
                    style={{ fontFamily: 'inherit', fontWeight: 500 }}
                  />
                </div>
                <select
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value as Exchange)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all shadow-sm font-medium h-8"
                >
                  {Object.entries(EXCHANGES).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={refreshMarkets}
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  aria-label="Refresh"
                  style={{ verticalAlign: 'middle' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-zinc-300 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: 'block' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581m-2.838-7.362A7.963 7.963 0 004.582 9M19.418 15A7.963 7.963 0 0112 19a7.963 7.963 0 01-7.418-5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFavouritesOnly(v => !v)}
                  className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-all focus:outline-none ${showFavouritesOnly ? 'bg-yellow-900/50 border-yellow-600 text-yellow-300' : 'bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700'}`}
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
                {(showFavouritesOnly ? displayedMarkets.filter(m => isFavourite(m.symbol)) : displayedMarkets).slice(0, 200).map((market) => (
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
  );
});

// Memoized compact number formatter
const formatCompactNumber = (() => {
  const cache = new Map<string | number, string>();
  return (num: string | number): string => {
    if (cache.has(num)) return cache.get(num)!;

    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(n)) return '-';
    let result: string;
    if (n >= 1e9) result = (n / 1e9).toFixed(2) + 'B';
    else if (n >= 1e6) result = (n / 1e6).toFixed(2) + 'M';
    else if (n >= 1e3) result = (n / 1e3).toFixed(2) + 'K';
    else result = n.toLocaleString();

    // Cache up to 1000 entries to prevent memory leaks
    if (cache.size > 1000) cache.clear();
    cache.set(num, result);
    return result;
  };
})();

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

MarketsTable.displayName = 'MarketsTable';

export default MarketsTable;
