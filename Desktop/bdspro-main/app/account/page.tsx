'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { 
  Wallet, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  Share2, 
  Shield, 
  Info,
  ChevronDown,
  ExternalLink,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  user_id: string;
  name: string;
  email: string;
  account_balance: number;
  total_earning: number;
  rewards: number;
}

interface DepositAddress {
  network: string;
  address: string;
  minAmount: string;
  qrCode: string;
}

interface PaymentFormData {
  name: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  screenshot: FileList;
}

interface Payment {
  _id: string;
  name: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  status: 'pending' | 'paid' | 'rejected';
  createdAt: string;
  paidAt?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('BEP20');
  const [showDetails, setShowDetails] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  // Payment system states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittedPaymentId, setSubmittedPaymentId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<PaymentFormData>();

  // Cryptocurrency deposit addresses
  const depositAddresses: Record<string, DepositAddress> = {
    BEP20: {
      network: 'BSC BNB Smart Chain (BEP20)',
      address: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
      minAmount: '50',
      qrCode: '/qr-bep20.png'
    },
    TRC20: {
      network: 'TRX Tron (TRC20)',
      address: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
      minAmount: '50',
      qrCode: '/qr-trc20.png'
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${baseUrl}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
        } else {
          console.error('Failed to fetch user data');
          // Set default user data if API fails
          setUserData({
            user_id: '1',
            name: 'User',
            email: 'user@example.com',
            account_balance: 0,
            total_earning: 0,
            rewards: 0
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default user data if API fails
        setUserData({
          user_id: '1',
          name: 'User',
          email: 'user@example.com',
          account_balance: 0,
          total_earning: 0,
          rewards: 0
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch user payments
  useEffect(() => {
    const fetchUserPayments = async () => {
      if (!userData?.email) return;
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${baseUrl}/api/payments?email=${encodeURIComponent(userData.email)}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserPayments(result.data.payments || []);
          }
        }
      } catch (error) {
        console.error('Error fetching user payments:', error);
      }
    };

    fetchUserPayments();
  }, [userData?.email]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = depositAddresses[selectedNetwork].qrCode;
    link.download = `usdt-deposit-${selectedNetwork.toLowerCase()}.png`;
    link.click();
  };

  const shareAddress = async () => {
    const address = depositAddresses[selectedNetwork].address;
    const network = depositAddresses[selectedNetwork].network;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'USDT Deposit Address',
          text: `Deposit USDT to ${network}: ${address}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard(address);
    }
  };

  const handleVerifyDeposit = async () => {
    if (!transactionHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    setVerifying(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${baseUrl}/api/payments/deposits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          network: selectedNetwork,
          address: depositAddresses[selectedNetwork].address,
          amount: 0, // Will be updated when confirmed
          transactionHash: transactionHash.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Deposit verification submitted successfully!');
        setShowVerifyModal(false);
        setTransactionHash('');
        // Refresh user data
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to verify deposit');
      }
    } catch (error) {
      console.error('Error verifying deposit:', error);
      toast.error('Failed to verify deposit. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Payment submission function
  const onSubmitPayment = async (data: PaymentFormData) => {
    // Validate minimum amount
    if (data.amount < 50) {
      toast.error('Minimum deposit amount is 50 USDT');
      return;
    }

    setIsSubmittingPayment(true);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('amount', data.amount.toString());
      formData.append('network', data.network);
      formData.append('screenshot', data.screenshot[0]);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmittedPaymentId(result.data.id);
        setPaymentSubmitted(true);
        toast.success('Payment submitted successfully!');
        reset();
        // Refresh payments list
        const paymentsResponse = await fetch(`${baseUrl}/api/payments?email=${encodeURIComponent(data.email)}`);
        if (paymentsResponse.ok) {
          const paymentsResult = await paymentsResponse.json();
          if (paymentsResult.success) {
            setUserPayments(paymentsResult.data.payments || []);
          }
        }
      } else {
        toast.error(result.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const currentAddress = depositAddresses[selectedNetwork];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account and deposit funds</p>
        </div>

        {/* Account Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Balance</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${Number(userData.account_balance).toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${Number(userData.total_earning).toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rewards</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${Number(userData.rewards).toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit USDT Section */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Deposit USDT</h2>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Secure</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section - Payment QR Code */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Payment QR Code</h3>
              
              {/* Network Selection Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedNetwork('TRC20')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedNetwork === 'TRC20'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  TRX Tron (TRC20)
                </button>
                <button
                  onClick={() => setSelectedNetwork('BEP20')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedNetwork === 'BEP20'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  BSC BNB Smart Chain (BEP20)
                </button>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img 
                    src={currentAddress.qrCode} 
                    alt="USDT Deposit QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* Deposit Address */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <label className="block text-sm font-medium text-white mb-2">
                  {currentAddress.network} Deposit Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
                  <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                    {currentAddress.address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(currentAddress.address)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copiedAddress === currentAddress.address ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Save QR Code
                </button>
                <button
                  onClick={shareAddress}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share Address
                </button>
              </div>
            </div>

            {/* Right Section - Payment Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">Payment Information</h3>
              
              <form onSubmit={handleSubmit(onSubmitPayment)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    defaultValue={userData?.name || ''}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    defaultValue={userData?.email || ''}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Amount (USDT)
                  </label>
                  <input
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 50, message: 'Minimum amount is 50 USDT' }
                    })}
                    type="number"
                    step="0.01"
                    min="50"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-red-300 text-sm mt-1">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Network
                  </label>
                  <div className="relative">
                    <select
                      {...register('network', { required: 'Network is required' })}
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 appearance-none"
                    >
                      <option value="TRC20" className="bg-gray-800 text-white">TRX Tron (TRC20)</option>
                      <option value="BEP20" className="bg-gray-800 text-white">BSC BNB Smart Chain (BEP20)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Transaction Screenshot
                  </label>
                  <input
                    {...register('screenshot', { required: 'Screenshot is required' })}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-500 file:text-white hover:file:bg-green-600"
                  />
                  <p className="text-gray-300 text-sm mt-1">
                    Upload a screenshot of your blockchain transaction (JPG/PNG, max 5MB)
                  </p>
                  {errors.screenshot && (
                    <p className="text-red-300 text-sm mt-1">{errors.screenshot.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isSubmittingPayment ? 'Submitting Payment...' : 'Submit Payment'}
                </button>
              </form>

              {/* Additional Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-white" />
                    <span className="text-sm text-white">Minimum Deposit</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {currentAddress.minAmount} USDT
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-white" />
                    <span className="text-sm text-white">Security Verification</span>
                  </div>
                  <button 
                    onClick={() => setShowVerifyModal(true)}
                    className="text-sm text-green-400 hover:text-green-300 font-medium"
                  >
                    Verify Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        {userPayments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.amount} USDT
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.network}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.open(`/payment-status?id=${payment._id}`, '_blank')}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                Have an uncredited deposit?
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                If you've made a deposit but it hasn't appeared in your account, please contact support.
              </p>
              <button className="text-sm text-yellow-800 hover:text-yellow-900 font-medium">
                Apply for return →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Verify Deposit</h3>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter your transaction hash to verify your deposit:
              </p>
              <div className="mb-2">
                <span className="text-xs text-gray-500">Network: </span>
                <span className="text-xs font-medium text-gray-700">{currentAddress.network}</span>
              </div>
              <div className="mb-4">
                <span className="text-xs text-gray-500">Address: </span>
                <span className="text-xs font-mono text-gray-700 break-all">{currentAddress.address}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter your transaction hash..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyDeposit}
                disabled={verifying || !transactionHash.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verifying ? 'Verifying...' : 'Verify Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


