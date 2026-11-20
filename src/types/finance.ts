export type MovementType = 'income' | 'expense';

export interface Movement {
  id: string;
  type: MovementType;
  concept: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  executionDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
}

export type AppTab = 'home' | 'history' | 'activities';

export type HistoryFilter = 'all' | 'income' | 'expense';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'error' | 'warning';
}
