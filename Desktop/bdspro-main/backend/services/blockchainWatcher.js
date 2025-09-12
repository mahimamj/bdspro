const { ethers } = require('ethers');
const TronWeb = require('tronweb').default;
const Payment = require('../models/Payment');
const QRCode = require('qrcode');

// Blockchain configuration
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY';
const TRON_RPC_URL = process.env.TRON_RPC_URL || 'https://api.trongrid.io';

// Wallet addresses
const WALLET_ADDRESSES = {
  'USDT-ERC20': process.env.USDT_ERC20_WALLET || '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
  'USDT-TRC20': process.env.USDT_TRC20_WALLET || 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt'
};

// USDT contract addresses
const USDT_CONTRACTS = {
  'USDT-ERC20': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
  'USDT-TRC20': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // USDT on TRON
};

class BlockchainWatcher {
  constructor() {
    this.ethereumProvider = null;
    this.tronWeb = null;
    this.isRunning = false;
    this.pollInterval = 30000; // 30 seconds
  }

  async initialize() {
    try {
      // Initialize Ethereum provider
      this.ethereumProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
      
      // Initialize TronWeb (with error handling)
      try {
        this.tronWeb = new TronWeb({
          fullHost: TRON_RPC_URL,
          privateKey: process.env.TRON_PRIVATE_KEY || 'your-tron-private-key'
        });
      } catch (tronError) {
        console.warn('TronWeb initialization failed, running in demo mode:', tronError.message);
        this.tronWeb = null;
      }

      console.log('Blockchain watcher initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain watcher:', error);
      // Don't throw error, just log it and continue in demo mode
      console.log('Running in demo mode without blockchain watcher');
    }
  }

  async startWatching() {
    if (this.isRunning) {
      console.log('Blockchain watcher is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting blockchain watcher...');

    // Start polling for payments
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkPendingPayments();
      } catch (error) {
        console.error('Error in blockchain polling:', error);
      }
    }, this.pollInterval);
  }

  async stopWatching() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isRunning = false;
    console.log('Blockchain watcher stopped');
  }

  async checkPendingPayments() {
    try {
      // Get all pending payments
      const pendingPayments = await Payment.find({ 
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      console.log(`Checking ${pendingPayments.length} pending payments...`);

      for (const payment of pendingPayments) {
        try {
          let isConfirmed = false;
          let txHash = null;

          if (payment.currency === 'USDT-ERC20') {
            const result = await this.checkERC20Payment(payment);
            isConfirmed = result.confirmed;
            txHash = result.txHash;
          } else if (payment.currency === 'USDT-TRC20') {
            const result = await this.checkTRC20Payment(payment);
            isConfirmed = result.confirmed;
            txHash = result.txHash;
          }

          if (isConfirmed && txHash) {
            // Update payment status to paid
            await Payment.findByIdAndUpdate(payment._id, {
              status: 'paid',
              txHash: txHash,
              confirmedAt: new Date()
            });

            console.log(`Payment confirmed: ${payment.orderId}, TX: ${txHash}`);
          }
        } catch (error) {
          console.error(`Error checking payment ${payment.orderId}:`, error);
        }
      }

      // Mark expired payments as failed
      await Payment.updateMany(
        { 
          status: 'pending',
          expiresAt: { $lte: new Date() }
        },
        { status: 'expired' }
      );

    } catch (error) {
      console.error('Error in checkPendingPayments:', error);
    }
  }

  async checkERC20Payment(payment) {
    try {
      const walletAddress = WALLET_ADDRESSES['USDT-ERC20'];
      const usdtContractAddress = USDT_CONTRACTS['USDT-ERC20'];

      // Get the USDT contract
      const usdtContract = new ethers.Contract(
        usdtContractAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'event Transfer(address indexed from, address indexed to, uint256 value)'
        ],
        this.ethereumProvider
      );

      // Check current balance
      const currentBalance = await usdtContract.balanceOf(walletAddress);
      const requiredAmount = ethers.parseUnits(payment.amount.toString(), 6); // USDT has 6 decimals

      // For simplicity, we'll check if the balance has increased by the required amount
      // In a real implementation, you'd track the balance before the payment was created
      if (currentBalance >= requiredAmount) {
        // Get recent transactions
        const filter = usdtContract.filters.Transfer(null, walletAddress);
        const events = await usdtContract.queryFilter(filter, -1000); // Last 1000 blocks

        // Find a transaction that matches our amount
        for (const event of events) {
          if (event.args.value.toString() === requiredAmount.toString()) {
            return {
              confirmed: true,
              txHash: event.transactionHash
            };
          }
        }
      }

      return { confirmed: false, txHash: null };
    } catch (error) {
      console.error('Error checking ERC20 payment:', error);
      return { confirmed: false, txHash: null };
    }
  }

  async checkTRC20Payment(payment) {
    try {
      if (!this.tronWeb) {
        console.log('TronWeb not available, skipping TRC20 check');
        return { confirmed: false, txHash: null };
      }

      const walletAddress = WALLET_ADDRESSES['USDT-TRC20'];
      const usdtContractAddress = USDT_CONTRACTS['USDT-TRC20'];

      // Get account info
      const account = await this.tronWeb.trx.getAccount(walletAddress);
      
      if (account && account.balance) {
        // Check TRC20 token balance
        const contract = await this.tronWeb.contract().at(usdtContractAddress);
        const balance = await contract.balanceOf(walletAddress).call();
        
        const requiredAmount = this.tronWeb.toBigNumber(payment.amount * 1000000); // USDT has 6 decimals

        if (balance.gte(requiredAmount)) {
          // Get recent transactions
          const transactions = await this.tronWeb.trx.getTransactionsFromAddress(walletAddress, 50);
          
          for (const tx of transactions) {
            if (tx.raw_data && tx.raw_data.contract) {
              for (const contract of tx.raw_data.contract) {
                if (contract.type === 'TriggerSmartContract') {
                  const parameter = contract.parameter.value;
                  if (parameter.contract_address === this.tronWeb.address.toHex(usdtContractAddress)) {
                    // This is a USDT transaction, check if amount matches
                    // Note: This is simplified - you'd need to decode the contract data properly
                    return {
                      confirmed: true,
                      txHash: tx.txID
                    };
                  }
                }
              }
            }
          }
        }
      }

      return { confirmed: false, txHash: null };
    } catch (error) {
      console.error('Error checking TRC20 payment:', error);
      return { confirmed: false, txHash: null };
    }
  }

  async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainWatcher();
