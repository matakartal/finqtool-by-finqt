import { TabConfig } from '@/types';
import { BarChart3, Calculator, DollarSign, Banknote, FileText, ShieldCheck } from 'lucide-react';

export const TABS: TabConfig[] = [
  {
    id: 'markets',
    label: 'Markets',
    icon: Banknote,
    description: 'Live market data for top crypto pairs.'
  },
  {
    id: 'financial',
    label: 'Tools',
    icon: DollarSign,
    description: 'Essential calculators for risk, position sizing, and more—designed for crypto traders. All calculations run locally, no data is sent anywhere.'
  },
  {
    id: 'calculator',
    label: 'Basic Calculator',
    icon: Calculator,
    description: 'A simple calculator for quick math and conversions.'
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: FileText,
    description: 'Take and manage your trading notes.'
  },
  {
    id: 'rules',
    label: 'Rules',
    icon: ShieldCheck,
    description: 'Trading rules and guidelines.'
  }
]; 