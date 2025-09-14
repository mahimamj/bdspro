'use client';

import React, { useState, useEffect } from 'react';

interface Withdrawal {
  id: number;
  user_id: number;
  email: string;
  user_email: string;
  name: string;
  network: string;
  transaction_hash: string;
  transaction_uid: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  hashed_password: string;
  uid: number;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [creatingTest, setCreatingTest] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/withdrawals/');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      } else {
        setError(data.message || 'Failed to fetch withdrawals');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error - Please check your connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const createTestWithdrawal = async () => {
    try {
      setCreatingTest(true);
      const response = await fetch('/api/create-test-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchWithdrawals();
        alert('Test withdrawal created successfully!');
      } else {
        alert(`Failed to create test withdrawal: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to create test withdrawal');
    } finally {
      setCreatingTest(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const withdrawal = withdrawals.find(w => w.id === id);
    if (!withdrawal) return;

    const confirmMessage = status === 'approved' 
      ? `Are you sure you want to APPROVE this withdrawal of $${withdrawal.amount} USDT?\n\nThis will deduct the amount from the user's balance.`
      : `Are you sure you want to REJECT this withdrawal of $${withdrawal.amount} USDT?`;

    if (!confirm(confirmMessage)) return;

    try {
      setProcessing(id);
      const response = await fetch('/api/withdrawals/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id, status }),
      });
      
      if (response.ok) {
        await fetchWithdrawals();
        alert(`Withdrawal ${status} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchWithdrawals}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
            <p className="text-gray-600 mt-2">Manage user withdrawal requests</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createTestWithdrawal}
              disabled={creatingTest}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creatingTest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Test Data
                </>
              )}
            </button>
            <a
              href="/test-withdrawal"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test System
            </a>
            <button
              onClick={fetchWithdrawals}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {withdrawals.filter(w => w.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {withdrawals.filter(w => w.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${withdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No withdrawals found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WITHDRAWAL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USER DETAILS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NETWORK</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMOUNT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{withdrawal.id}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              WTH_{withdrawal.transaction_uid || withdrawal.transaction_hash?.substring(0, 12) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {withdrawal.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {withdrawal.email || withdrawal.user_email}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            UID: {withdrawal.uid || withdrawal.user_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {withdrawal.network}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${withdrawal.amount.toFixed(2)} USDT
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                          withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {withdrawal.status === 'approved' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {withdrawal.status === 'rejected' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {withdrawal.status === 'pending' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {withdrawal.status === 'completed' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {withdrawal.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateStatus(withdrawal.id, 'approved')}
                                disabled={processing === withdrawal.id}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {processing === withdrawal.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Processing...
                                  </>
                                ) : (
                                  '✓ Approve'
                                )}
                              </button>
                              <button
                                onClick={() => updateStatus(withdrawal.id, 'rejected')}
                                disabled={processing === withdrawal.id}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {processing === withdrawal.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Processing...
                                  </>
                                ) : (
                                  '✗ Reject'
                                )}
                              </button>
                            </div>
                          )}
                          {withdrawal.status === 'approved' && (
                            <button
                              onClick={() => updateStatus(withdrawal.id, 'completed')}
                              disabled={processing === withdrawal.id}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {processing === withdrawal.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Processing...
                                </>
                              ) : (
                                'Complete'
                              )}
                            </button>
                          )}
                          {(withdrawal.status === 'rejected' || withdrawal.status === 'completed') && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              withdrawal.status === 'rejected' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {withdrawal.status === 'rejected' ? 'Rejected' : 'Completed'}
                            </span>
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
    </div>
  );
}