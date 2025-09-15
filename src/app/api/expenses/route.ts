import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET() {
  try {
    const connection = await connectDB();
    
    // If using mock connection (no MongoDB), return sample data
    if (connection.connection === 'mock') {
      console.log('📊 Returning mock expense data');
      return NextResponse.json([
        {
          _id: '1',
          category: 'Food Purchase',
          subcategory: 'Raw Materials',
          description: 'Sample expense - vegetables and spices',
          amount: 2500,
          date: new Date().toISOString(),
          supplier: 'Local Market',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
    
    const expenses = await Expense.find({}).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const connection = await connectDB();
    
    // If using mock connection (no MongoDB), return mock success
    if (connection.connection === 'mock') {
      console.log('💾 Mock expense saved:', body);
      const mockExpense = {
        _id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return NextResponse.json(mockExpense, { status: 201 });
    }
    
    const expense = new Expense(body);
    await expense.save();
    console.log('💾 Expense saved to MongoDB:', expense);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create expense', 
      details: errorMessage 
    }, { status: 500 });
  }
}