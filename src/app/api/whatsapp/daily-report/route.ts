// src/app/api/whatsapp/daily-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Transaction from '@/models/Transaction';

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get yesterday's date range (since we run at midnight)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
    
    // Fetch yesterday's data
    const yesterdayExpenses = await Expense.find({
      date: { $gte: startOfYesterday, $lt: endOfYesterday }
    });
    
    const yesterdayTransactions = await Transaction.find({
      date: { $gte: startOfYesterday, $lt: endOfYesterday }
    });
    
    // Calculate totals
    const totalExpenses = yesterdayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const salesTransactions = yesterdayTransactions.filter(t => t.type === 'sale');
    const purchaseTransactions = yesterdayTransactions.filter(t => t.type === 'purchase');
    
    const totalSales = salesTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalPurchases = purchaseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const netProfit = totalSales - totalExpenses - totalPurchases;

    // Send WhatsApp message using template
    const phoneNumber = '6381541229';
    const whatsappResponse = await sendWhatsAppTemplate(phoneNumber, {
      date: yesterday.toDateString(),
      sales: totalSales.toFixed(2),
      expenses: totalExpenses.toFixed(2),
      netProfit: netProfit.toFixed(2),
      transactionCount: salesTransactions.length.toString() // This was missing!
    });
    
    if (whatsappResponse.success) {
      console.log('✅ Daily report sent successfully via template');
      return NextResponse.json({ 
        success: true, 
        message: 'Daily report sent successfully via template',
        data: {
          reportDate: yesterday.toDateString(),
          totalSales,
          totalExpenses,
          totalPurchases,
          netProfit,
          messageId: whatsappResponse.data?.messages?.[0]?.id
        }
      });
    } else {
      throw new Error(`WhatsApp template sending failed: ${whatsappResponse.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error sending daily report:', error);
    return NextResponse.json({ 
      error: 'Failed to send daily report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function sendWhatsAppTemplate(phoneNumber: string, templateData: {
  date: string;
  sales: string;
  expenses: string;
  netProfit: string;
  transactionCount: string;
}) {
  try {
    console.log('📱 Sending WhatsApp template to:', phoneNumber);
    
    const wabaUrl = `https://graph.facebook.com/v22.0/${process.env.WABA_PHONE_NUMBER_ID}/messages`;
    const accessToken = process.env.WABA_ACCESS_TOKEN;
    
    if (!accessToken || !process.env.WABA_PHONE_NUMBER_ID) {
      throw new Error('Missing WABA credentials in environment variables');
    }

    const body = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: 'expense_report',
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: templateData.date },            // {{1}} - Date
            { type: 'text', text: templateData.sales },           // {{2}} - Sales amount
            { type: 'text', text: templateData.expenses },        // {{3}} - Expenses amount
            { type: 'text', text: templateData.netProfit },       // {{4}} - Net profit
            { type: 'text', text: templateData.transactionCount } // {{5}} - Transaction count
          ]
        }]
      }
    };
    
    console.log('📤 Template request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(wabaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    console.log('📥 WhatsApp Template Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ WhatsApp template sent successfully');
      return { success: true, data: result };
    } else {
      console.error('❌ WhatsApp Template API error:', result);
      throw new Error(`WhatsApp Template API error: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp template:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}