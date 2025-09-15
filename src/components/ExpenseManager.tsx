'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueSubcategories, setUniqueSubcategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [subcategorySearchTerm, setSubcategorySearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showFilterCategoryDropdown, setShowFilterCategoryDropdown] = useState(false);
  const [showFilterSubcategoryDropdown, setShowFilterSubcategoryDropdown] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
    supplier: '',
  });
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const filtered = applyEnhancedFilters();
    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  // Extract unique categories and subcategories from expenses
  useEffect(() => {
    if (expenses.length > 0) {
      const categories = Array.from(new Set(expenses.map(expense => expense.category).filter(Boolean)));
      const subcategories = Array.from(new Set(expenses.map(expense => expense.subcategory).filter(Boolean)));
      setUniqueCategories(categories);
      setUniqueSubcategories(subcategories as string[]);
    }
  }, [expenses]);

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
          category: '',
          subcategory: '',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          supplier: '',
        });
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
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle category selection from dropdown
  const handleCategorySelect = (category: string) => {
    setFormData({
      ...formData,
      category: category,
    });
    setShowCategoryDropdown(false);
  };

  // Handle subcategory selection from dropdown
  const handleSubcategorySelect = (subcategory: string) => {
    setFormData({
      ...formData,
      subcategory: subcategory,
    });
    setShowSubcategoryDropdown(false);
  };

  // Filter categories based on input - for form
  const getFilteredCategories = () => {
    if (!formData.category) return uniqueCategories;
    return uniqueCategories.filter(cat => 
      cat.toLowerCase().includes(formData.category.toLowerCase())
    );
  };

  // Filter subcategories based on input - for form
  const getFilteredSubcategories = () => {
    if (!formData.subcategory) return uniqueSubcategories;
    return uniqueSubcategories.filter(sub => 
      sub.toLowerCase().includes(formData.subcategory.toLowerCase())
    );
  };

  // Filter categories for filter dropdown
  const getFilteredCategoriesForFilter = () => {
    if (!filters.category) return uniqueCategories;
    return uniqueCategories.filter(cat => 
      cat.toLowerCase().includes(filters.category.toLowerCase())
    );
  };

  // Filter subcategories for filter dropdown
  const getFilteredSubcategoriesForFilter = () => {
    if (!filters.subcategory) return uniqueSubcategories;
    return uniqueSubcategories.filter(sub => 
      sub.toLowerCase().includes(filters.subcategory.toLowerCase())
    );
  };

  // Advanced search functionality
  const performAdvancedSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return expenses;
    
    const term = searchTerm.toLowerCase();
    return expenses.filter(expense => 
      expense.description.toLowerCase().includes(term) ||
      expense.category.toLowerCase().includes(term) ||
      expense.subcategory?.toLowerCase().includes(term) ||
      expense.supplier?.toLowerCase().includes(term) ||
      expense.amount.toString().includes(term) ||
      new Date(expense.date).toLocaleDateString().includes(term)
    );
  };

  // Handle filter category selection
  const handleFilterCategorySelect = (category: string) => {
    setFilters({
      ...filters,
      category: category,
    });
    setShowFilterCategoryDropdown(false);
  };

  // Handle filter subcategory selection
  const handleFilterSubcategorySelect = (subcategory: string) => {
    setFilters({
      ...filters,
      subcategory: subcategory,
    });
    setShowFilterSubcategoryDropdown(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Enhanced filter function to include supplier filter
  const applyEnhancedFilters = () => {
    let filtered = [...expenses];

    // Apply existing filters
    if (filters.category) {
      filtered = filtered.filter(expense => 
        expense.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.subcategory) {
      filtered = filtered.filter(expense => 
        expense.subcategory?.toLowerCase().includes(filters.subcategory.toLowerCase())
      );
    }

    // Add supplier filter
    if (filters.supplier) {
      filtered = filtered.filter(expense => 
        expense.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(filters.maxAmount));
    }

    // Enhanced search that covers all fields
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term) ||
        expense.subcategory?.toLowerCase().includes(term) ||
        expense.supplier?.toLowerCase().includes(term) ||
        expense.amount.toString().includes(term) ||
        new Date(expense.date).toLocaleDateString().includes(term)
      );
    }

    // Date range filter
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

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      dateRange: 'all',
      minAmount: '',
      maxAmount: '',
      searchTerm: '',
      supplier: '',
    });
    setShowFilterCategoryDropdown(false);
    setShowFilterSubcategoryDropdown(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading expenses...</div>
      </div>
    );
  }

  const categoryTotals = getExpensesByCategory();

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

      {/* Enhanced Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">🔍 Advanced Filters & Search</h2>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="btn-secondary text-sm"
          >
            {showFilterDropdown ? '🔽 Hide Filters' : '🔼 Show Filters'}
          </button>
        </div>
        
        {/* Quick Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Quick Search (searches all fields)</label>
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleFilterChange}
            className="input-field text-lg"
            placeholder="Search across description, category, subcategory, supplier, amount, date..."
          />
        </div>
        
        {showFilterDropdown && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">📋 Category Filter</label>
                <input
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  onFocus={() => setShowFilterCategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFilterCategoryDropdown(false), 200)}
                  className="input-field text-sm"
                  placeholder="Filter by category"
                />
                {showFilterCategoryDropdown && uniqueCategories.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-red-50 border-b border-gray-100 text-red-600 font-medium"
                      onClick={() => handleFilterCategorySelect('')}
                    >
                      ❌ Clear Category Filter
                    </button>
                    {getFilteredCategoriesForFilter().map((category, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleFilterCategorySelect(category)}
                      >
                        📋 {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">🏷️ Subcategory Filter</label>
                <input
                  type="text"
                  name="subcategory"
                  value={filters.subcategory}
                  onChange={handleFilterChange}
                  onFocus={() => setShowFilterSubcategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFilterSubcategoryDropdown(false), 200)}
                  className="input-field text-sm"
                  placeholder="Filter by subcategory"
                />
                {showFilterSubcategoryDropdown && uniqueSubcategories.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-red-50 border-b border-gray-100 text-red-600 font-medium"
                      onClick={() => handleFilterSubcategorySelect('')}
                    >
                      ❌ Clear Subcategory Filter
                    </button>
                    {getFilteredSubcategoriesForFilter().map((subcategory, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleFilterSubcategorySelect(subcategory)}
                      >
                        🏷️ {subcategory}
                      </button>
                    ))}
                  </div>
                )}
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📅 Date Range</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">💰 Min Amount (₹)</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  className="input-field text-sm"
                  placeholder="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">💰 Max Amount (₹)</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  className="input-field text-sm"
                  placeholder="999999"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏪 Supplier Filter</label>
                <input
                  type="text"
                  name="supplier"
                  value={filters.supplier || ''}
                  onChange={handleFilterChange}
                  className="input-field text-sm"
                  placeholder="Filter by supplier name"
                />
              </div>
            </div>
            
            {/* Filter Results Summary */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {filteredExpenses.length} of {expenses.length} expenses
                {filters.category && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Category: {filters.category}</span>}
                {filters.subcategory && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Subcategory: {filters.subcategory}</span>}
                {filters.searchTerm && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Search: "{filters.searchTerm}"</span>}
                {(filters.minAmount || filters.maxAmount) && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Amount: ₹{filters.minAmount || '0'} - ₹{filters.maxAmount || '∞'}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-sm"
                >
                  🗑️ Clear All Filters
                </button>
                <button
                  onClick={() => {
                    const total = getTotalExpenses();
                    const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;
                    alert(`Filter Results:

Total Expenses: ₹${total.toFixed(2)}
Number of Expenses: ${filteredExpenses.length}
Average: ₹${avg.toFixed(2)}
Categories: ${Object.keys(getExpensesByCategory()).length}`);
                  }}
                  className="btn-primary text-sm"
                >
                  📊 Quick Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">📊 Expenses by Category</h2>
          {Object.keys(categoryTotals).length > 0 && (
            <div className="text-sm text-gray-500">
              {Object.keys(categoryTotals).length} categories • ₹{getTotalExpenses().toFixed(2)} total
            </div>
          )}
        </div>
        {Object.keys(categoryTotals).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500">No categories to display</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b.total - a.total) // Sort by amount descending
              .map(([categoryName, categoryData]) => {
                const percentage = ((categoryData.total / getTotalExpenses()) * 100).toFixed(1);
                return (
                  <div key={categoryName} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        📋 {categoryName}
                      </h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          ₹{categoryData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">{percentage}% of total</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        📈 {categoryData.count} {categoryData.count === 1 ? 'expense' : 'expenses'}
                      </span>
                      <span className="text-sm text-gray-600">
                        💰 Avg: ₹{(categoryData.total / categoryData.count).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    {categoryData.subcategories && Object.keys(categoryData.subcategories).length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500 font-medium mb-2">🏷️ Subcategories:</div>
                        {Object.entries(categoryData.subcategories)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 3) // Show top 3 subcategories
                          .map(([subName, amount]) => {
                            const subPercentage = (((amount as number) / categoryData.total) * 100).toFixed(1);
                            return (
                              <div key={subName} className="flex justify-between text-xs bg-white bg-opacity-60 px-2 py-1 rounded">
                                <span className="text-gray-700 truncate flex-1 mr-2">{subName}</span>
                                <span className="text-gray-600 font-medium whitespace-nowrap">
                                  ₹{(amount as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({subPercentage}%)
                                </span>
                              </div>
                            );
                          })}
                        {Object.keys(categoryData.subcategories).length > 3 && (
                          <div className="text-xs text-gray-400 italic px-2">
                            +{Object.keys(categoryData.subcategories).length - 3} more subcategories
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        )}
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📋 Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                  className="input-field"
                  placeholder="Type to search or enter new category (e.g. Food Purchase, Equipment)"
                  required
                />
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {formData.category && !uniqueCategories.some(cat => cat.toLowerCase() === formData.category.toLowerCase()) && (
                      <div className="px-3 py-2 bg-green-50 border-b border-gray-100">
                        <div className="text-sm text-green-700 font-medium">✨ Create New Category:</div>
                        <div className="text-sm text-green-600">📋 "{formData.category}"</div>
                      </div>
                    )}
                    {getFilteredCategories().length > 0 ? (
                      <>
                        <div className="px-3 py-2 bg-blue-50 border-b border-gray-100 text-xs text-blue-600 font-medium uppercase tracking-wide">
                          📋 Existing Categories ({getFilteredCategories().length})
                        </div>
                        {getFilteredCategories().map((category, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                            onClick={() => handleCategorySelect(category)}
                          >
                            <span>📋 {category}</span>
                            <span className="text-xs text-gray-400 group-hover:text-blue-600">Click to select</span>
                          </button>
                        ))}
                      </>
                    ) : formData.category && (
                      <div className="px-3 py-2 text-sm text-gray-500 italic">
                        🔍 No existing categories match "{formData.category}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏷️ Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  onFocus={() => setShowSubcategoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)}
                  className="input-field"
                  placeholder="Type to search or enter new subcategory (e.g. Raw Materials, Kitchen Equipment)"
                />
                {showSubcategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {formData.subcategory && !uniqueSubcategories.some(sub => sub.toLowerCase() === formData.subcategory.toLowerCase()) && (
                      <div className="px-3 py-2 bg-green-50 border-b border-gray-100">
                        <div className="text-sm text-green-700 font-medium">✨ Create New Subcategory:</div>
                        <div className="text-sm text-green-600">🏷️ "{formData.subcategory}"</div>
                      </div>
                    )}
                    {getFilteredSubcategories().length > 0 ? (
                      <>
                        <div className="px-3 py-2 bg-purple-50 border-b border-gray-100 text-xs text-purple-600 font-medium uppercase tracking-wide">
                          🏷️ Existing Subcategories ({getFilteredSubcategories().length})
                        </div>
                        {getFilteredSubcategories().map((subcategory, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                            onClick={() => handleSubcategorySelect(subcategory)}
                          >
                            <span>🏷️ {subcategory}</span>
                            <span className="text-xs text-gray-400 group-hover:text-purple-600">Click to select</span>
                          </button>
                        ))}
                      </>
                    ) : formData.subcategory && (
                      <div className="px-3 py-2 text-sm text-gray-500 italic">
                        🔍 No existing subcategories match "{formData.subcategory}"
                      </div>
                    )}
                  </div>
                )}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            📊 Expense History ({filteredExpenses.length} of {expenses.length})
          </h2>
          {filteredExpenses.length !== expenses.length && (
            <div className="text-sm text-gray-500">
              🔍 Filtered results - showing {((filteredExpenses.length / expenses.length) * 100).toFixed(1)}% of total
            </div>
          )}
        </div>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            {expenses.length === 0 ? (
              <div>
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg mb-2">No expenses recorded yet</p>
                <p className="text-gray-400 text-sm">Add your first expense using the button above!</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg mb-2">No expenses match your current filters</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your search criteria or clearing filters</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary text-sm"
                >
                  🗑️ Clear All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">📅 Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">📋 Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">🏷️ Subcategory</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">📝 Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">🏪 Supplier</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">💰 Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense, index) => {
                  // Highlight search terms in text
                  const highlightText = (text: string, searchTerm: string) => {
                    if (!searchTerm || !text) return text;
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    const parts = text.split(regex);
                    return parts.map((part, i) => 
                      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
                    );
                  };
                  
                  return (
                    <tr key={expense._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📋 {highlightText(expense.category, filters.searchTerm)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {expense.subcategory ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            🏷️ {highlightText(expense.subcategory, filters.searchTerm)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={expense.description}>
                          {highlightText(expense.description, filters.searchTerm)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {expense.supplier ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🏪 {highlightText(expense.supplier, filters.searchTerm)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className="font-bold text-gray-900">
                          ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
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