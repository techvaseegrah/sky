# Business Expense Management System (India)

A comprehensive business expense management system built with Next.js, TypeScript, MongoDB, and Tailwind CSS. This application focuses on advanced expense tracking and financial analytics with detailed categorization features, designed specifically for Indian businesses with Rupee (₹) currency support.

## Features

### 💰 Advanced Expense Management
- Track expenses with 7 main categories and 40+ subcategories
- Advanced filtering and search capabilities  
- Tag-based organization system
- Supplier tracking and receipt management
- Date-based expense filtering with multiple time ranges
- Real-time expense analytics and insights

### 📊 Analytics & Dashboard
- Real-time expense tracking and trends
- Category and subcategory breakdowns with visual indicators
- Monthly, weekly, and daily expense summaries
- Average expense calculations and KPIs
- Recent expense activity tracking
- Performance metrics dashboard

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom business-themed colors
- **Database**: MongoDB with Mongoose ODM
- **API**: Next.js API Routes
- **Development**: ESLint, PostCSS, Autoprefixer

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd business-expense-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/expenses
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

Built with ❤️ for business owners and financial managers.