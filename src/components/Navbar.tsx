'use client';

import { useState, useEffect } from 'react';
import { TabType } from '@/types';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

interface IReportLog {
  status: 'Success' | 'Failure';
  sentAt: string;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [lastStatus, setLastStatus] = useState<IReportLog | null>(null);

  useEffect(() => {
    fetch('/api/last-report-status')
      .then(res => res.json())
      .then(data => {
        if (data && data.status) {
          setLastStatus(data);
        }
      })
      .catch(err => console.error("Failed to fetch status", err));
  }, []);

  const navItems: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'expenses', label: 'Expense Management', icon: '💰' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-blue-800">Expense Manager</h1>
          </div>
          
          <div className="text-sm">
            {lastStatus ? (
              <span style={{ color: lastStatus.status === 'Success' ? 'green' : 'red', fontWeight: 'bold' }}>
                Last Report ({new Date(lastStatus.sentAt).toLocaleTimeString()}): {lastStatus.status}
              </span>
            ) : (
              <span className="text-gray-500">Checking report status...</span>
            )}
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
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}