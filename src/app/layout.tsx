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
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
      </body>
    </html>
  )
}