import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'sale' | 'purchase' | 'expense';
  canteenId?: mongoose.Types.ObjectId;
  canteenName?: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount: number;
  date: Date;
  customer?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['sale', 'purchase', 'expense'] 
  },
  itemId: { type: Schema.Types.ObjectId },
  itemName: { type: String },
  quantity: { type: Number },
  unitPrice: { type: Number },
  totalAmount: { type: Number, required: true },
  date: { type: Date, required: true },
  customer: { type: String },
  notes: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);