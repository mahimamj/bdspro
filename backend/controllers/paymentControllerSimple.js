const { v4: uuidv4 } = require('uuid');

// Wallet addresses for different currencies
const WALLET_ADDRESSES = {
  'USDT-ERC20': '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
  'USDT-TRC20': 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt'
};

// Get supported payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'USDT-ERC20',
        name: 'USDT (ERC20)',
        description: 'Ethereum network',
        wallet: WALLET_ADDRESSES['USDT-ERC20'],
        minAmount: 50,
        maxAmount: 10000,
        fee: 0,
        estimatedTime: '5-15 minutes'
      },
      {
        id: 'USDT-TRC20',
        name: 'USDT (TRC20)',
        description: 'TRON network',
        wallet: WALLET_ADDRESSES['USDT-TRC20'],
        minAmount: 50,
        maxAmount: 10000,
        fee: 0,
        estimatedTime: '1-3 minutes'
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a new payment order
const createPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const userId = req.user.user_id; // Get userId from authenticated user

    // Validate input
    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Amount and currency are required'
      });
    }

    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is 50 USDT'
      });
    }

    if (!['USDT-ERC20', 'USDT-TRC20'].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Supported: USDT-ERC20, USDT-TRC20'
      });
    }

    // Generate unique order ID
    const orderId = `PAY_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Get wallet address for the currency
    const walletAddress = WALLET_ADDRESSES[currency];

    // Generate mock QR code data
    const qrData = `${currency}:${walletAddress}?amount=${amount}&memo=${orderId}`;
    const qrCode = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          ${qrData}
        </text>
      </svg>
    `).toString('base64')}`;

    // Mock payment data
    const payment = {
      orderId,
      amount,
      currency,
      wallet: walletAddress,
      qrCode,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: payment
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get payment status (mock version)
const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Mock payment status
    const payment = {
      orderId: id,
      amount: 100,
      currency: 'USDT-ERC20',
      wallet: WALLET_ADDRESSES['USDT-ERC20'],
      status: 'pending',
      txHash: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      confirmedAt: null
    };

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's payment history (mock version)
const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock payment history
    const payments = [
      {
        _id: '1',
        orderId: 'PAY_1703123456_ABC12345',
        amount: 100,
        currency: 'USDT-ERC20',
        wallet: WALLET_ADDRESSES['USDT-ERC20'],
        status: 'paid',
        txHash: '0x1234567890abcdef',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
      },
      {
        _id: '2',
        orderId: 'PAY_1703123457_DEF67890',
        amount: 50,
        currency: 'USDT-TRC20',
        wallet: WALLET_ADDRESSES['USDT-TRC20'],
        status: 'pending',
        txHash: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        confirmedAt: null
      }
    ];

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          current: 1,
          pages: 1,
          total: payments.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create withdrawal request (mock version)
const createWithdrawal = async (req, res) => {
  try {
    const { amount, currency, walletAddress, userId } = req.body;

    // Validate input
    if (!amount || !currency || !walletAddress || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, currency, walletAddress, and userId are required'
      });
    }

    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 50 USDT'
      });
    }

    if (!['USDT-ERC20', 'USDT-TRC20'].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Supported: USDT-ERC20, USDT-TRC20'
      });
    }

    // Generate unique withdrawal ID
    const withdrawalId = `WTH_${Date.now()}_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Mock withdrawal data
    const withdrawal = {
      orderId: withdrawalId,
      amount,
      currency,
      wallet: walletAddress,
      status: 'pending',
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawal
    });

  } catch (error) {
    console.error('Error creating withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get withdrawal history (mock version)
const getWithdrawalHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock withdrawal history
    const withdrawals = [
      {
        _id: '1',
        orderId: 'WTH_1703123456_XYZ12345',
        amount: 75,
        currency: 'USDT-TRC20',
        wallet: 'TUserWalletAddress123456789',
        status: 'paid',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 11 * 60 * 60 * 1000)
      },
      {
        _id: '2',
        orderId: 'WTH_1703123457_ABC67890',
        amount: 100,
        currency: 'USDT-ERC20',
        wallet: '0xUserWalletAddress123456789',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        confirmedAt: null
      }
    ];

    res.json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          current: 1,
          pages: 1,
          total: withdrawals.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createPayment,
  getPaymentStatus,
  getPaymentHistory,
  getPaymentMethods,
  createWithdrawal,
  getWithdrawalHistory
};
