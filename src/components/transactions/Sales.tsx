'use client';

import { useState, useEffect } from 'react';
import { Sale as SaleType } from '@/types';
import { Tags, PlusCircle, FileText, IndianRupee, Hash, Pencil, Trash2 } from 'lucide-react';

// Mock data to display in the table. Replace this with an API call.
const mockSales: SaleType[] = [
  {
    _id: 's1',
    orderNumber: 'ORD-2025-001',
    date: '2025-09-22',
    customerName: 'Anjali Sharma',
    items: [
      { name: 'Espresso', quantity: 2, price: 150 },
      { name: 'Croissant', quantity: 1, price: 120 },
    ],
    totalAmount: 420.00,
    paymentMethod: 'Card',
  },
  {
    _id: 's2',
    orderNumber: 'ORD-2025-002',
    date: '2025-09-21',
    customerName: 'Walk-in Customer',
    items: [{ name: 'Iced Latte', quantity: 1, price: 220 }],
    totalAmount: 220.00,
    paymentMethod: 'Cash',
  },
  {
    _id: 's3',
    orderNumber: 'ORD-2025-003',
    date: '2025-09-20',
    customerName: 'Rohan Verma',
    items: [{ name: 'Pizza Slice', quantity: 2, price: 180 }],
    totalAmount: 360.00,
    paymentMethod: 'Online',
  },
];


export default function Sales() {
  const [sales, setSales] = useState<SaleType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    setLoading(true);
    setTimeout(() => {
      setSales(mockSales);
      setLoading(false);
    }, 500);
  }, []);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const averageOrderValue = sales.length > 0 ? totalSalesRevenue / sales.length : 0;

  const getPaymentBadge = (method: 'Cash' | 'Card' | 'Online') => {
    switch (method) {
      case 'Card':
        return 'bg-purple-100 text-purple-800';
      case 'Online':
        return 'bg-sky-100 text-sky-800';
      case 'Cash':
        return 'bg-lime-100 text-lime-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading Sales Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
        <button className="btn-primary flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Sale
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-500 text-white"><div className="text-center"><p className="text-green-100">Total Sales Revenue</p><p className="text-3xl font-bold">₹{totalSalesRevenue.toLocaleString('en-IN')}</p></div></div>
        <div className="card bg-purple-500 text-white"><div className="text-center"><p className="text-purple-100">Total Orders</p><p className="text-3xl font-bold">{sales.length}</p></div></div>
        <div className="card bg-red-500 text-white"><div className="text-center"><p className="text-red-100">Avg. Order Value</p><p className="text-3xl font-bold">₹{averageOrderValue.toFixed(2)}</p></div></div>
      </div>
      
      {/* Sales History Table */}
      <div className="card">
        <h2 className="text-xl font-semibold flex items-center mb-4"><Tags className="h-5 w-5 mr-3 text-gray-500"/>Sales History</h2>
        {sales.length === 0 ? (
          <div className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-gray-300 mb-4"/><p className="text-gray-500 text-lg">No sales recorded yet.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead><tr className="bg-gray-50"><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order #</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th><th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th><th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Payment</th><th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sale.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(sale.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{sale.customerName}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">₹{sale.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(sale.paymentMethod)}`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-800" title="Edit Sale"><Pencil className="h-4 w-4"/></button>
                        <button className="text-red-600 hover:text-red-800" title="Delete Sale"><Trash2 className="h-4 w-4"/></button>
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
