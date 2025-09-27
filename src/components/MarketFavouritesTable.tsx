import React, { useEffect, useState, useCallback } from 'react';
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

interface MarketData {
  symbol: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  priceChangePercent?: string;
  fundingRate?: string;
}

// Binance Futures REST endpoints
const BINANCE_FUTURES_TICKER_URL = 'https://fapi.binance.com/fapi/v1/ticker/24hr';
const BINANCE_FUNDING_URL = 'https://fapi.binance.com/fapi/v1/premiumIndex';

interface MarketsTableProps {
  autoRefresh: boolean;
}

const MarketsTable: React.FC<MarketsTableProps> = ({ autoRefresh }) => {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [displayedMarkets, setDisplayedMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'symbol'|'lastPrice'|'quoteVolume'|'fundingRate'|'priceChangePercent'>('quoteVolume');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [search, setSearch] = useState('');
  const [favourites, setFavourites] = useState<string[]>([]);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

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
      window.location.reload();
      return;
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ favourites });
    } else {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites]);

  const toggleFavourite = (symbol: string) => {
    setFavourites(favs => favs.includes(symbol) ? favs.filter(s => s !== symbol) : [...favs, symbol]);
  };
  const isFavourite = (symbol: string) => favourites.includes(symbol);


  // Fetch data function
  const fetchData = useCallback(async () => {
    if (markets.length === 0) setLoading(true);
    setError(null);
    try {
      const res = await fetch(BINANCE_FUTURES_TICKER_URL);
      const data = await res.json();
      const usdtPairs = data.filter((item: Record<string, unknown>) => typeof item.symbol === 'string' && item.symbol.endsWith('USDT'));
      const top = usdtPairs
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => parseFloat(String(a.quoteVolume)) - parseFloat(String(b.quoteVolume)))
        .slice(0, 100);
      const fundingRes = await fetch(BINANCE_FUNDING_URL);
      const fundingData = await fundingRes.json();
      const fundingMap: Record<string, string> = {};
      for (const f of fundingData) {
        fundingMap[f.symbol] = f.lastFundingRate;
      }
      const merged = top.map((item: Record<string, unknown>) => ({
        symbol: item.symbol as string,
        lastPrice: item.lastPrice as string,
        volume: item.volume as string,
        quoteVolume: item.quoteVolume as string,
        priceChangePercent: item.priceChangePercent as string,
        fundingRate: fundingMap[item.symbol as string] ?? '-',
      }));
      setMarkets(merged);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDisplayedMarkets(applySortAndSearch(merged, sortBy, sortDir, search));
    } catch (e) {
      setError('Failed to fetch market data.');
    }
    setLoading(false);
  }, [markets.length, search, sortBy, sortDir]);

  // Manual refresh
  const refreshMarkets = () => {
    fetchData();
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Sorting and searching helpers
  function applySortAndSearch(data: MarketData[], sortBy: string, sortDir: string, search: string) {
    let filtered = data;
    if (search) {
      filtered = filtered.filter(m => m.symbol.toLowerCase().includes(search.toLowerCase()));
    }
    const sorted = [...filtered];
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

  return (
    <div className="w-full max-w-4xl mx-auto py-1">
      <div className="rounded-lg border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-sm overflow-hidden animate-fadeScaleIn" data-component-name="MarketsTable" style={{ fontSize: '0.9rem', maxWidth: 580, margin: '0 auto' }}>
        <div className="px-2 md:px-3 pt-2 pb-1 bg-muted/60 rounded-t-lg border-b border-border shadow-sm">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="relative flex items-center w-56 h-10">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-muted-foreground">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search symbol..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-neutral-50 dark:bg-muted border border-neutral-200 dark:border-border rounded-lg py-1.5 pl-9 pr-3 text-sm text-neutral-900 dark:text-foreground placeholder:text-neutral-400 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all w-full shadow-sm"
                  style={{ fontFamily: 'inherit', fontWeight: 500 }}
                />
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={refreshMarkets}
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
          <div className="w-full overflow-x-auto" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="w-10 text-left select-none text-xs md:text-xs px-1"></TableHead>
                  <TableHead className="w-14 cursor-pointer select-none text-left text-xs md:text-xs px-1" onClick={() => {
                    setSortBy('symbol');
                    setSortDir(sortBy === 'symbol' && sortDir === 'asc' ? 'desc' : 'asc');
                  }}>
                    Symbol {sortBy === 'symbol' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                  </TableHead>
                  <TableHead className="text-left cursor-pointer select-none" onClick={() => {
  setSortBy('lastPrice');
  setSortDir(sortBy === 'lastPrice' && sortDir === 'asc' ? 'desc' : 'asc');
}}>
  <span className="inline-flex items-center gap-1">
    Price
    {sortBy === 'lastPrice' ? (
      <span className="text-xs align-middle">{sortDir === 'asc' ? '▲' : '▼'}</span>
    ) : null}
  </span>
</TableHead>
                  <TableHead className="text-left cursor-pointer select-none" onClick={() => {
  setSortBy('quoteVolume');
  setSortDir(sortBy === 'quoteVolume' && sortDir === 'asc' ? 'desc' : 'asc');
}}>
  <span className="inline-flex items-center gap-1">
    Volume
    {sortBy === 'quoteVolume' ? (
      <span className="text-xs align-middle">{sortDir === 'asc' ? '▲' : '▼'}</span>
    ) : null}
  </span>
</TableHead>
                  <TableHead className="text-left cursor-pointer select-none" onClick={() => {
  setSortBy('priceChangePercent');
  setSortDir(sortBy === 'priceChangePercent' && sortDir === 'asc' ? 'desc' : 'asc');
}}>
  <span className="inline-flex items-center gap-1">
    Change
    {sortBy === 'priceChangePercent' ? (
      <span className="text-xs align-middle">{sortDir === 'asc' ? '▲' : '▼'}</span>
    ) : null}
  </span>
</TableHead>
                  <TableHead className="text-left cursor-pointer select-none" onClick={() => {
  setSortBy('fundingRate');
  setSortDir(sortBy === 'fundingRate' && sortDir === 'asc' ? 'desc' : 'asc');
}}>
  <span className="inline-flex items-center gap-1">
    Funding
    {sortBy === 'fundingRate' ? (
      <span className="text-xs align-middle">{sortDir === 'asc' ? '▲' : '▼'}</span>
    ) : null}
  </span>
</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(showFavouritesOnly ? displayedMarkets.filter(m => isFavourite(m.symbol)) : displayedMarkets).map((m, i) => (
                  <TableRow
                    key={m.symbol}
                    className={`transition-all duration-300 ease-in-out ${i < 3 ? 'bg-crypto-green/10 dark:bg-green-900/10 font-semibold' : ''} hover:bg-accent/30 animate-fadeIn`}
                    style={{ animationDelay: `${i * 10}ms` }}
                  >
                    <TableCell className="px-1 text-left">
                      <button
                        aria-label={isFavourite(m.symbol) ? 'Remove from favourites' : 'Add to favourites'}
                        onClick={() => toggleFavourite(m.symbol)}
                        className="focus:outline-none"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        {isFavourite(m.symbol) ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="px-2 text-left text-neutral-900 dark:text-foreground align-middle" style={{ minWidth: 0, maxWidth: 56 }}>
                      <span className="truncate">{m.symbol.replace(/(USDT|BUSD|USDC|TUSD|FDUSD|DAI|TRY|EUR)$/,'')}</span>
                    </TableCell>
                    <TableCell className="px-2 py-2 text-left text-neutral-900 dark:text-foreground">
                      <AnimatedNumberWithFlash value={parseFloat(m.lastPrice)} symbol={m.symbol} field="lastPrice" />
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground">
                      <AnimatedNumberWithFlash value={m.quoteVolume} symbol={m.symbol} field="quoteVolume" compact />
                    </TableCell>
                    <TableCell className="px-2 py-2 text-right text-neutral-900 dark:text-foreground">
                      {typeof m.priceChangePercent !== 'undefined' && m.priceChangePercent !== '-' ? (
                        <AnimatedNumberWithFlash
                          value={parseFloat(m.priceChangePercent)}
                          symbol={m.symbol}
                          field="priceChangePercent"
                          percent
                          className={
                            parseFloat(m.priceChangePercent) > 0
                              ? 'text-crypto-green dark:text-green-400 font-bold font-mono'
                              : parseFloat(m.priceChangePercent) < 0
                              ? 'text-red-600 dark:text-red-400 font-bold font-mono'
                              : 'text-muted-foreground font-mono'
                          }
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.fundingRate && m.fundingRate !== '-' ? (
                        <AnimatedNumberWithFlash
                          value={parseFloat(m.fundingRate) * 100}
                          symbol={m.symbol}
                          field="fundingRate"
                          percent
                          decimals={4}
                          className={
                            parseFloat(m.fundingRate) > 0
                              ? 'text-crypto-green dark:text-green-400 font-bold font-mono'
                              : parseFloat(m.fundingRate) < 0
                              ? 'text-red-600 dark:text-red-400 font-bold font-mono'
                              : 'text-muted-foreground font-mono'
                          }
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-xs text-muted-foreground text-left p-2 bg-muted/40 rounded-b-xl">
  Data from Binance Futures API. Funding rates shown for perpetual futures only.
</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

function formatCompactNumber(num: string | number) {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '-';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toLocaleString();
}

// --- ANIMATION/UTIL COMPONENTS ---
import { useRef, useEffect as useEffectReact } from 'react';

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
  useEffectReact(() => {
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
function AnimatedNumberWithFlash({ value, symbol, field, compact = false, percent = false, decimals = 2, className = '' }:{ value: number|string, symbol: string, field: string, compact?: boolean, percent?: boolean, decimals?: number, className?: string }) {
  const key = symbol + ':' + field;
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prev = prevValues[key];
  useEffectReact(() => {
    if (typeof value === 'number' && typeof prev === 'number' && value !== prev) {
      setFlash(value > prev ? 'up' : 'down');
      const timeout = setTimeout(() => setFlash(null), 400);
      return () => clearTimeout(timeout);
    }
    prevValues[key] = typeof value === 'number' ? value : parseFloat(value as string);
  }, [value, prev, key]);
  let display = value;
  if (compact) display = formatCompactNumber(value);
  else if (percent && typeof value === 'number') display = `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  else if (typeof value === 'number') {
    // For small prices, show more decimal places
    if (value < 0.001 && value > 0) {
      display = value.toFixed(6);
    } else {
      display = value.toLocaleString();
    }
  }
  return <span className={`inline-block px-1 rounded transition-all duration-300 ${flash === 'up' ? 'bg-crypto-green/20 dark:bg-green-900' : flash === 'down' ? 'bg-red-100 dark:bg-red-900' : ''} ${className}`}>{display}</span>;
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

export default MarketsTable;
