'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // <-- 1. IMPORT TOAST
// Import icons for the form
import { 
  GlassWater, PlusCircle, FileText, ScrollText, Pencil, Trash2, 
  Save, X 
} from 'lucide-react';

// --- Type Definitions ---
interface LiquorPurchaseItem {
  id: number;
  shortCode: string;
  category: string;
  product: string;
  subProduct: string;
  caseQty: string;
  bot: string;
  qty: string;
  basic: string;
  sRate: string;
  amount: number;
}
interface InvoiceDetails {
  supplierName: string;
  invoiceNo: string;
  date: string;
  purchaseAccount: string;
  godown: string;
}
interface LiquorPurchaseLog {
  _id: string;
  invoiceNo: string;
  date: string;
  supplierName: string;
  totalAmount: number;
}

export default function LiquorPurchase() {
  const [purchases, setPurchases] = useState<LiquorPurchaseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const initialInvoiceDetails: InvoiceDetails = {
    supplierName: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    purchaseAccount: 'purchase',
    godown: 'SHARU RECREATION CLUB',
  };
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>(initialInvoiceDetails);
  
  const initialItem: LiquorPurchaseItem = {
    id: Date.now(), shortCode: '', category: '', product: '', subProduct: '', 
    caseQty: '', bot: '', qty: '', basic: '', sRate: '', amount: 0
  };
  const [items, setItems] = useState<LiquorPurchaseItem[]>([initialItem]);
  
  const fetchPurchases = async () => {
      try {
          setLoading(true);
          const res = await fetch('/api/liquor-purchases', { cache: 'no-store' });
          if (!res.ok) {
            throw new Error("Failed to fetch data");
          }
          const data = await res.json();
          const formattedData = data.map((p: any) => ({
              _id: p._id,
              invoiceNo: p.invoiceNo,
              date: p.date,
              supplierName: p.supplierName,
              totalAmount: p.items.reduce((sum: number, item: any) => sum + item.amount, 0),
          }));
          setPurchases(formattedData);
      } catch (error) {
          console.error("Failed to fetch purchases:", error);
          toast.error("Could not fetch purchase history.");
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // --- 2. THIS IS THE CORRECTED handleSave FUNCTION ---
  const handleSave = async () => {
    if (!invoiceDetails.supplierName || !invoiceDetails.invoiceNo) {
        toast.error("Supplier Name and Invoice No. are required.");
        return;
    }

    const savingPromise = fetch('/api/liquor-purchases', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceDetails, items }),
    });

    toast.promise(
      savingPromise,
      {
        loading: 'Saving purchase...',
        success: (res) => {
          if (!res.ok) {
            throw new Error('Failed to save! Please check server logs.');
          }
          fetchPurchases();
          setShowForm(false);
          setInvoiceDetails(initialInvoiceDetails);
          setItems([initialItem]);
          return 'Purchase saved successfully!';
        },
        error: (err) => `Could not save: ${err.toString()}`,
      }
    );
  };
  // --- END OF CORRECTION ---

  const handleInvoiceDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newItems = [...items];
    const currentItem = { ...newItems[index], [name]: value };
    const qty = parseFloat(currentItem.qty) || 0;
    const sRate = parseFloat(currentItem.sRate) || 0;
    currentItem.amount = qty * sRate;
    newItems[index] = currentItem;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { ...initialItem, id: Date.now() }]);
  };
  
  const removeItemRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  if (showForm) {
      return (
          <div className="fixed inset-0 bg-gray-100 z-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
             <div className="bg-white rounded-xl shadow-lg p-0 overflow-hidden w-full h-full flex flex-col">
              <div className="flex items-center border-b p-4 shrink-0">
                <div className="flex items-center space-x-4">
                    <button onClick={handleSave} className="p-2 rounded-md hover:bg-blue-100" title="Save">
                      <Save className="h-6 w-6 text-blue-600" />
                    </button>
                    <button onClick={() => setShowForm(false)} className="p-2 rounded-md hover:bg-red-100" title="Cancel">
                      <X className="h-6 w-6 text-red-600" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mx-auto">Invoice Details</h2>
              </div>
              <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4">
                  <div className="md:col-span-4"><label className="block text-sm font-medium text-gray-700">Supplier Name</label><input type="text" name="supplierName" value={invoiceDetails.supplierName} onChange={handleInvoiceDetailsChange} className="input-field mt-1" /></div>
                  <div className="md:col-span-1"><label className="block text-sm font-medium text-gray-700">Invoice No.</label><input type="text" name="invoiceNo" value={invoiceDetails.invoiceNo} onChange={handleInvoiceDetailsChange} className="input-field mt-1" /></div>
                  <div className="md:col-span-1"><label className="block text-sm font-medium text-gray-700">Date</label><input type="date" name="date" value={invoiceDetails.date} onChange={handleInvoiceDetailsChange} className="input-field mt-1" /></div>
                  <div className="md:col-span-4"><label className="block text-sm font-medium text-gray-700">Purchase Account</label><input type="text" name="purchaseAccount" value={invoiceDetails.purchaseAccount} onChange={handleInvoiceDetailsChange} className="input-field mt-1" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Godown</label><input type="text" name="godown" value={invoiceDetails.godown} onChange={handleInvoiceDetailsChange} className="input-field mt-1" /></div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 border-t pt-6">Item Details</h2>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-[1200px] w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="th-cell w-12">SNo</th><th className="th-cell">ShortCode</th><th className="th-cell">Category</th><th className="th-cell">Product</th><th className="th-cell">SubProduct</th><th className="th-cell">Case</th><th className="th-cell">Bot</th><th className="th-cell">Qty</th><th className="th-cell">Basic</th><th className="th-cell">SRate</th><th className="th-cell">Amount</th><th className="th-cell w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {items.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="td-cell text-center font-medium text-gray-600">{index + 1}</td>
                          <td className="td-cell p-1"><input type="text" name="shortCode" value={item.shortCode} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="category" value={item.category} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="product" value={item.product} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="subProduct" value={item.subProduct} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="caseQty" value={item.caseQty} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="bot" value={item.bot} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="number" name="qty" value={item.qty} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="basic" value={item.basic} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="number" name="sRate" value={item.sRate} onChange={(e) => handleItemChange(index, e)} className="input-table"/></td>
                          <td className="td-cell p-1"><input type="text" name="amount" value={item.amount.toFixed(2)} readOnly className="input-table bg-gray-100 text-right font-semibold"/></td>
                          <td className="td-cell text-center"><button onClick={() => removeItemRow(item.id)} className="text-red-500 hover:text-red-700" disabled={items.length <= 1}><Trash2 className="h-4 w-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={addItemRow} className="btn-secondary text-sm flex items-center"><PlusCircle className="h-4 w-4 mr-2"/> Add Row</button>
              </div>
            </div>
          </div>
      );
  }

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalInvoices = purchases.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Liquor Purchase Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Liquor Purchase
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-red-500 text-white"><div className="text-center"><p className="text-red-100">Total Spent on Liquor</p><p className="text-3xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p></div></div>
        <div className="card bg-gray-700 text-white"><div className="text-center"><p className="text-gray-100">Total Invoices</p><p className="text-3xl font-bold">{totalInvoices}</p></div></div>
        <div className="card bg-orange-500 text-white"><div className="text-center"><p className="text-orange-100">Unique Suppliers</p><p className="text-3xl font-bold">{new Set(purchases.map(p => p.supplierName)).size}</p></div></div>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold flex items-center mb-4"><ScrollText className="h-5 w-5 mr-3 text-gray-500"/>Liquor Inventory Log</h2>
        {loading ? ( <div className="text-center py-10">Loading...</div> ) : purchases.length === 0 ? (
          <div className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-gray-300 mb-4"/><p className="text-gray-500 text-lg">No liquor purchases recorded yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice No</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th><th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Amount</th><th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {purchases.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.invoiceNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{p.supplierName}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">₹{p.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit"><Pencil className="h-4 w-4"/></button>
                        <button className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="h-4 w-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}