// Navigation Types
export type TabType = 'dashboard' | 'expenses';

// Database Entity Types
export interface Expense {
  _id?: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: Date;
  supplier?: string;
  receipt?: string;
  tags?: string[]; 
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: ExpenseSubcategory[];
}

export interface ExpenseSubcategory {
  id: string;
  name: string;
  description?: string;
}

export interface Transaction {
  _id?: string;
  type: 'sale' | 'purchase' | 'expense';
  totalAmount: number;
  date: Date;
  customer?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}