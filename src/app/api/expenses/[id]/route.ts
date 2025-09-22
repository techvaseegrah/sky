// src/app/api/expenses/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

// 1. Define a clear, reusable type for the props object.
type Props = {
  params: {
    id: string;
  };
};

// HANDLER FOR UPDATING AN EXPENSE (PUT)
export async function PUT(
  request: NextRequest,
  // 2. Use the named type `Props` while destructuring `params`.
  // This satisfies both the build-time type checker and the runtime.
  { params }: Props
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    await connectDB();
    
    const updatedExpense = await Expense.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!updatedExpense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    console.log('✅ Expense updated in MongoDB:', updatedExpense);
    return NextResponse.json(updatedExpense, { status: 200 });

  } catch (error) {
    console.error('Error updating expense:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      message: 'Failed to update expense', 
      error: errorMessage 
    }, { status: 500 });
  }
}

// HANDLER FOR DELETING AN EXPENSE (DELETE)
export async function DELETE(
  request: NextRequest,
  // Use the same robust pattern here.
  { params }: Props
) {
  try {
    const { id } = params;

    await connectDB();

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    console.log('🗑️ Expense deleted from MongoDB:', deletedExpense);
    return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting expense:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      message: 'Failed to delete expense', 
      error: errorMessage 
    }, { status: 500 });
  }
}