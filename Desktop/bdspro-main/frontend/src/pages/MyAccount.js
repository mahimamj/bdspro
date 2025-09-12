import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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

// API functions
const paymentAPI = {
  createPayment: async (data) => {
    const response = await fetch('http://localhost:5000/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  getPaymentMethods: async () => {
    const response = await fetch('http://localhost:5000/api/payments/methods');
    return response.json();
  },
  
  getPaymentStatus: async (orderId) => {
    const response = await fetch(`http://localhost:5000/api/payments/status/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },
  
  getPaymentHistory: async (userId) => {
    const response = await fetch(`http://localhost:5000/api/payments/history/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },
  
  createWithdrawal: async (data) => {
    const response = await fetch('http://localhost:5000/api/payments/withdraw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  getWithdrawalHistory: async (userId) => {
    const response = await fetch(`http://localhost:5000/api/payments/withdrawals/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};

const MyAccount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [currentPayment, setCurrentPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch payment methods
  const { data: paymentMethodsData } = useQuery(
    'paymentMethods',
    paymentAPI.getPaymentMethods,
    {
      select: (data) => data.data || []
    }
  );

  // Fetch payment history
  const { data: paymentHistoryData } = useQuery(
    ['paymentHistory', user?.user_id],
    () => paymentAPI.getPaymentHistory(user?.user_id),
    {
      enabled: !!user?.user_id,
      select: (data) => data.data || { payments: [] }
    }
  );

  // Fetch withdrawal history
  const { data: withdrawalHistoryData } = useQuery(
    ['withdrawalHistory', user?.user_id],
    () => paymentAPI.getWithdrawalHistory(user?.user_id),
    {
      enabled: !!user?.user_id,
      select: (data) => data.data || { withdrawals: [] }
    }
  );

  // Create payment mutation
  const createPaymentMutation = useMutation(paymentAPI.createPayment, {
    onSuccess: (data) => {
      if (data.success) {
        setCurrentPayment(data.data);
        toast.success('Payment order created successfully!');
      } else {
        toast.error(data.message || 'Failed to create payment order');
      }
    },
    onError: (error) => {
      toast.error('Failed to create payment order');
    }
  });

  // Create withdrawal mutation
  const createWithdrawalMutation = useMutation(paymentAPI.createWithdrawal, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Withdrawal request created successfully!');
        queryClient.invalidateQueries(['withdrawalHistory', user?.user_id]);
        setAmount('');
        setPaymentMethod('');
        setWalletAddress('');
      } else {
        toast.error(data.message || 'Failed to create withdrawal request');
      }
    },
    onError: (error) => {
      toast.error('Failed to create withdrawal request');
    }
  });

  // Handle deposit form submission
  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) < 50) {
      toast.error('Minimum deposit amount is 50 USDT');
      return;
    }

    createPaymentMutation.mutate({
      amount: parseFloat(amount),
      currency: paymentMethod,
      userId: user?.user_id
    });
  };

  // Handle withdrawal form submission
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod || !walletAddress) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) < 50) {
      toast.error('Minimum withdrawal amount is 50 USDT');
      return;
    }

    createWithdrawalMutation.mutate({
      amount: parseFloat(amount),
      currency: paymentMethod,
      walletAddress,
      userId: user?.user_id
    });
  };

  // Copy wallet address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="mt-2 text-gray-600">Manage your investments and transactions</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'deposit', name: 'Deposit', icon: ArrowDownLeft },
                { id: 'withdraw', name: 'Withdraw', icon: ArrowUpRight },
                { id: 'history', name: 'History', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'deposit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Deposit Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Add Funds</h2>
              
              {!currentPayment ? (
                <form onSubmit={handleDeposit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (USDT)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="50"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">Minimum deposit: 50 USDT</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select payment method</option>
                      {paymentMethodsData?.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name} - {method.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={createPaymentMutation.isLoading}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {createPaymentMutation.isLoading ? 'Creating...' : 'Create Payment'}
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
                      className="text-purple-600 hover:text-purple-700"
                    >
                      Create New Payment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {paymentMethodsData?.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <p className="text-sm text-gray-500">Min: {method.minAmount} USDT</p>
                        <p className="text-sm text-gray-500">Est. time: {method.estimatedTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">No fees</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Withdraw Funds</h2>
            
            <form onSubmit={handleWithdrawal} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="50"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Minimum withdrawal: 50 USDT</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethodsData?.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} - {method.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={createWithdrawalMutation.isLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {createWithdrawalMutation.isLoading ? 'Creating...' : 'Create Withdrawal'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            {/* Payment History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Payment History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistoryData?.payments?.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.amount} USDT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">{payment.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Withdrawal History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {withdrawalHistoryData?.withdrawals?.map((withdrawal) => (
                      <tr key={withdrawal._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {withdrawal.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {withdrawal.amount} USDT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {withdrawal.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                            {getStatusIcon(withdrawal.status)}
                            <span className="ml-1 capitalize">{withdrawal.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
