'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Download,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TransactionProof {
  id: number;
  referred_id: number;
  referrer_id: number;
  image_url: string;
  transaction_hash: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  hash_password?: string;
  full_name?: string;
  email?: string;
  referred_name: string;
  referred_email: string;
  referrer_name: string;
  referrer_email: string;
}

export default function AdminTransactionProofsPage() {
  const [transactions, setTransactions] = useState<TransactionProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionProof | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED - FETCHING DATA ===');
    fetchTransactionProofs();
    
    // Set up automatic refresh every 10 seconds for better responsiveness
    const interval = setInterval(() => {
      console.log('=== AUTO REFRESH - FETCHING DATA ===');
      console.log('Current time:', new Date().toLocaleTimeString());
      fetchTransactionProofs(true);
    }, 10000); // 10 seconds
    
    // Set next refresh time
    const nextRefreshTime = new Date();
    nextRefreshTime.setSeconds(nextRefreshTime.getSeconds() + 10);
    setNextRefresh(nextRefreshTime);
    
    console.log('=== AUTO REFRESH INTERVAL SET UP ===');
    console.log('Interval ID:', interval);
    console.log('Next refresh at:', nextRefreshTime.toLocaleTimeString());
    
    // Cleanup interval on component unmount
    return () => {
      console.log('=== CLEANING UP AUTO REFRESH INTERVAL ===');
      clearInterval(interval);
    };
  }, []);

  const fetchTransactionProofs = async (isAutoRefresh = false) => {
    try {
      console.log('=== FETCHING TRANSACTION PROOFS ===');
      if (isAutoRefresh) {
        setAutoRefreshing(true);
      } else {
      setLoading(true);
      }
      
      // Add cache-busting parameter
      const response = await fetch(`/api/admin/transaction-proofs/?t=${Date.now()}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        const newCount = data.transactions?.length || 0;
        const currentCount = transactions.length;
        
        console.log('Setting transactions:', data.transactions);
        console.log('Current count:', currentCount, 'New count:', newCount, 'Previous count:', previousCount);
        
        setTransactions(data.transactions);
        setLastUpdated(new Date());
        
        // Update next refresh time
        const nextRefreshTime = new Date();
        nextRefreshTime.setSeconds(nextRefreshTime.getSeconds() + 10);
        setNextRefresh(nextRefreshTime);
        
        console.log('Transactions state updated, count:', newCount);
        
        // Check for new transactions during auto-refresh
        if (isAutoRefresh && newCount > previousCount && previousCount > 0) {
          const newTransactions = newCount - previousCount;
          toast.success(`${newTransactions} new transaction${newTransactions > 1 ? 's' : ''} detected!`);
          console.log(`New transactions detected: ${newTransactions}`);
        }
        
        // Update previous count for next comparison
        setPreviousCount(newCount);
        
        if (isAutoRefresh) {
          console.log('Auto-refresh completed successfully');
        }
      } else {
        console.error('Failed to fetch transaction proofs:', data);
        if (!isAutoRefresh) {
        toast.error('Failed to fetch transaction proofs');
        }
      }
    } catch (error) {
      console.error('Error fetching transaction proofs:', error);
      if (!isAutoRefresh) {
      toast.error('Failed to fetch transaction proofs');
      }
    } finally {
      if (isAutoRefresh) {
        setAutoRefreshing(false);
      } else {
      setLoading(false);
      }
    }
  };

  const updateTransactionStatus = async (transactionId: number, status: 'verified' | 'rejected') => {
    try {
      console.log('=== UPDATING TRANSACTION STATUS ===');
      console.log('Transaction ID:', transactionId);
      console.log('New Status:', status);
      console.log('Current URL:', window.location.href);
      
      const url = '/api/admin/transaction-proofs';
      console.log('API URL:', url);
      
      const requestBody = {
        transactionId,
        status,
      };
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast.error(`HTTP Error: ${response.status} - ${response.statusText} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        toast.success(`Transaction ${status} successfully!`);
        fetchTransactionProofs(); // Refresh the list
      } else {
        console.error('Update failed:', data);
        toast.error(data.error || data.message || 'Failed to update transaction status');
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update transaction status: ${errorMessage}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status === filter;
    const matchesSearch = searchTerm === '' || 
      transaction.referred_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.referrer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase());
    
    console.log('Filtering transaction:', {
      id: transaction.id,
      status: transaction.status,
      matchesFilter,
      matchesSearch,
      searchTerm,
      filter
    });
    
    return matchesFilter && matchesSearch;
  });

  console.log('Filtered transactions count:', filteredTransactions.length);
  console.log('All transactions count:', transactions.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transaction proofs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Debug Info */}
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-sm font-medium text-yellow-800">Debug Info:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <p className="text-yellow-700">Transactions count: {transactions.length}</p>
            <p className="text-yellow-700">Loading: {loading ? 'YES' : 'NO'}</p>
            <div className="flex items-center gap-1">
              <span className="text-yellow-700">Auto-refreshing:</span>
              <span className={autoRefreshing ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                {autoRefreshing ? 'YES' : 'NO'}
              </span>
              {autoRefreshing && <div className="animate-spin h-3 w-3 border border-yellow-600 border-t-transparent rounded-full"></div>}
            </div>
            <p className="text-yellow-700">Filter: {filter}</p>
            <p className="text-yellow-700">Search term: {searchTerm}</p>
            <p className="text-yellow-700">Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</p>
            <p className="text-yellow-700">Next refresh: {nextRefresh ? nextRefresh.toLocaleTimeString() : 'Not set'}</p>
            <p className="text-yellow-700">Previous count: {previousCount}</p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Proofs</h1>
          <p className="text-gray-600">Review and verify user transaction proofs</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'pending', 'verified', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                console.log('=== MANUAL REFRESH CLICKED ===');
                fetchTransactionProofs();
              }}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                autoRefreshing ? 'opacity-75' : ''
              }`}
              disabled={autoRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefreshing ? 'animate-spin' : ''}`} />
              {autoRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transaction proofs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referred User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
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
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={transaction.image_url}
                            alt="Transaction proof"
                            className="h-12 w-12 object-cover rounded-lg mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              #{transaction.id}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {transaction.transaction_hash ? 
                                `${transaction.transaction_hash.substring(0, 10)}...` : 
                                'No hash'
                              }
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.referred_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.referred_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.referrer_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.referrer_email || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          ${transaction.amount || '50.00'} USDT
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              console.log('=== EYE ICON CLICKED ===');
                              console.log('Transaction ID:', transaction.id);
                              console.log('Image URL:', transaction.image_url);
                              setSelectedTransaction(transaction);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 border border-blue-300 rounded"
                            title="View Image"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {/* Show accept/reject buttons only for pending transactions */}
                          {transaction.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  console.log('=== ACCEPT BUTTON CLICKED ===');
                                  console.log('Transaction ID:', transaction.id);
                                  console.log('Transaction details:', transaction);
                                  try {
                                    await updateTransactionStatus(transaction.id, 'verified');
                                    console.log('Accept button action completed');
                                  } catch (error) {
                                    console.error('Error in accept button:', error);
                                  }
                                }}
                                className="p-1 border rounded hover:bg-green-50 text-green-600 hover:text-green-900 border-green-300"
                                title="Accept Transaction"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  console.log('=== REJECT BUTTON CLICKED ===');
                                  console.log('Transaction ID:', transaction.id);
                                  console.log('Transaction details:', transaction);
                                  try {
                                    await updateTransactionStatus(transaction.id, 'rejected');
                                    console.log('Reject button action completed');
                                  } catch (error) {
                                    console.error('Error in reject button:', error);
                                  }
                                }}
                                className="p-1 border rounded hover:bg-red-50 text-red-600 hover:text-red-900 border-red-300"
                                title="Reject Transaction"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {/* Show status indicator for processed transactions */}
                          {transaction.status === 'verified' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </div>
                          )}
                          
                          {transaction.status === 'rejected' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </div>
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

        {/* Image View Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Transaction Image</h2>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Debug Info */}
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-sm font-medium text-yellow-800">Debug Info:</p>
                  <p className="text-xs text-yellow-700">Transaction Hash: {selectedTransaction.transaction_hash}</p>
                  <p className="text-xs text-yellow-700">Image URL Length: {selectedTransaction.image_url?.length || 0}</p>
                  <p className="text-xs text-yellow-700">Image URL Type: {selectedTransaction.image_url?.startsWith('data:') ? 'Base64' : 'File Path'}</p>
                  <p className="text-xs text-yellow-700">Image Preview: {selectedTransaction.image_url?.substring(0, 50)}...</p>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction Hash</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedTransaction.transaction_hash}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">${selectedTransaction.amount} USDT</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedTransaction.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedTransaction.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hash Password</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono break-all">{selectedTransaction.hash_password || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Image Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Screenshot</label>
                  {selectedTransaction.image_url ? (
                    <div className="relative">
                      <img
                        src={selectedTransaction.image_url.startsWith('data:') ? selectedTransaction.image_url : `data:image/png;base64,${selectedTransaction.image_url}`}
                        alt="Transaction screenshot"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                        onError={(e) => {
                          console.error('Image load error for transaction:', selectedTransaction.id);
                          console.error('Image URL length:', selectedTransaction.image_url.length);
                          console.error('Image URL starts with data:', selectedTransaction.image_url.startsWith('data:'));
                          
                          // Show error message
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'p-4 text-center text-red-500 border border-red-300 rounded-lg';
                          errorDiv.innerHTML = `
                            <p>Failed to load image</p>
                            <p class="text-xs mt-2">URL length: ${selectedTransaction.image_url.length}</p>
                            <p class="text-xs">Preview: ${selectedTransaction.image_url.substring(0, 50)}...</p>
                            <button onclick="this.parentElement.previousElementSibling.style.display='block'; this.parentElement.remove();" 
                                    class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs">
                              Retry
                            </button>
                          `;
                          img.parentNode?.replaceChild(errorDiv, img);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for transaction:', selectedTransaction.id);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 border border-gray-300 rounded-lg">
                      No image available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
