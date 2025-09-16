// src/lib/cronScheduler.ts
import cron from 'node-cron';

let cronJobStarted = false;

export function initializeCronJobs() {
  // Prevent multiple initialization
  if (cronJobStarted) {
    console.log('⚠️ Cron jobs already initialized');
    return;
  }

  // Only run cron jobs in production or when explicitly enable
  const enableCron = process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true';
  
  if (!enableCron) {
    console.log('🔧 Cron jobs disabled for development. Set ENABLE_CRON=true to enable.');
    return;
  }

  try {
    // Schedule daily report at 12:01 AM IST
    cron.schedule('1 0 * * *', async () => { // 12:01 AM IST
      console.log('🕛 Running daily WhatsApp report at:', new Date().toLocaleString('en-IN'));
      
      try {
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? process.env.NEXTJS_URL 
          : 'http://localhost:3000';
            
        const response = await fetch(`${baseUrl}/api/whatsapp/daily-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.CRON_SECRET && {
              'Authorization': `Bearer ${process.env.CRON_SECRET}`
            })
          }
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Daily report sent successfully:', result.data);
        } else {
          console.error('❌ Failed to send daily report:', result.error);
        }
      } catch (error) {
        console.error('❌ Error in cron job:', error);
      }
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    cronJobStarted = true;
    // Update the confirmation message to reflect the new time
    console.log('⏰ Cron jobs initialized successfully! Daily reports scheduled for 12:01 AM IST');
    
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
  }
}

// Manual trigger function for testing
export async function triggerDailyReportManually() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXTJS_URL 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/whatsapp/daily-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Manual report trigger error:', error);
    throw error;
  }
}