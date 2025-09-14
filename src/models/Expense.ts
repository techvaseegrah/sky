import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  category: 'food_purchase' | 'equipment' | 'utilities' | 'staff' | 'marketing' | 'maintenance' | 'other';
  subcategory?: string;
  description: string;
  amount: number;
  date: Date;
  supplier?: string;
  receipt?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  category: { 
    type: String, 
    required: true, 
    enum: ['food_purchase', 'equipment', 'utilities', 'staff', 'marketing', 'maintenance', 'other'] 
  },
  subcategory: { type: String },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  supplier: { type: String },
  receipt: { type: String },
  tags: [{ type: String }],
}, {
  timestamps: true,
});

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);