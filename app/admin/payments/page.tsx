'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Calendar,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  userId: string;
  referrerId: string;
  fullName: string;
  email: string;
  amount: number;
  imageUrl: string;
  transactionHash: string;
  hashPassword: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    console.log('=== CHECKING AUTH ===');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    console.log('Is admin:', isAdmin);
    if (!isAdmin) {
      console.log('Not admin, redirecting...');
      window.location.href = '/admin';
      return;
    }
    console.log('Admin authenticated, fetching payments...');
    setIsAuthenticated(true);
    fetchPayments();
  };

  const fetchPayments = async () => {
    try {
      console.log('=== FETCHING PAYMENTS ===');
      setLoading(true);
      const response = await fetch('/api/admin/payments');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Setting payments:', data.payments);
        setPayments(data.payments);
        console.log('Payments state updated');
        // Debug image URLs
        data.payments.forEach((payment: any) => {
          console.log(`Payment ${payment.id} image URL:`, {
            length: payment.imageUrl?.length || 0,
            startsWithData: payment.imageUrl?.startsWith('data:') || false,
            preview: payment.imageUrl?.substring(0, 50) || 'No image'
          });
        });
      } else {
        console.error('Failed to fetch payments:', data);
        toast.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: paymentId, status }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (status === 'verified') {
          toast.success(`Payment verified and $${selectedPayment?.amount} credited to user account!`);
        } else {
        toast.success(`Payment ${status} successfully`);
        }
        fetchPayments();
        setSelectedPayment(null);
        setAdminNotes('');
      } else {
        toast.error(data.message || 'Failed to update payment');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'verified': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600 mt-2">Manage and verify cryptocurrency payments</p>
            </div>
            <button
              onClick={fetchPayments}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Hash
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
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.fullName}</div>
                          <div className="text-sm text-gray-500">{payment.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount} USDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-mono text-xs">{payment.transactionHash.substring(0, 10)}...</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              console.log('=== EYE ICON CLICKED ===');
                              console.log('Payment ID:', payment.id);
                              console.log('Payment object:', payment);
                              console.log('Image URL:', payment.imageUrl);
                              console.log('Image URL length:', payment.imageUrl?.length);
                              console.log('Setting selected payment...');
                              setSelectedPayment(payment);
                              console.log('Selected payment set:', payment);
                              alert(`Opening payment ${payment.id} - Check console for details`);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 border border-blue-300 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, 'verified')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
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

        {/* Debug Info */}
        <div className="fixed top-4 right-4 bg-red-100 border border-red-300 rounded p-2 text-xs z-50">
          <p>Selected Payment: {selectedPayment ? selectedPayment.id : 'None'}</p>
          <p>Modal should show: {selectedPayment ? 'YES' : 'NO'}</p>
          <p>Payments count: {payments.length}</p>
          <p>Loading: {loading ? 'YES' : 'NO'}</p>
          <p>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</p>
          <button 
            onClick={() => {
              console.log('=== TEST BUTTON CLICKED ===');
              alert('Test button works!');
            }}
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Test Click
          </button>
        </div>

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Debug Info */}
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-sm font-medium text-yellow-800">Debug Info:</p>
                  <p className="text-xs text-yellow-700">Payment ID: {selectedPayment.id}</p>
                  <p className="text-xs text-yellow-700">Image URL Length: {selectedPayment.imageUrl?.length || 0}</p>
                  <p className="text-xs text-yellow-700">Image URL Type: {selectedPayment.imageUrl?.startsWith('data:') ? 'Base64' : 'File Path'}</p>
                  <p className="text-xs text-yellow-700">Image Preview: {selectedPayment.imageUrl?.substring(0, 50)}...</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(selectedPayment.status)}`}>
                        {getStatusIcon(selectedPayment.status)}
                        <span className="ml-1 capitalize">{selectedPayment.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="mt-1 text-sm text-gray-900">${selectedPayment.amount} USDT</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction Hash</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedPayment.transactionHash}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.userId}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction Screenshot</label>
                    <div className="mt-2">
                      {selectedPayment.imageUrl ? (
                        <div className="relative">
                      <img
                            src={selectedPayment.imageUrl.startsWith('data:') ? selectedPayment.imageUrl : `data:image/png;base64,${selectedPayment.imageUrl}`}
                        alt="Transaction screenshot"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                            style={{ maxHeight: '400px', objectFit: 'contain' }}
                            onError={(e) => {
                              console.error('Image load error for payment:', selectedPayment.id);
                              console.error('Image URL length:', selectedPayment.imageUrl.length);
                              console.error('Image URL starts with data:', selectedPayment.imageUrl.startsWith('data:'));
                              
                              // Show error message
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'p-4 text-center text-red-500 border border-red-300 rounded-lg';
                              errorDiv.innerHTML = `
                                <p>Failed to load image</p>
                                <p class="text-xs mt-2">URL length: ${selectedPayment.imageUrl.length}</p>
                                <p class="text-xs">Preview: ${selectedPayment.imageUrl.substring(0, 50)}...</p>
                                <button onclick="this.parentElement.previousElementSibling.style.display='block'; this.parentElement.remove();" 
                                        class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-xs">
                                  Retry
                                </button>
                              `;
                              img.parentNode?.replaceChild(errorDiv, img);
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully for payment:', selectedPayment.id);
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add notes about this payment..."
                    />
                  </div>
                </div>

                {selectedPayment.status === 'pending' && (
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment.id, 'verified', adminNotes)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                      Verify Payment
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected', adminNotes)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
