// Add these new types to your existing types file

export type TabType = 'dashboard' | 'expenses' | 'liquor-purchase' | 'sales';

export interface Expense {
  _id?: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: string | Date;
  supplier?: string;
}

// --- NEW TYPES FOR TRANSACTIONS ---

export interface TransactionItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Purchase {
  _id: string;
  invoiceNumber: string;
  date: string | Date;
  supplier: string;
  items: TransactionItem[];
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Cancelled';
}

export interface Sale {
  _id: string;
  orderNumber: string;
  date: string | Date;
  customerName: string;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Online';
}