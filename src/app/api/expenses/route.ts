import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // --- Pagination Logic Start ---

    // 1. Get page and limit from query parameters, with default values
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);

    // Ensure page and limit are positive numbers
    const pageNumber = Math.max(1, page);
    const limitNumber = Math.max(1, limit);

    // 2. Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // 3. Fetch a specific page of expenses and the total count of expenses
    // We run two queries in parallel for better performance
    const [expenses, totalExpenses] = await Promise.all([
      Expense.find({})
        .sort({ date: -1 }) // Sort by most recent date
        .skip(skip)         // Skip documents for previous pages
        .limit(limitNumber), // Limit the number of documents per page
      Expense.countDocuments({}) // Get the total number of expenses
    ]);

    // 4. Calculate total pages
    const totalPages = Math.ceil(totalExpenses / limitNumber);

    // --- Pagination Logic End ---

    // 5. Return the paginated data and metadata
    return NextResponse.json({
      data: expenses,
      pagination: {
        totalExpenses,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
    });

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