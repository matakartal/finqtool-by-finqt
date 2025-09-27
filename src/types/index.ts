import { LucideIcon } from 'lucide-react';

export interface TabConfig {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StorageConfig {
  autoRefresh: boolean;
  fontSize: 'original' | 'medium' | 'large';
  // Add other storage configurations as needed
} 