import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Reusable main card container for consistent style
export const MainCard: React.FC<{children: React.ReactNode; className?: string}> = ({children, className = ''}) => (
  <Card className={`rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card shadow-lg overflow-hidden animate-fadeScaleIn transition-all hover:shadow-xl ${className}`}>
    {children}
  </Card>
);

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  category: 'crypto' | 'market';
  description: string;
  country?: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: 'BTC Halving Event',
    date: '2024-04-19',
    time: '14:30',
    impact: 'high',
    category: 'crypto',
    description: 'Bitcoin block reward halving, occurs approximately every 4 years.',
    country: 'Global',
    actual: 'Done',
    forecast: 'Apr 19',
    previous: 'May 2020'
  },
  {
    id: 2,
    title: 'ETH Shanghai Fork',
    date: '2024-04-21',
    time: '10:00',
    impact: 'high',
    category: 'crypto',
    description: 'Ethereum network upgrade introducing new features and optimizations.',
    country: 'Global',
    forecast: 'Apr 21',
    previous: 'Mar 2023'
  },
  {
    id: 3,
    title: 'US CPI Data Release',
    date: '2024-04-20',
    time: '08:30',
    impact: 'medium',
    category: 'market',
    description: 'Consumer Price Index data release, potential impact on crypto markets.',
    country: 'US',
    actual: '3.5%',
    forecast: '3.4%',
    previous: '3.2%'
  },
  {
    id: 4,
    title: 'FOMC Meeting Minutes',
    date: '2024-04-22',
    time: '14:00',
    impact: 'high',
    category: 'market',
    description: 'Federal Reserve interest rate decision and policy statement.',
    country: 'US',
    forecast: '5.5%',
    previous: '5.5%'
  },
  {
    id: 5,
    title: 'BNB Quarterly Burn',
    date: '2024-04-23',
    time: '09:00',
    impact: 'medium',
    category: 'crypto',
    description: 'Binance token quarterly burning event reducing circulating supply.',
    country: 'Global',
    forecast: '2M BNB',
    previous: '1.85M BNB'
  },
  // Adding more dummy data
  {
    id: 6,
    title: 'SOL Ecosystem Conference',
    date: '2024-04-19',
    time: '16:00',
    impact: 'medium',
    category: 'crypto',
    description: 'Major Solana ecosystem conference announcing new projects.',
    country: 'Global',
    forecast: 'New DeFi launches',
    previous: 'N/A'
  },
  {
    id: 7,
    title: 'UK GDP Quarterly Report',
    date: '2024-04-19',
    time: '09:30',
    impact: 'medium',
    category: 'market',
    description: 'UK Gross Domestic Product quarterly growth report.',
    country: 'UK',
    actual: '0.3%',
    forecast: '0.2%',
    previous: '0.1%'
  },
  {
    id: 8,
    title: 'AVAX Subnet Update',
    date: '2024-04-19',
    time: '20:00',
    impact: 'low',
    category: 'crypto',
    description: 'Avalanche subnet architecture updates and performance improvements.',
    country: 'Global',
    forecast: 'Improved TPS',
    previous: 'N/A'
  },
  {
    id: 9,
    title: 'Japan Interest Rate Decision',
    date: '2024-04-19',
    time: '03:00',
    impact: 'high',
    category: 'market',
    description: 'Bank of Japan interest rate decision and monetary policy statement.',
    country: 'JP',
    actual: '0.1%',
    forecast: '0.1%',
    previous: '0.0%'
  },
  {
    id: 10,
    title: 'DOT Parachain Auctions',
    date: '2024-04-19',
    time: '12:00',
    impact: 'medium',
    category: 'crypto',
    description: 'New round of Polkadot parachain slot auctions beginning.',
    country: 'Global',
    forecast: '5 new parachains',
    previous: '4 parachains'
  }
];

const EconomicCalendar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const isMobile = useIsMobile();
  
  // Group events by date
  const eventsByDate = mockEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-crypto-red/20 text-crypto-red border-crypto-red/30 text-[10px] sm:text-xs">
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-[10px] sm:text-xs">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-crypto-green/20 text-crypto-green border-crypto-green/30 text-[10px] sm:text-xs">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would fetch new data here
      setIsLoading(false);
    }, 1000);
  };
  
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };
  
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };
  
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
  };
  // Get today's events or an empty array if none
  const todaysEvents = eventsByDate[selectedDate] || [];

  return (
    <MainCard className="space-y-2 sm:space-y-3 p-4">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <span>Economic Calendar</span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw size={14} className={cn("text-muted-foreground", isLoading && "animate-spin")} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousDay}
            className="h-7 px-2"
          >
            <ChevronLeft size={16} />
            <span className="sr-only">Previous Day</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-xs sm:text-sm h-7"
          >
            {formatDate(selectedDate)}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextDay}
            className="h-7 px-2"
          >
            <ChevronRight size={16} />
            <span className="sr-only">Next Day</span>
          </Button>
        </div>
      </CardHeader>
      
      <div className="w-full max-w-4xl mx-auto py-2">
        {todaysEvents.length > 0 ? (
          <div className="overflow-y-auto rounded-md border animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 py-2 px-3 text-xs">Time</TableHead>
                  {!isMobile && <TableHead className="w-24 py-2 px-3 text-xs">Country</TableHead>}
                  <TableHead className="py-2 px-3 text-xs">Event</TableHead>
                  <TableHead className="py-2 px-3 text-xs">Impact</TableHead>
                  {!isMobile && (
                    <>
                      <TableHead className="py-2 px-3 text-xs">Actual</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Forecast</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Previous</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-muted/50 border-t">
                    <TableCell className="py-2 px-3 text-xs">{event.time}</TableCell>
                    {!isMobile && (
                      <TableCell className="py-2 px-3 text-xs">
                        {event.country === 'US' && '🇺🇸'}
                        {event.country === 'Global' && '🌐'}
                        {event.country === 'UK' && '🇬🇧'}
                        {event.country === 'JP' && '🇯🇵'}
                        {event.country !== 'US' && event.country !== 'Global' && 
                         event.country !== 'UK' && event.country !== 'JP' && event.country}
                      </TableCell>
                    )}
                    <TableCell className="py-2 px-3 text-xs font-medium">
                      <div className="flex flex-col">
                        <span>{event.title}</span>
                        {isMobile && (
                          <span className="text-[10px] text-muted-foreground mt-1">
                            {event.description.substring(0, 40)}...
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-3 text-xs">
                      {getImpactBadge(event.impact)}
                    </TableCell>
                    {!isMobile && (
                      <>
                        <TableCell className="py-2 px-3 text-xs font-mono">
                          {event.actual && (
                            <span className="text-crypto-green">{event.actual}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-mono">
                          {event.forecast}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-mono">
                          {event.previous}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                className="mt-2"
              >
                Return to today
              </Button>
            </div>
          )}
          
          <div className="mt-4 py-2 text-[10px] text-center text-muted-foreground">
            All times shown in UTC • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EconomicCalendar;
