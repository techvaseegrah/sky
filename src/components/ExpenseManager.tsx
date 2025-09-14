'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { EXPENSE_CATEGORIES, getCategoryById, getSubcategoriesByCategory } from '@/lib/expenseCategories';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
  });
  const [formData, setFormData] = useState({
    category: 'food_purchase' as const,
    subcategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    if (filters.subcategory) {
      filtered = filtered.filter(expense => expense.subcategory === filters.subcategory);
    }

    if (filters.minAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(filters.maxAmount));
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(term) ||
        expense.supplier?.toLowerCase().includes(term) ||
        expense.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(expense => new Date(expense.date) >= startDate);
    }

    setFilteredExpenses(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date),
        }),
      });

      if (response.ok) {
        const newExpense = await response.json();
        setExpenses([newExpense, ...expenses]);
        setFormData({
          category: 'food_purchase',
          subcategory: '',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          supplier: '',
          tags: [],
        });
        setTagInput('');
        setShowForm(false);
      } else {
        console.error('Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value as typeof formData.category,
        subcategory: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFilters({
        ...filters,
        [name]: value,
        subcategory: '',
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      dateRange: 'all',
      minAmount: '',
      maxAmount: '',
      searchTerm: '',
    });
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, { total: number; count: number; subcategories: Record<string, number> }> = {};
    
    filteredExpenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { total: 0, count: 0, subcategories: {} };
      }
      
      categoryTotals[expense.category].total += expense.amount;
      categoryTotals[expense.category].count += 1;
      
      if (expense.subcategory) {
        categoryTotals[expense.category].subcategories[expense.subcategory] = 
          (categoryTotals[expense.category].subcategories[expense.subcategory] || 0) + expense.amount;
      }
    });
    
    return categoryTotals;
  };

  const getAvailableSubcategories = () => {
    return getSubcategoriesByCategory(formData.category);
  };

  const getFilterSubcategories = () => {
    return filters.category ? getSubcategoriesByCategory(filters.category) : [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading expenses...</div>
      </div>
    );
  }

  const categoryTotals = getExpensesByCategory();
  const availableSubcategories = getAvailableSubcategories();
  const filterSubcategories = getFilterSubcategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Business Expense Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '❌ Cancel' : '➕ Add Expense'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100">Total Expenses</p>
            <p className="text-3xl font-bold">₹{getTotalExpenses().toFixed(2)}</p>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100">Number of Expenses</p>
            <p className="text-3xl font-bold">{filteredExpenses.length}</p>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="text-center">
            <p className="text-indigo-100">Average Expense</p>
            <p className="text-3xl font-bold">
              ₹{filteredExpenses.length > 0 ? (getTotalExpenses() / filteredExpenses.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100">Categories</p>
            <p className="text-3xl font-bold">{Object.keys(categoryTotals).length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field text-sm"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              name="subcategory"
              value={filters.subcategory}
              onChange={handleFilterChange}
              className="input-field text-sm"
              disabled={!filters.category}
            >
              <option value="">All Subcategories</option>
              {filterSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="input-field text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (₹)</label>
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              className="input-field text-sm"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (₹)</label>
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              className="input-field text-sm"
              placeholder="999999"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              className="input-field text-sm"
              placeholder="Description, supplier..."
            />
          </div>
        </div>
        
        <button
          onClick={clearFilters}
          className="btn-secondary text-sm"
        >
          🗑️ Clear Filters
        </button>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPENSE_CATEGORIES.map((category) => {
            const categoryData = categoryTotals[category.id];
            return (
              <div key={category.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">
                    {category.icon} {category.name}
                  </h3>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{(categoryData?.total || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {categoryData?.count || 0} expenses
                </p>
                {categoryData?.subcategories && Object.keys(categoryData.subcategories).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(categoryData.subcategories).map(([subId, amount]) => {
                      const subcategory = category.subcategories.find(s => s.id === subId);
                      return (
                        <div key={subId} className="flex justify-between text-xs text-gray-600">
                          <span>{subcategory?.name || subId}</span>
                          <span>₹{(amount as number).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                placeholder="Describe the expense..."
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                💾 Save Expense
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Expense History ({filteredExpenses.length} of {expenses.length})</h2>
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {expenses.length === 0 ? 'No expenses recorded yet. Add your first expense above!' : 'No expenses match your current filters.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subcategory</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Supplier</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tags</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => {
                  const category = getCategoryById(expense.category);
                  const subcategory = expense.subcategory ? 
                    category?.subcategories.find(s => s.id === expense.subcategory) : null;
                  
                  return (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {category?.icon} {category?.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {subcategory?.name || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {expense.supplier || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {expense.tags && expense.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {expense.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}