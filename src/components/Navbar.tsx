'use client';

import { TabType } from '@/types';
import { ReactNode, useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  WalletCards,
  Wallet,
  ArrowRightLeft,
  ShoppingCart,
  Tags,
  GlassWater,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

// Type definitions remain the same
type SubMenuLink = { id: TabType; label: string; icon: ReactNode; type: 'sublink'; };
type SubMenuDropdown = { id: string; label: string; icon: ReactNode; type: 'subdropdown'; subItems: SubMenuLink[]; };
type NavItem = { id: TabType; label: string; icon: ReactNode; type: 'link' };
type NavDropdown = { id: string; label: string; icon: ReactNode; type: 'dropdown'; subItems: Array<SubMenuLink | SubMenuDropdown>; };

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [openMainMenu, setOpenMainMenu] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMainMenu(null);
        setOpenSubMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navRef]);

  const navItems: Array<NavItem | NavDropdown> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, type: 'link' },
    { id: 'expenses', label: 'Expense Management', icon: <WalletCards className="h-5 w-5" />, type: 'link' },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ArrowRightLeft className="h-5 w-5" />,
      type: 'dropdown',
      subItems: [
        {
          id: 'purchase-menu',
          label: 'Purchase',
          icon: <ShoppingCart className="h-5 w-5" />,
          type: 'subdropdown',
          subItems: [
            { id: 'liquor-purchase', label: 'Liquor Purchase', icon: <GlassWater className="h-5 w-5" />, type: 'sublink' },
          ],
        },
        { id: 'sales', label: 'Sales', icon: <Tags className="h-5 w-5" />, type: 'sublink' },
      ],
    },
  ];

  const handleLinkClick = (tabId: TabType) => {
    setActiveTab(tabId);
    setOpenMainMenu(null);
    setOpenSubMenu(null);
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-200" ref={navRef}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-blue-800">Sky Bar</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => {
              if (item.type === 'dropdown') {
                const isTransactionActive = item.subItems.some(
                  (sub) => ('subItems' in sub ? sub.subItems.some(ss => ss.id === activeTab) : sub.id === activeTab)
                );
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => {
                        setOpenMainMenu(prev => (prev === item.id ? null : item.id));
                        setOpenSubMenu(null);
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${ isTransactionActive ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'text-gray-600 hover:bg-gray-100' }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>

                    {openMainMenu === item.id && (
                      <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border z-20">
                        <ul className="py-1">
                          {item.subItems.map((subItem) => {
                            if (subItem.type === 'subdropdown') {
                              return (
                                // --- THIS IS THE KEY CHANGE: FROM FLY-OUT TO COLLAPSIBLE ---
                                <li key={subItem.id}>
                                  <button
                                    onClick={() => setOpenSubMenu(prev => (prev === subItem.id ? null : subItem.id))}
                                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                  >
                                    <div className="flex items-center space-x-3">
                                      {subItem.icon}
                                      <span>{subItem.label}</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${openSubMenu === subItem.id ? 'rotate-90' : ''}`} />
                                  </button>
                                  {/* Conditionally render the sub-menu *below* the button */}
                                  {openSubMenu === subItem.id && (
                                    <ul className="pl-5 bg-gray-50">
                                      {subItem.subItems.map((nestedItem) => (
                                        <li key={nestedItem.id}>
                                          <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(nestedItem.id); }} className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${ activeTab === nestedItem.id ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-gray-700 hover:bg-gray-100' }`}>
                                            {nestedItem.icon}
                                            <span>{nestedItem.label}</span>
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            }
                            // Direct link like "Sales"
                            return (
                              <li key={subItem.id}>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(subItem.id); }} className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${ activeTab === subItem.id ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-gray-700 hover:bg-gray-100' }`}>
                                  {subItem.icon}
                                  <span>{subItem.label}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              // Regular top-level button
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${ activeTab === item.id ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}