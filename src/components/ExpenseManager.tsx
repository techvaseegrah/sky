'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
// Import the necessary icons from lucide-react
import { 
  PlusCircle, X, SlidersHorizontal, LayoutGrid, Tag, Calendar, Store, 
  XCircle, Trash2, BarChart3, PieChart, Hash, Sparkles, Save, 
  History, FileText, SearchX, Calculator, Pencil, AlertTriangle 
} from 'lucide-react';
import Pagination from './Pagination'; // 1. Import the Pagination component

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueSubcategories, setUniqueSubcategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showFilterCategoryDropdown, setShowFilterCategoryDropdown] = useState(false);
  const [showFilterSubcategoryDropdown, setShowFilterSubcategoryDropdown] = useState(false);
  
  // State to manage editing and deletion
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 2. Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // You can adjust this value

  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    dateRange: 'all',
  });

  const defaultFormData = {
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [summaryData, setSummaryData] = useState({
    total: 0,
    count: 0,
    avg: '0.00',
    numCategories: 0,
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const filtered = applyEnhancedFilters();
    setFilteredExpenses(filtered);
    // 6. Reset to page 1 when filters change
    setCurrentPage(1);
  }, [expenses, filters]);

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
      // 7. Adjust fetch to get all items by setting a high limit, and handle the API's object response
      // This preserves client-side filtering. For very large datasets, server-side filtering would be better.
      const response = await fetch('/api/expenses?page=1&limit=10000');
      const result = await response.json();
      
      if (result && Array.isArray(result.data)) {
        setExpenses(result.data);
      } else {
        console.warn("API did not return the expected data structure. Defaulting to empty array.", result);
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingExpenseId ? 'PUT' : 'POST';
    const url = editingExpenseId ? `/api/expenses/${editingExpenseId}` : '/api/expenses';
    
    try {
      const response = await fetch(url, {
        method,
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
        const resultExpense = await response.json();
        if (editingExpenseId) {
          // Update the expense in the list
          setExpenses(expenses.map(exp => exp._id === editingExpenseId ? resultExpense : exp));
        } else {
          // Add the new expense to the list
          setExpenses([resultExpense, ...expenses]);
        }
        resetFormAndState();
      } else {
        let errorMessage = `Failed to ${editingExpenseId ? 'update' : 'create'} expense. Status: ${response.status}`;
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('A network or parsing error occurred:', error);
      alert('A network error occurred. Please check your connection and try again.');
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpenseId(expense._id);
    setFormData({
      ...expense,
      amount: expense.amount.toString(),
      date: new Date(expense.date).toISOString().split('T')[0],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const response = await fetch(`/api/expenses/${deleteConfirmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExpenses(expenses.filter(exp => exp._id !== deleteConfirmId));
        setDeleteConfirmId(null); // Close the modal
      } else {
        alert('Failed to delete expense.');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('An error occurred while deleting the expense.');
    }
  };
  
  const resetFormAndState = () => {
    setFormData(defaultFormData);
    setShowForm(false);
    setEditingExpenseId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (category: string) => { setFormData({ ...formData, category }); setShowCategoryDropdown(false); };
  const handleSubcategorySelect = (subcategory: string) => { setFormData({ ...formData, subcategory }); setShowSubcategoryDropdown(false); };
  const getFilteredCategories = () => { if (!formData.category) return uniqueCategories; return uniqueCategories.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase())); };
  const getFilteredSubcategories = () => { if (!formData.subcategory) return uniqueSubcategories; return uniqueSubcategories.filter(sub => sub.toLowerCase().includes(formData.subcategory.toLowerCase())); };
  const getFilteredCategoriesForFilter = () => { if (!filters.category) return uniqueCategories; return uniqueCategories.filter(cat => cat.toLowerCase().includes(filters.category.toLowerCase())); };
  const getFilteredSubcategoriesForFilter = () => { if (!filters.subcategory) return uniqueSubcategories; return uniqueSubcategories.filter(sub => sub.toLowerCase().includes(filters.subcategory.toLowerCase())); };
  const handleFilterCategorySelect = (category: string) => { setFilters({ ...filters, category }); setShowFilterCategoryDropdown(false); };
  const handleFilterSubcategorySelect = (subcategory: string) => { setFilters({ ...filters, subcategory }); setShowFilterSubcategoryDropdown(false); };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFilters({ ...filters, [name]: value }); };
  const applyEnhancedFilters = () => {
    let filtered = [...(expenses || [])];
    if (filters.category) { filtered = filtered.filter(e => e.category.toLowerCase().includes(filters.category.toLowerCase())); }
    if (filters.subcategory) { filtered = filtered.filter(e => e.subcategory?.toLowerCase().includes(filters.subcategory.toLowerCase())); }
    if (filters.dateRange !== 'all') { const now = new Date(); const startDate = new Date(); switch (filters.dateRange) { case 'today': startDate.setHours(0, 0, 0, 0); break; case 'week': startDate.setDate(now.getDate() - 7); break; case 'month': startDate.setMonth(now.getMonth() - 1); break; case 'quarter': startDate.setMonth(now.getMonth() - 3); break; case 'year': startDate.setFullYear(now.getFullYear() - 1); break; } filtered = filtered.filter(e => new Date(e.date) >= startDate); }
    return filtered;
  };
  const clearFilters = () => { setFilters({ category: '', subcategory: '', dateRange: 'all' }); setShowFilterCategoryDropdown(false); setShowFilterSubcategoryDropdown(false); };
  const getTotalExpenses = () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, { total: number; count: number; subcategories: Record<string, number> }> = {};
    filteredExpenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) { categoryTotals[expense.category] = { total: 0, count: 0, subcategories: {} }; }
      categoryTotals[expense.category].total += expense.amount;
      categoryTotals[expense.category].count += 1;
      if (expense.subcategory) { categoryTotals[expense.category].subcategories[expense.subcategory] = (categoryTotals[expense.category].subcategories[expense.subcategory] || 0) + expense.amount; }
    });
    return categoryTotals;
  };
  const handleShowSummary = () => { const total = getTotalExpenses(); const count = filteredExpenses.length; const avg = count > 0 ? (total / count).toFixed(2) : '0.00'; const numCategories = Object.keys(getExpensesByCategory()).length; setSummaryData({ total, count, avg, numCategories }); setShowSummaryCard(true); };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading expenses...</div></div>;
  }

  const categoryTotals = getExpensesByCategory();

  // 3. Calculate the items for the current page
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* ... (SummaryCard, DeleteConfirm, Header, StatCards, and Form components remain unchanged) ... */}
      {showSummaryCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center"><BarChart3 className="h-5 w-5 mr-3 text-gray-500" />Filtered Results Summary</h2><button onClick={() => setShowSummaryCard(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button></div>
            <div className="space-y-4"><div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Total Expenses</span><span className="font-bold text-lg text-blue-600">₹{summaryData.total.toFixed(2)}</span></div><div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Number of Expenses</span><span className="font-bold text-lg">{summaryData.count}</span></div><div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Average Expense</span><span className="font-bold text-lg">₹{summaryData.avg}</span></div><div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Number of Categories</span><span className="font-bold text-lg">{summaryData.numCategories}</span></div></div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-sm">
            <h2 className="text-xl font-semibold flex items-center mb-4"><AlertTriangle className="h-5 w-5 mr-3 text-red-500" /> Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3"><button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">Cancel</button><button onClick={handleDelete} className="btn-danger flex items-center"><Trash2 className="h-4 w-4 mr-2"/>Confirm Delete</button></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Business Expense Management</h1>
        <button onClick={() => { if (editingExpenseId) { resetFormAndState(); } else { setShowForm(!showForm); } }} className="btn-primary flex items-center">
          {showForm ? <><X className="h-4 w-4 mr-2" /> Cancel</> : <><PlusCircle className="h-4 w-4 mr-2" /> Add Expense</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="text-center"><p className="text-blue-100">Total Expenses</p><p className="text-3xl font-bold">₹{getTotalExpenses().toFixed(2)}</p></div></div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white"><div className="text-center"><p className="text-purple-100">Number of Expenses</p><p className="text-3xl font-bold">{filteredExpenses.length}</p></div></div>
        <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"><div className="text-center"><p className="text-indigo-100">Average Expense</p><p className="text-3xl font-bold">₹{filteredExpenses.length > 0 ? (getTotalExpenses() / filteredExpenses.length).toFixed(2) : '0.00'}</p></div></div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="text-center"><p className="text-green-100">Categories</p><p className="text-3xl font-bold">{Object.keys(categoryTotals).length}</p></div></div>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">{editingExpenseId ? 'Edit Expense' : 'Add New Expense'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>Category</label><input type="text" name="category" value={formData.category} onChange={handleInputChange} onFocus={() => setShowCategoryDropdown(true)} onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)} className="input-field" placeholder="e.g. Office Supplies" required />{showCategoryDropdown && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">{formData.category && !uniqueCategories.some(c=>c.toLowerCase()===formData.category.toLowerCase()) && <div className="px-3 py-2 bg-green-50 text-sm text-green-700 font-medium flex items-center"><Sparkles className="h-4 w-4 mr-2"/>Create New: "{formData.category}"</div>}{getFilteredCategories().length>0&&getFilteredCategories().map((cat,i)=><button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center" onClick={()=>handleCategorySelect(cat)}><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>{cat}</button>)}</div>}</div>
              <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-400"/>Subcategory</label><input type="text" name="subcategory" value={formData.subcategory} onChange={handleInputChange} onFocus={() => setShowSubcategoryDropdown(true)} onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)} className="input-field" placeholder="e.g. Stationery" />{showSubcategoryDropdown && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">{formData.subcategory && !uniqueSubcategories.some(s=>s.toLowerCase()===formData.subcategory.toLowerCase()) && <div className="px-3 py-2 bg-green-50 text-sm text-green-700 font-medium flex items-center"><Sparkles className="h-4 w-4 mr-2"/>Create New: "{formData.subcategory}"</div>}{getFilteredSubcategories().length>0&&getFilteredSubcategories().map((sub,i)=><button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-purple-50 flex items-center" onClick={()=>handleSubcategorySelect(sub)}><Tag className="h-4 w-4 mr-2 text-gray-400"/>{sub}</button>)}</div>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label><input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field" step="0.01" min="0" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier (Optional)</label><input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} className="input-field" placeholder="Enter supplier name" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field" rows={3} placeholder="Describe the expense..." required /></div>
            <div className="flex space-x-4"><button type="submit" className="btn-primary flex items-center"><Save className="h-4 w-4 mr-2"/>{editingExpenseId ? 'Update Expense' : 'Save Expense'}</button><button type="button" onClick={resetFormAndState} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}
      
      {/* ... (Filter and Category sections remain unchanged) ... */}
      <div className="card">
        <h2 className="text-xl font-semibold flex items-center mb-4"><SlidersHorizontal className="h-5 w-5 mr-3 text-gray-500" /> Advanced Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>Category Filter</label><input type="text" name="category" value={filters.category} onChange={handleFilterChange} onFocus={() => setShowFilterCategoryDropdown(true)} onBlur={() => setTimeout(() => setShowFilterCategoryDropdown(false), 200)} className="input-field text-sm" placeholder="Filter by category"/>{showFilterCategoryDropdown && uniqueCategories.length > 0 && <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"><button type="button" className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 font-medium flex items-center" onClick={() => handleFilterCategorySelect('')}><XCircle className="h-4 w-4 mr-2"/>Clear Filter</button>{getFilteredCategoriesForFilter().map((cat, i) => <button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center" onClick={() => handleFilterCategorySelect(cat)}><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>{cat}</button>)}</div>}</div>
            <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-400"/>Subcategory Filter</label><input type="text" name="subcategory" value={filters.subcategory} onChange={handleFilterChange} onFocus={() => setShowFilterSubcategoryDropdown(true)} onBlur={() => setTimeout(() => setShowFilterSubcategoryDropdown(false), 200)} className="input-field text-sm" placeholder="Filter by subcategory"/>{showFilterSubcategoryDropdown && uniqueSubcategories.length > 0 && <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"><button type="button" className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 font-medium flex items-center" onClick={() => handleFilterSubcategorySelect('')}><XCircle className="h-4 w-4 mr-2"/>Clear Filter</button>{getFilteredSubcategoriesForFilter().map((sub, i) => <button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center" onClick={() => handleFilterSubcategorySelect(sub)}><Tag className="h-4 w-4 mr-2 text-gray-400"/>{sub}</button>)}</div>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400"/>Date Range</label><select name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="input-field text-sm"><option value="all">All Time</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">Last Month</option><option value="quarter">Last 3 Months</option><option value="year">Last Year</option></select></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t"><div className="text-sm text-gray-600">Showing {filteredExpenses.length} of {expenses.length} expenses</div><div className="flex space-x-2"><button onClick={clearFilters} className="btn-secondary text-sm flex items-center"><Trash2 className="h-4 w-4 mr-2"/>Clear All Filters</button><button onClick={handleShowSummary} className="btn-primary text-sm flex items-center"><BarChart3 className="h-4 w-4 mr-2"/>Quick Summary</button></div></div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center"><PieChart className="h-5 w-5 mr-3 text-gray-500" /> Expenses by Category</h2>{Object.keys(categoryTotals).length > 0 && <div className="text-sm text-gray-500">{Object.keys(categoryTotals).length} categories • ₹{getTotalExpenses().toFixed(2)} total</div>}</div>
        {Object.keys(categoryTotals).length === 0 ? <div className="text-center py-8"><PieChart className="h-12 w-12 mx-auto text-gray-300 mb-2"/><p className="text-gray-500">No categories to display</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(categoryTotals).sort(([,a], [,b]) => b.total - a.total).map(([name, data]) => { const pct = getTotalExpenses() > 0 ? ((data.total / getTotalExpenses()) * 100) : 0; return <div key={name} className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-800 flex items-center"><LayoutGrid className="h-4 w-4 mr-2 text-blue-500"/>{name}</h3><div className="text-right"><div className="text-lg font-bold text-blue-600">₹{data.total.toLocaleString('en-IN')}</div><div className="text-xs text-gray-500">{pct.toFixed(1)}% of total</div></div></div><div className="flex items-center justify-between mb-3 text-sm text-gray-600"><span className="flex items-center"><Hash className="h-3 w-3 mr-1"/>{data.count} {data.count === 1 ? 'expense' : 'expenses'}</span><span className="flex items-center"><Calculator className="h-3 w-3 mr-1"/>Avg: ₹{(data.total / data.count).toFixed(2)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 mb-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div></div>{Object.keys(data.subcategories).length > 0 && <div className="space-y-1"><div className="text-xs text-gray-500 font-medium mb-2 flex items-center"><Tag className="h-3 w-3 mr-1"/>Subcategories:</div>{Object.entries(data.subcategories).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 3).map(([sub, amt]) => <div key={sub} className="flex justify-between text-xs px-2 py-1"><span className="truncate mr-2">{sub}</span><span className="font-medium whitespace-nowrap">₹{(amt as number).toLocaleString('en-IN')}</span></div>)}</div>}</div> })}</div>}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center"><History className="h-5 w-5 mr-3 text-gray-500"/>Expense History ({filteredExpenses.length})</h2></div>
        {filteredExpenses.length === 0 
          ? <div className="text-center py-12">{expenses.length === 0 ? <div><FileText className="h-16 w-16 mx-auto text-gray-300 mb-4"/><p className="text-gray-500 text-lg mb-2">No expenses recorded yet</p><p className="text-gray-400 text-sm">Add your first expense to get started!</p></div> : <div><SearchX className="h-16 w-16 mx-auto text-gray-300 mb-4"/><p className="text-gray-500 text-lg mb-2">No expenses match your filters</p><button onClick={clearFilters} className="btn-primary text-sm flex items-center mx-auto"><Trash2 className="h-4 w-4 mr-2"/>Clear All Filters</button></div>}</div> 
          : <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subcategory</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th><th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th><th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th></tr></thead>
                  {/* 4. Update table to map over paginated data */}
                  <tbody className="divide-y divide-gray-200">{currentExpenses.map((expense) => <tr key={expense._id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-900">{new Date(expense.date).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</td><td className="px-4 py-3 text-sm"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><LayoutGrid className="h-3 w-3 mr-1.5"/>{expense.category}</span></td><td className="px-4 py-3 text-sm">{expense.subcategory ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Tag className="h-3 w-3 mr-1.5"/>{expense.subcategory}</span> : <span className="text-gray-400 text-xs">-</span>}</td><td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{expense.description}</td><td className="px-4 py-3 text-sm">{expense.supplier ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Store className="h-3 w-3 mr-1.5"/>{expense.supplier}</span> : <span className="text-gray-400 text-xs">-</span>}</td><td className="px-4 py-3 text-sm text-right font-bold text-gray-900">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td className="px-4 py-3 text-center"><div className="flex items-center justify-center space-x-2"><button onClick={() => handleEditClick(expense)} className="text-blue-600 hover:text-blue-800" title="Edit Expense"><Pencil className="h-4 w-4"/></button><button onClick={() => setDeleteConfirmId(expense._id)} className="text-red-600 hover:text-red-800" title="Delete Expense"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody>
                </table>
              </div>
              {/* 5. Render the Pagination component */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredExpenses.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
        }
      </div>
    </div>
  );
}