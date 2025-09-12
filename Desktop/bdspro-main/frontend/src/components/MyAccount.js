import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { transactionAPI } from '../services/api';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyAccount = () => {
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

  const queryClient = useQueryClient();

  // Get transaction history
  const { data: historyData, isLoading: historyLoading } = useQuery(
    ['transactions', activeTab],
    () => transactionAPI.getTransactionHistory({ type: activeTab === 'history' ? 'all' : activeTab }),
    {
      enabled: activeTab === 'history'
    }
  );

  // Deposit mutation
  const depositMutation = useMutation(transactionAPI.createDeposit, {
    onSuccess: () => {
      toast.success('Deposit request submitted successfully!');
      setDepositForm({ amount: '', method: '', note: '' });
      queryClient.invalidateQueries('dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit deposit request');
    }
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation(transactionAPI.createWithdrawal, {
    onSuccess: () => {
      toast.success('Withdrawal request submitted successfully!');
      setWithdrawForm({ amount: '', address: '', note: '' });
      queryClient.invalidateQueries('dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    }
  });

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositForm.amount || !depositForm.method) {
      toast.error('Please fill in all required fields');
      return;
    }
    depositMutation.mutate(depositForm);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || !withdrawForm.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    withdrawMutation.mutate(withdrawForm);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
            { id: 'history', label: 'History', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="max-w-md">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Funds</h3>
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USDT)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="50.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum deposit: 50 USDT</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={depositForm.method}
                    onChange={(e) => setDepositForm({ ...depositForm, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="usdt">USDT (TRC20)</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={depositForm.note}
                    onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a note for this deposit..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={depositMutation.isLoading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {depositMutation.isLoading ? 'Submitting...' : 'Submit Deposit Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="max-w-md">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Funds</h3>
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USDT)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="10.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: 10 USDT</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    USDT Address (TRC20)
                  </label>
                  <input
                    type="text"
                    value={withdrawForm.address}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="TRC20 USDT address..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Please ensure this is a valid TRC20 USDT address</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={withdrawForm.note}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, note: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a note for this withdrawal..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={withdrawMutation.isLoading}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawMutation.isLoading ? 'Submitting...' : 'Submit Withdrawal Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
            </div>
            
            {historyLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading transactions...</p>
              </div>
            ) : historyData?.data?.transactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyData.data.transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={transaction.credit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.credit > 0 ? '+' : ''}${transaction.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
