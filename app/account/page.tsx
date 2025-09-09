'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  Copy,
  QrCode,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  estimatedTime: string;
  walletAddress: string;
  network: string;
}

interface Payment {
  orderId: string;
  amount: number;
  currency: string;
  wallet: string;
  qrCode: string;
}

export default function MyAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositForm, setDepositForm] = useState({
    amount: '',
    method: '',
    note: ''
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    address: '',
    note: ''
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
    loadPaymentMethods();
  }, [router]);

  const loadPaymentMethods = async () => {
    try {
      // Mock payment methods - replace with actual API call
      setPaymentMethods([
        {
          id: 'usdt-trc20',
          name: 'USDT (TRC20)',
          description: 'Tether USD on TRON network',
          minAmount: 50,
          estimatedTime: '5-10 minutes',
          walletAddress: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
          network: 'TRON (TRC20)'
        },
        {
          id: 'usdt-bep20',
          name: 'USDT (BEP20)',
          description: 'Tether USD on BSC network',
          minAmount: 50,
          estimatedTime: '5-10 minutes',
          walletAddress: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
          network: 'BSC BNB Smart Chain (BEP20)'
        }
      ]);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositForm.amount || !depositForm.method) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(depositForm.amount);
    if (amount < 50) {
      toast.error('Minimum investment is 50 USDT. Please enter a valid amount.');
      return;
    }

    try {
      // Find the selected payment method
      const selectedMethod = paymentMethods.find(method => method.id === depositForm.method);
      if (!selectedMethod) {
        toast.error('Invalid payment method selected');
        return;
      }

      // Mock payment creation - replace with actual API call
      const mockPayment: Payment = {
        orderId: `ORD-${Date.now()}`,
        amount: parseFloat(depositForm.amount),
        currency: selectedMethod.name,
        wallet: selectedMethod.walletAddress,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedMethod.walletAddress}`
      };

      setCurrentPayment(mockPayment);
      toast.success('Payment created successfully!');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawForm.amount || !withdrawForm.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Mock withdrawal - replace with actual API call
      toast.success('Withdrawal request submitted successfully!');
      setWithdrawForm({ amount: '', address: '', note: '' });
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your deposits, withdrawals, and transactions</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'deposit'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Withdraw
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
                Deposit Funds
              </h2>
              
              {!currentPayment ? (
                <form onSubmit={handleDepositSubmit} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (USDT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter amount (minimum 50 USDT)"
                      required
                    />
                    <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                      <span className="font-medium">Starter:</span> 50 USDT minimum investment required. Amounts below 50 USDT cannot be processed for payment.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={depositForm.method}
                      onChange={(e) => setDepositForm({ ...depositForm, method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name} - {method.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      value={depositForm.note}
                      onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="Add a note..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Create Payment
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Order ID: {currentPayment.orderId}</p>
                      <p className="text-lg font-semibold">Amount: {currentPayment.amount} USDT</p>
                      <p className="text-sm text-gray-600">Method: {currentPayment.currency}</p>
                      <p className="text-sm text-gray-600">Network: {paymentMethods.find(m => m.walletAddress === currentPayment.wallet)?.network}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-medium mb-2">Send to this address:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                      <code className="text-sm break-all">{currentPayment.wallet}</code>
                      <button
                        onClick={() => copyToClipboard(currentPayment.wallet)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="font-medium mb-2">Or scan QR code:</h4>
                    <div className="flex justify-center">
                      <img 
                        src={currentPayment.qrCode} 
                        alt="Payment QR Code" 
                        className="w-48 h-48 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => setCurrentPayment(null)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Create New Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <p className="text-sm text-gray-500">Network: {method.network}</p>
                        <p className="text-sm text-gray-500">Min: {method.minAmount} USDT</p>
                        <p className="text-sm text-gray-500">Est. time: {method.estimatedTime}</p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Wallet Address:</p>
                          <code className="text-xs bg-gray-100 p-1 rounded break-all">{method.walletAddress}</code>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-green-600">No fees</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-red-600" />
              Withdraw Funds
            </h2>
            
            <form onSubmit={handleWithdrawal} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={withdrawForm.address}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter wallet address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={withdrawForm.note}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Add a note..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Submit Withdrawal Request
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Transaction History
            </h2>
            
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-sm text-gray-500">Your transaction history will appear here</p>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}