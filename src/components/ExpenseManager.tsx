'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
// Import the necessary icons from lucide-react
import { 
  PlusCircle, X, SlidersHorizontal, LayoutGrid, Tag, Calendar, Store, 
  XCircle, Trash2, BarChart3, PieChart, Hash, Sparkles, Save, 
  History, FileText, SearchX, Calculator 
} from 'lucide-react';

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
  
  // State updated: supplier removed
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    dateRange: 'all',
  });

  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
  });

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
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        console.warn("API did not return an array for expenses. Defaulting to empty array.", data);
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
        let errorMessage = `Failed to create expense. Status: ${response.status}`;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || JSON.stringify(errorData);
            console.error('Failed to create expense. Server sent JSON error:', errorData);
          } catch (jsonError) {
            console.error('Failed to parse JSON error response:', jsonError);
            errorMessage = 'Server returned an invalid JSON error format.';
          }
        } else {
          try {
            const errorText = await response.text();
            errorMessage = errorText;
            console.error('Failed to create expense. Server sent non-JSON response:', errorText);
          } catch (textError) {
            console.error('Failed to read text from error response:', textError);
          }
        }
        
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('A network or parsing error occurred:', error);
      alert('A network error occurred. Please check your connection and try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setShowCategoryDropdown(false);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setFormData({ ...formData, subcategory });
    setShowSubcategoryDropdown(false);
  };

  const getFilteredCategories = () => {
    if (!formData.category) return uniqueCategories;
    return uniqueCategories.filter(cat => cat.toLowerCase().includes(formData.category.toLowerCase()));
  };

  const getFilteredSubcategories = () => {
    if (!formData.subcategory) return uniqueSubcategories;
    return uniqueSubcategories.filter(sub => sub.toLowerCase().includes(formData.subcategory.toLowerCase()));
  };

  const getFilteredCategoriesForFilter = () => {
    if (!filters.category) return uniqueCategories;
    return uniqueCategories.filter(cat => cat.toLowerCase().includes(filters.category.toLowerCase()));
  };

  const getFilteredSubcategoriesForFilter = () => {
    if (!filters.subcategory) return uniqueSubcategories;
    return uniqueSubcategories.filter(sub => sub.toLowerCase().includes(filters.subcategory.toLowerCase()));
  };
  
  const handleFilterCategorySelect = (category: string) => {
    setFilters({ ...filters, category });
    setShowFilterCategoryDropdown(false);
  };

  const handleFilterSubcategorySelect = (subcategory: string) => {
    setFilters({ ...filters, subcategory });
    setShowFilterSubcategoryDropdown(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Logic updated: supplier filter removed
  const applyEnhancedFilters = () => {
    let filtered = [...(expenses || [])];
    if (filters.category) {
      filtered = filtered.filter(e => e.category.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.subcategory) {
      filtered = filtered.filter(e => e.subcategory?.toLowerCase().includes(filters.subcategory.toLowerCase()));
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      switch (filters.dateRange) {
        case 'today': startDate.setHours(0, 0, 0, 0); break;
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
        case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      }
      filtered = filtered.filter(e => new Date(e.date) >= startDate);
    }
    return filtered;
  };

  // Function updated: supplier removed
  const clearFilters = () => {
    setFilters({ category: '', subcategory: '', dateRange: 'all' });
    setShowFilterCategoryDropdown(false);
    setShowFilterSubcategoryDropdown(false);
  };

  const getTotalExpenses = () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, { total: number; count: number; subcategories: Record<string, number> }> = {};
    filteredExpenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { total: 0, count: 0, subcategories: {} };
      }
      categoryTotals[expense.category].total += expense.amount;
      categoryTotals[expense.category].count += 1;
      if (expense.subcategory) {
        categoryTotals[expense.category].subcategories[expense.subcategory] = (categoryTotals[expense.category].subcategories[expense.subcategory] || 0) + expense.amount;
      }
    });
    return categoryTotals;
  };

  const handleShowSummary = () => {
    const total = getTotalExpenses();
    const count = filteredExpenses.length;
    const avg = count > 0 ? (total / count).toFixed(2) : '0.00';
    const numCategories = Object.keys(getExpensesByCategory()).length;

    setSummaryData({ total, count, avg, numCategories });
    setShowSummaryCard(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-xl text-gray-600">Loading expenses...</div></div>;
  }

  const categoryTotals = getExpensesByCategory();

  return (
    <div className="space-y-6">
      {showSummaryCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center"><BarChart3 className="h-5 w-5 mr-3 text-gray-500" />Filtered Results Summary</h2>
              <button onClick={() => setShowSummaryCard(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Total Expenses</span><span className="font-bold text-lg text-blue-600">₹{summaryData.total.toFixed(2)}</span></div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Number of Expenses</span><span className="font-bold text-lg">{summaryData.count}</span></div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Average Expense</span><span className="font-bold text-lg">₹{summaryData.avg}</span></div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="font-medium text-gray-600">Number of Categories</span><span className="font-bold text-lg">{summaryData.numCategories}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Business Expense Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center">
          {showForm ? <><X className="h-4 w-4 mr-2" /> Cancel</> : <><PlusCircle className="h-4 w-4 mr-2" /> Add Expense</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="text-center"><p className="text-blue-100">Total Expenses</p><p className="text-3xl font-bold">₹{getTotalExpenses().toFixed(2)}</p></div></div>
        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white"><div className="text-center"><p className="text-purple-100">Number of Expenses</p><p className="text-3xl font-bold">{filteredExpenses.length}</p></div></div>
        <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"><div className="text-center"><p className="text-indigo-100">Average Expense</p><p className="text-3xl font-bold">₹{filteredExpenses.length > 0 ? (getTotalExpenses() / filteredExpenses.length).toFixed(2) : '0.00'}</p></div></div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="text-center"><p className="text-green-100">Categories</p><p className="text-3xl font-bold">{Object.keys(categoryTotals).length}</p></div></div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold flex items-center mb-4"><SlidersHorizontal className="h-5 w-5 mr-3 text-gray-500" /> Advanced Filters & Search</h2>
        
        {/* UI Updated: Grid is now 3 columns, Supplier Filter is removed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>Category Filter</label><input type="text" name="category" value={filters.category} onChange={handleFilterChange} onFocus={() => setShowFilterCategoryDropdown(true)} onBlur={() => setTimeout(() => setShowFilterCategoryDropdown(false), 200)} className="input-field text-sm" placeholder="Filter by category"/>{showFilterCategoryDropdown && uniqueCategories.length > 0 && <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"><button type="button" className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 font-medium flex items-center" onClick={() => handleFilterCategorySelect('')}><XCircle className="h-4 w-4 mr-2"/>Clear Filter</button>{getFilteredCategoriesForFilter().map((cat, i) => <button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center" onClick={() => handleFilterCategorySelect(cat)}><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>{cat}</button>)}</div>}</div>
            <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-400"/>Subcategory Filter</label><input type="text" name="subcategory" value={filters.subcategory} onChange={handleFilterChange} onFocus={() => setShowFilterSubcategoryDropdown(true)} onBlur={() => setTimeout(() => setShowFilterSubcategoryDropdown(false), 200)} className="input-field text-sm" placeholder="Filter by subcategory"/>{showFilterSubcategoryDropdown && uniqueSubcategories.length > 0 && <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"><button type="button" className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 font-medium flex items-center" onClick={() => handleFilterSubcategorySelect('')}><XCircle className="h-4 w-4 mr-2"/>Clear Filter</button>{getFilteredSubcategoriesForFilter().map((sub, i) => <button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center" onClick={() => handleFilterSubcategorySelect(sub)}><Tag className="h-4 w-4 mr-2 text-gray-400"/>{sub}</button>)}</div>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400"/>Date Range</label><select name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="input-field text-sm"><option value="all">All Time</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">Last Month</option><option value="quarter">Last 3 Months</option><option value="year">Last Year</option></select></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">Showing {filteredExpenses.length} of {expenses.length} expenses</div>
          <div className="flex space-x-2">
            <button onClick={clearFilters} className="btn-secondary text-sm flex items-center"><Trash2 className="h-4 w-4 mr-2"/>Clear All Filters</button>
            <button onClick={handleShowSummary} className="btn-primary text-sm flex items-center"><BarChart3 className="h-4 w-4 mr-2"/>Quick Summary</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center"><PieChart className="h-5 w-5 mr-3 text-gray-500" /> Expenses by Category</h2>{Object.keys(categoryTotals).length > 0 && <div className="text-sm text-gray-500">{Object.keys(categoryTotals).length} categories • ₹{getTotalExpenses().toFixed(2)} total</div>}</div>
        {Object.keys(categoryTotals).length === 0 ? <div className="text-center py-8"><PieChart className="h-12 w-12 mx-auto text-gray-300 mb-2"/><p className="text-gray-500">No categories to display</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(categoryTotals).sort(([,a], [,b]) => b.total - a.total).map(([name, data]) => { const pct = getTotalExpenses() > 0 ? ((data.total / getTotalExpenses()) * 100) : 0; return <div key={name} className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-800 flex items-center"><LayoutGrid className="h-4 w-4 mr-2 text-blue-500"/>{name}</h3><div className="text-right"><div className="text-lg font-bold text-blue-600">₹{data.total.toLocaleString('en-IN')}</div><div className="text-xs text-gray-500">{pct.toFixed(1)}% of total</div></div></div><div className="flex items-center justify-between mb-3 text-sm text-gray-600"><span className="flex items-center"><Hash className="h-3 w-3 mr-1"/>{data.count} {data.count === 1 ? 'expense' : 'expenses'}</span><span className="flex items-center"><Calculator className="h-3 w-3 mr-1"/>Avg: ₹{(data.total / data.count).toFixed(2)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 mb-3"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div></div>{Object.keys(data.subcategories).length > 0 && <div className="space-y-1"><div className="text-xs text-gray-500 font-medium mb-2 flex items-center"><Tag className="h-3 w-3 mr-1"/>Subcategories:</div>{Object.entries(data.subcategories).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 3).map(([sub, amt]) => <div key={sub} className="flex justify-between text-xs px-2 py-1"><span className="truncate mr-2">{sub}</span><span className="font-medium whitespace-nowrap">₹{(amt as number).toLocaleString('en-IN')}</span></div>)}</div>}</div> })}</div>}
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>Category</label><input type="text" name="category" value={formData.category} onChange={handleInputChange} onFocus={() => setShowCategoryDropdown(true)} onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)} className="input-field" placeholder="e.g. Food Purchase" required />{showCategoryDropdown && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">{formData.category && !uniqueCategories.some(c=>c.toLowerCase()===formData.category.toLowerCase()) && <div className="px-3 py-2 bg-green-50 text-sm text-green-700 font-medium flex items-center"><Sparkles className="h-4 w-4 mr-2"/>Create New: "{formData.category}"</div>}{getFilteredCategories().length>0&&getFilteredCategories().map((cat,i)=><button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center" onClick={()=>handleCategorySelect(cat)}><LayoutGrid className="h-4 w-4 mr-2 text-gray-400"/>{cat}</button>)}</div>}</div>
              <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Tag className="h-4 w-4 mr-2 text-gray-400"/>Subcategory</label><input type="text" name="subcategory" value={formData.subcategory} onChange={handleInputChange} onFocus={() => setShowSubcategoryDropdown(true)} onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)} className="input-field" placeholder="e.g. Raw Materials" />{showSubcategoryDropdown && <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">{formData.subcategory && !uniqueSubcategories.some(s=>s.toLowerCase()===formData.subcategory.toLowerCase()) && <div className="px-3 py-2 bg-green-50 text-sm text-green-700 font-medium flex items-center"><Sparkles className="h-4 w-4 mr-2"/>Create New: "{formData.subcategory}"</div>}{getFilteredSubcategories().length>0&&getFilteredSubcategories().map((sub,i)=><button key={i} type="button" className="w-full px-3 py-2 text-left hover:bg-purple-50 flex items-center" onClick={()=>handleSubcategorySelect(sub)}><Tag className="h-4 w-4 mr-2 text-gray-400"/>{sub}</button>)}</div>}</div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label><input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field" step="0.01" min="0" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier (Optional)</label><input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} className="input-field" placeholder="Enter supplier name" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field" rows={3} placeholder="Describe the expense..." required /></div>
            <div className="flex space-x-4"><button type="submit" className="btn-primary flex items-center"><Save className="h-4 w-4 mr-2"/>Save Expense</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold flex items-center"><History className="h-5 w-5 mr-3 text-gray-500"/>Expense History ({filteredExpenses.length})</h2></div>
        {filteredExpenses.length === 0 ? <div className="text-center py-12">{expenses.length === 0 ? <div><FileText className="h-16 w-16 mx-auto text-gray-300 mb-4"/><p className="text-gray-500 text-lg mb-2">No expenses recorded yet</p><p className="text-gray-400 text-sm">Add your first expense to get started!</p></div> : <div><SearchX className="h-16 w-16 mx-auto text-gray-300 mb-4"/><p className="text-gray-500 text-lg mb-2">No expenses match your filters</p><button onClick={clearFilters} className="btn-primary text-sm flex items-center mx-auto"><Trash2 className="h-4 w-4 mr-2"/>Clear All Filters</button></div>}</div> : <div className="overflow-x-auto"><table className="min-w-full table-auto"><thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subcategory</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th><th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredExpenses.map((expense) => <tr key={expense._id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-900">{new Date(expense.date).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</td><td className="px-4 py-3 text-sm"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><LayoutGrid className="h-3 w-3 mr-1.5"/>{expense.category}</span></td><td className="px-4 py-3 text-sm">{expense.subcategory ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Tag className="h-3 w-3 mr-1.5"/>{expense.subcategory}</span> : <span className="text-gray-400 text-xs">-</span>}</td><td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{expense.description}</td><td className="px-4 py-3 text-sm">{expense.supplier ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Store className="h-3 w-3 mr-1.5"/>{expense.supplier}</span> : <span className="text-gray-400 text-xs">-</span>}</td><td className="px-4 py-3 text-sm text-right font-bold text-gray-900">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}