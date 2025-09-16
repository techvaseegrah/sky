import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET() {
  try {
    // Connect to the database
    await connectDB();
    
    // Fetch all expenses from MongoDB, sorted by the most recent date
    const expenses = await Expense.find({}).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ message: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Connect to the database
    await connectDB();
    
    // Create a new expense instance and save it to MongoDB
    const expense = new Expense(body);
    await expense.save();
    console.log('💾 Expense saved to MongoDB:', expense);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    // Provide a more detailed error message in the response for easier debugging
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      message: 'Failed to create expense', 
      error: errorMessage 
    }, { status: 500 });
  }
}