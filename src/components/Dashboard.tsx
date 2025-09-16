'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { getCategoryById } from '@/lib/expenseCategories'; // We still need this for names/icons
import { Wallet, CalendarDays, LineChart, TrendingDown, RefreshCw } from 'lucide-react';

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
      
      const expensesResponse = await fetch('/api/expenses');
      const expensesData: Expense[] = await expensesResponse.json();
      const expenses = Array.isArray(expensesData) ? expensesData : [];

      if (!Array.isArray(expensesData)) {
          console.warn("API for expenses did not return an array. Response:", expensesData);
      }
      
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthlyExpenses = expenses.filter(expense => new Date(expense.date) >= thirtyDaysAgo);
      const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weeklyExpenses = expenses.filter(expense => new Date(expense.date) >= sevenDaysAgo);
      const weeklyTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      const avgPerDay = monthlyTotal > 0 ? monthlyTotal / 30 : 0;
      
      const categoryTotals: Record<string, number> = {};
      expenses.forEach((expense) => {
        // Use the category name directly as the key
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
      
      setStats({
        totalExpenses,
        monthlyExpenses: monthlyTotal,
        weeklyExpenses: weeklyTotal,
        avgExpensePerDay: avgPerDay,
      });
      
      setExpensesByCategory(categoryTotals);
      // The API already sorts by date, so we can just take the first 5 for "Recent"
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
          className="btn-secondary flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white"><div className="flex items-center justify-between"><div><p className="text-red-100">Total Expenses</p><p className="text-3xl font-bold">₹{stats.totalExpenses.toFixed(2)}</p></div><Wallet className="h-10 w-10 opacity-80" /></div></div>
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="flex items-center justify-between"><div><p className="text-blue-100">Monthly Expenses</p><p className="text-3xl font-bold">₹{stats.monthlyExpenses.toFixed(2)}</p></div><CalendarDays className="h-10 w-10 opacity-80" /></div></div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="flex items-center justify-between"><div><p className="text-green-100">Weekly Expenses</p><p className="text-3xl font-bold">₹{stats.weeklyExpenses.toFixed(2)}</p></div><LineChart className="h-10 w-10 opacity-80" /></div></div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white"><div className="flex items-center justify-between"><div><p className="text-purple-100">Avg. Daily Expense</p><p className="text-3xl font-bold">₹{stats.avgExpensePerDay.toFixed(2)}</p></div><TrendingDown className="h-10 w-10 opacity-80" /></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <div className="space-y-4">
            {Object.keys(expensesByCategory).length > 0 ? (
              Object.entries(expensesByCategory)
                .sort(([, amountA], [, amountB]) => amountB - amountA)
                .map(([categoryName, amount]) => {
                  const percentage = stats.totalExpenses > 0 ? (amount / stats.totalExpenses) * 100 : 0;
                  return (
                    <div key={categoryName}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-800">{categoryName}</p>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500 text-center py-4">No expenses found for any category.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Business Expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-gray-500">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const categoryInfo = getCategoryById(expense.category);
                return (
                  <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      {categoryInfo?.icon && <span className="text-xl mt-1">{categoryInfo.icon}</span>}
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {expense.category}
                          {expense.subcategory && <span className="text-gray-500"> • {expense.subcategory}</span>}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">₹{expense.amount.toFixed(2)}</p>
                      {expense.supplier && <p className="text-xs text-gray-500">{expense.supplier}</p>}
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