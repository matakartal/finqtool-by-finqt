import { LucideIcon } from 'lucide-react';

export interface TabConfig {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StorageConfig {
  autoRefresh: boolean;
  // Add other storage configurations as needed
} 