'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { TabType } from '@/types';
import Dashboard from '@/components/Dashboard';
import ExpenseManager from '@/components/ExpenseManager';
import Sales from '@/components/transactions/Sales';

// Import the new nested component
import LiquorPurchase from '@/components/transactions/purchase/LiquorPurchase';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseManager />;
      case 'liquor-purchase': // Add the new case
        return <LiquorPurchase />;
      case 'sales':
        return <Sales />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}