'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Eye,
  AlertCircle,
  Shield,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Deposit {
  id: number;
  user_id: number;
  amount: number;
  payment_method: 'USDT_TRC20' | 'USDT_BEP20';
  wallet_address: string;
  transaction_hash: string | null;
  status: 'pending' | 'verified' | 'rejected';
  payment_proof_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DepositsManagementPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    payment_method: 'USDT_BEP20' as 'USDT_TRC20' | 'USDT_BEP20',
    wallet_address: '',
    transaction_hash: '',
    payment_proof_url: ''
  });

  // Verification form
  const [verificationData, setVerificationData] = useState({
    status: 'pending' as 'pending' | 'verified' | 'rejected',
    admin_notes: ''
  });

  // Wallet addresses
  const walletAddresses = {
    USDT_TRC20: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
    USDT_BEP20: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30'
  };

  // Load deposits
  const loadDeposits = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/deposits?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDeposits(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || 'Failed to load deposits');
      }
    } catch (error) {
      console.error('Error loading deposits:', error);
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  // Load deposits on component mount and when filters change
  useEffect(() => {
    loadDeposits(1);
  }, [searchTerm, statusFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDeposits(pagination.page);
    }, 30000);

    return () => clearInterval(interval);
  }, [pagination.page]);

  // Handle add deposit
  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum amount
    if (parseFloat(formData.amount) < 50) {
      toast.error('Minimum deposit amount is 50 USDT');
      return;
    }
    
    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          wallet_address: walletAddresses[formData.payment_method]
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Deposit added successfully!');
        setShowAddModal(false);
        setFormData({
          user_id: '',
          amount: '',
          payment_method: 'USDT_BEP20',
          wallet_address: '',
          transaction_hash: '',
          payment_proof_url: ''
        });
        loadDeposits(pagination.page);
      } else {
        toast.error(data.error || 'Failed to add deposit');
      }
    } catch (error) {
      console.error('Error adding deposit:', error);
      toast.error('Failed to add deposit');
    }
  };

  // Handle verify deposit
  const handleVerifyDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDeposit) return;
    
    try {
      const response = await fetch('/api/deposits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedDeposit.id,
          ...verificationData
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Deposit verification updated successfully!');
        setShowVerifyModal(false);
        setSelectedDeposit(null);
        setVerificationData({ status: 'pending', admin_notes: '' });
        loadDeposits(pagination.page);
      } else {
        toast.error(data.error || 'Failed to update deposit verification');
      }
    } catch (error) {
      console.error('Error updating deposit:', error);
      toast.error('Failed to update deposit verification');
    }
  };

  // Handle delete deposit
  const handleDeleteDeposit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this deposit?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/deposits?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Deposit deleted successfully!');
        loadDeposits(pagination.page);
      } else {
        toast.error(data.error || 'Failed to delete deposit');
      }
    } catch (error) {
      console.error('Error deleting deposit:', error);
      toast.error('Failed to delete deposit');
    }
  };

  // Open verify modal
  const openVerifyModal = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setVerificationData({
      status: deposit.status,
      admin_notes: deposit.admin_notes || ''
    });
    setShowVerifyModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'pending':
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deposits Management</h1>
          <p className="text-gray-600">Manage user deposits and payment verification</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deposits.filter(d => d.status === 'verified').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deposits.filter(d => d.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deposits.filter(d => d.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search deposits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => loadDeposits(pagination.page)}
                disabled={loading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                        <span className="text-gray-500">Loading deposits...</span>
                      </div>
                    </td>
                  </tr>
                ) : deposits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No deposits found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first deposit.</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Deposit
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{deposit.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {deposit.user_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {deposit.user_id} | {deposit.user_email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(deposit.amount)}
                        </div>
                        {deposit.amount < 50 && (
                          <div className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Below minimum
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {deposit.payment_method.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {deposit.wallet_address.substring(0, 10)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deposit.transaction_hash ? (
                          <div className="flex items-center">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {deposit.transaction_hash.substring(0, 10)}...
                            </code>
                            <ExternalLink className="h-3 w-3 ml-1 text-gray-400" />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No hash</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                          {getStatusIcon(deposit.status)}
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(deposit.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openVerifyModal(deposit)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Verify"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          {deposit.payment_proof_url && (
                            <button
                              onClick={() => window.open(deposit.payment_proof_url!, '_blank')}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="View Proof"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDeposit(deposit.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => loadDeposits(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => loadDeposits(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Deposit</h3>
              <form onSubmit={handleAddDeposit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="number"
                      value={formData.user_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (USDT) - Minimum 50
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        payment_method: e.target.value as 'USDT_TRC20' | 'USDT_BEP20',
                        wallet_address: walletAddresses[e.target.value as 'USDT_TRC20' | 'USDT_BEP20']
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USDT_BEP20">USDT (BEP20)</option>
                      <option value="USDT_TRC20">USDT (TRC20)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={walletAddresses[formData.payment_method]}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Hash (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.transaction_hash}
                      onChange={(e) => setFormData(prev => ({ ...prev, transaction_hash: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Proof URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.payment_proof_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_proof_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verify Modal */}
        {showVerifyModal && selectedDeposit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Deposit</h3>
              <form onSubmit={handleVerifyDeposit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit ID
                    </label>
                    <input
                      type="text"
                      value={`#${selectedDeposit.id}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={formatAmount(selectedDeposit.amount)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={verificationData.status}
                      onChange={(e) => setVerificationData(prev => ({ 
                        ...prev, 
                        status: e.target.value as 'pending' | 'verified' | 'rejected' 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      value={verificationData.admin_notes}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, admin_notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add verification notes..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Verification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
