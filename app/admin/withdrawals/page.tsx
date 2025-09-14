'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Withdrawal {
  id: number;
  user_id: number;
  email: string;
  user_email: string;
  name: string;
  network: string;
  transaction_hash: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  const fetchWithdrawals = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setAutoRefreshing(true);
      }
      
      const url = `/api/withdrawals/?t=${Date.now()}`;
      console.log('Fetching withdrawals from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Withdrawals data:', data);
      
      if (data.success) {
        const newCount = data.withdrawals.length;
        if (isAutoRefresh && newCount > previousCount) {
          toast.success(`New withdrawal request detected!`);
        }
        setPreviousCount(newCount);
        setWithdrawals(data.withdrawals);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch withdrawals:', data.message);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
      if (isAutoRefresh) {
        setAutoRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchWithdrawals(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const updateWithdrawalStatus = async (withdrawalId: number, status: string) => {
    try {
      const response = await fetch('/api/withdrawals/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawalId,
          status
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Withdrawal ${status} successfully`);
        fetchWithdrawals();
      } else {
        toast.error(data.message || 'Failed to update withdrawal status');
      }
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      toast.error('Failed to update withdrawal status');
    }
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesFilter = filter === 'all' || withdrawal.status === filter;
    const matchesSearch = searchTerm === '' || 
      withdrawal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <ArrowUpRight className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Debug Panel */}
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
        <div className="text-sm text-yellow-800">
          <strong>Debug Info:</strong> Withdrawals: {withdrawals.length} | 
          Loading: {loading ? 'YES' : 'NO'} | 
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'} | 
          Auto-refreshing: {autoRefreshing ? 'YES' : 'NO'} | 
          Filter: {filter} | 
          Search: "{searchTerm}"
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600 mt-2">Manage user withdrawal requests and approvals</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or transaction hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => fetchWithdrawals()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${autoRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading withdrawals...</p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No withdrawals found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {withdrawal.email || withdrawal.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {withdrawal.network}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {withdrawal.transaction_hash}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)} USDT
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)}
                          <span className="ml-1 capitalize">{withdrawal.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                            className="text-blue-600 hover:text-blue-900 p-1 border border-blue-300 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                                className="text-green-600 hover:text-green-900 p-1 border border-green-300 rounded"
                                title="Approve Withdrawal"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateWithdrawalStatus(withdrawal.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 p-1 border border-red-300 rounded"
                                title="Reject Withdrawal"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {withdrawal.status === 'approved' && (
                            <button
                              onClick={() => updateWithdrawalStatus(withdrawal.id, 'completed')}
                              className="text-blue-600 hover:text-blue-900 p-1 border border-blue-300 rounded"
                              title="Mark as Completed"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Withdrawal Details</h2>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.email || selectedWithdrawal.user_email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Network</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWithdrawal.network}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">${selectedWithdrawal.amount.toFixed(2)} USDT</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction Hash</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedWithdrawal.transaction_hash}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedWithdrawal.status)}`}>
                      {getStatusIcon(selectedWithdrawal.status)}
                      <span className="ml-1 capitalize">{selectedWithdrawal.status}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedWithdrawal.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
