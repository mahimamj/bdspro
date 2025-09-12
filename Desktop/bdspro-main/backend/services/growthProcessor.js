const { getDepositsForGrowth, processGrowth, executeQuery } = require('../helpers/databaseHelpers');

// Process 6% monthly growth for all eligible deposits
const processMonthlyGrowth = async () => {
  try {
    console.log('Starting monthly growth processing...');
    
    // Get all deposits that are 30+ days old and haven't received growth yet
    const eligibleDeposits = await getDepositsForGrowth();
    
    console.log(`Found ${eligibleDeposits.length} deposits eligible for growth`);
    
    const results = [];
    
    for (const deposit of eligibleDeposits) {
      try {
        const result = await processGrowth(deposit.user_id, deposit.id, deposit.amount);
        results.push({
          userId: deposit.user_id,
          depositId: deposit.id,
          depositAmount: deposit.amount,
          growthAmount: result.growthAmount,
          newBalance: result.newBalance,
          trackingId: result.trackingId,
          growthTransactionId: result.growthTransactionId,
          success: true
        });
        
        console.log(`Processed growth for user ${deposit.user_id}: +$${result.growthAmount} (Tracking ID: ${result.trackingId})`);
        
      } catch (error) {
        console.error(`Error processing growth for user ${deposit.user_id}:`, error.message);
        results.push({
          userId: deposit.user_id,
          depositId: deposit.id,
          depositAmount: deposit.amount,
          error: error.message,
          success: false
        });
      }
    }
    
    console.log(`Growth processing completed. Processed: ${results.filter(r => r.success).length}/${results.length}`);
    return results;
    
  } catch (error) {
    console.error('Monthly growth processing error:', error);
    throw error;
  }
};

// Manual growth processing endpoint (for testing)
const processGrowthManually = async (req, res) => {
  try {
    const results = await processMonthlyGrowth();
    
    res.json({
      success: true,
      message: 'Growth processing completed',
      data: {
        totalProcessed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
    
  } catch (error) {
    console.error('Manual growth processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Growth processing failed',
      error: error.message
    });
  }
};

// Schedule growth processing (run this as a cron job)
const scheduleGrowthProcessing = () => {
  // Run every day at 2 AM
  const cron = require('node-cron');
  
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled growth processing...');
    try {
      await processMonthlyGrowth();
    } catch (error) {
      console.error('Scheduled growth processing failed:', error);
    }
  });
  
  console.log('Growth processing scheduled to run daily at 2 AM');
};

module.exports = {
  processMonthlyGrowth,
  processGrowthManually,
  scheduleGrowthProcessing
};
