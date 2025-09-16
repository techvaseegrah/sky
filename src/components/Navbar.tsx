'use client';

import { TabType } from '@/types';
import { ReactNode } from 'react';
// 1. Import the desired icons from lucide-react
import { LayoutDashboard, WalletCards, Wallet } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  // 2. Update the navItems array to use JSX elements for icons
  const navItems: Array<{ id: TabType; label: string; icon: ReactNode }> = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      id: 'expenses', 
      label: 'Expense Management', 
      icon: <WalletCards className="h-5 w-5" /> 
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* 3. Replace the logo emoji with a Lucide icon */}
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-blue-800">Sky Bar</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {/* 4. Render the icon component directly */}
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}