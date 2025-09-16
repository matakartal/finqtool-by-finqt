import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useNotificationStore } from "./NotificationDropdown";

interface Market {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

const Markets: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { addNotification } = useNotificationStore();
  const [markets] = useState<Market[]>([
    { id: 1, name: "Bitcoin", symbol: "BTC", price: 43567.89, change: 2.45 },
    { id: 2, name: "Ethereum", symbol: "ETH", price: 2234.56, change: -1.23 },
    { id: 3, name: "Binance Coin", symbol: "BNB", price: 312.45, change: 0.89 },
    { id: 4, name: "Cardano", symbol: "ADA", price: 1.23, change: -3.45 },
    { id: 5, name: "Solana", symbol: "SOL", price: 98.76, change: 5.67 },
    { id: 6, name: "Polkadot", symbol: "DOT", price: 21.34, change: 1.23 }
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      addNotification({
        title: "Markets updated",
        description: "Market data was refreshed.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Markets</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {markets.map((market) => (
          <div
            key={market.id}
            className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold tracking-tight">{market.name}</h3>
                <span className="text-[11px] font-medium text-muted-foreground">{market.symbol}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium tracking-tight">${market.price.toLocaleString()}</span>
              <span className={`text-[12px] font-medium ${market.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {market.change >= 0 ? '+' : ''}{market.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Markets; 