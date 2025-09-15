'use client';

import { useState, useEffect } from 'react';
import { Expense, Transaction } from '@/types';
import { EXPENSE_CATEGORIES, getCategoryById } from '@/lib/expenseCategories';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    weeklyExpenses: 0,
    avgExpensePerDay: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses
      const expensesResponse = await fetch('/api/expenses');
      const expenses: Expense[] = await expensesResponse.json();
      
      // Calculate stats
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Get monthly expenses (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyExpenses = expenses.filter(expense => new Date(expense.date) >= thirtyDaysAgo);
      const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Get weekly expenses (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyExpenses = expenses.filter(expense => new Date(expense.date) >= sevenDaysAgo);
      const weeklyTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate average expense per day (last 30 days)
      const avgPerDay = monthlyTotal / 30;
      
      // Calculate expenses by category
      const categoryTotals: Record<string, number> = {};
      expenses.forEach((expense) => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
      
      setStats({
        totalExpenses: totalExpenses,
        monthlyExpenses: monthlyTotal,
        weeklyExpenses: weeklyTotal,
        avgExpensePerDay: avgPerDay,
      });
      
      setExpensesByCategory(categoryTotals);
      setRecentExpenses(expenses.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze your business expenses with detailed insights</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total Expenses</p>
              <p className="text-3xl font-bold">₹{stats.totalExpenses.toFixed(2)}</p>
            </div>
            <span className="text-4xl opacity-80">💰</span>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Monthly Expenses</p>
              <p className="text-3xl font-bold">₹{stats.monthlyExpenses.toFixed(2)}</p>
            </div>
            <span className="text-4xl opacity-80">📅</span>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Weekly Expenses</p>
              <p className="text-3xl font-bold">₹{stats.weeklyExpenses.toFixed(2)}</p>
            </div>
            <span className="text-4xl opacity-80">📈</span>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg. Daily Expense</p>
              <p className="text-3xl font-bold">₹{stats.avgExpensePerDay.toFixed(2)}</p>
            </div>
            <span className="text-4xl opacity-80">📉</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <div className="space-y-3">
            {EXPENSE_CATEGORIES.map((category) => {
              const amount = expensesByCategory[category.id] || 0;
              const percentage = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Business Expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-gray-500">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const category = getCategoryById(expense.category);
                
                return (
                  <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{category?.icon}</span>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {category?.name}
                          {expense.subcategory && (
                            <span className="text-gray-500"> • {expense.subcategory}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">₹{expense.amount.toFixed(2)}</p>
                      {expense.supplier && (
                        <p className="text-xs text-gray-500">{expense.supplier}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}