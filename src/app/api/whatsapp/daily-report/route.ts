import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Transaction from '@/models/Transaction';

// Helper function to format the date into Tamil
function getTamilFormattedDate(date: Date): string {
  const days = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  const months = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${dayName}, ${monthName} ${day}, ${year}`;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
    
    const yesterdayExpenses = await Expense.find({ date: { $gte: startOfYesterday, $lt: endOfYesterday } });
    const yesterdayTransactions = await Transaction.find({ date: { $gte: startOfYesterday, $lt: endOfYesterday } });
    
    const totalExpenses = yesterdayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const salesTransactions = yesterdayTransactions.filter(t => t.type === 'sale');
    const purchaseTransactions = yesterdayTransactions.filter(t => t.type === 'purchase');
    
    const totalSales = salesTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalPurchases = purchaseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const netProfit = totalSales - totalExpenses - totalPurchases;

    const tamilDate = getTamilFormattedDate(yesterday);

    const phoneNumber = '6381541229';
    const whatsappResponse = await sendWhatsAppTemplate(phoneNumber, {
      date: tamilDate,
      // Add the ₹ symbol here in the code
      sales: `₹${totalSales.toFixed(2)}`,
      expenses: `₹${totalExpenses.toFixed(2)}`,
      netProfit: `₹${netProfit.toFixed(2)}`,
    });
    
    if (whatsappResponse.success) {
      return NextResponse.json({ success: true, message: 'Daily report sent successfully' });
    } else {
      throw new Error(`WhatsApp template sending failed: ${whatsappResponse.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error sending daily report:', error);
    return NextResponse.json({ error: 'Failed to send daily report' }, { status: 500 });
  }
}

async function sendWhatsAppTemplate(phoneNumber: string, templateData: {
  date: string;
  sales: string;
  expenses: string;
  netProfit: string;
}) {
  try {
    const wabaUrl = `https://graph.facebook.com/v22.0/${process.env.WABA_PHONE_NUMBER_ID}/messages`;
    const accessToken = process.env.WABA_ACCESS_TOKEN;
    
    if (!accessToken || !process.env.WABA_PHONE_NUMBER_ID) {
      throw new Error('Missing WABA credentials');
    }

    const body = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        // Use the new, longer template name that will be approved
        name: 'daily_tamil_summary',
        language: { code: 'ta' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: templateData.date },
            { type: 'text', text: templateData.sales },
            { type: 'text', text: templateData.expenses },
            { type: 'text', text: templateData.netProfit }
          ]
        }]
      }
    };
    
    const response = await fetch(wabaUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { success: true, data: result };
    } else {
      throw new Error(`WhatsApp API error: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}