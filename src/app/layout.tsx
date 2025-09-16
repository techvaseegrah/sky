// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Expense Manager',
  description: 'A comprehensive business expense management system with advanced categorization and analytics',
}

// Initialize cron jobs on server startup
if (typeof window === 'undefined') {
  // Dynamic import to avoid issues with client-side rendering
  import('@/lib/cronScheduler').then(({ initializeCronJobs }) => {
    initializeCronJobs();
  }).catch(error => {
    console.error('Failed to initialize cron jobs:', error);
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-bold text-gray-900">🍷 Wine Shop Manager</h1>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    📊 Daily Reports: 12:00 AM
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      DEV MODE
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}