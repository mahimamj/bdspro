'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Upload,
  Shield, 
  AlertCircle,
  ChevronDown,
  Share2,
  Save,
  Gift,
  DollarSign,
  BarChart3
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

export default function MyAccountPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('bep20');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [showAmountWarning, setShowAmountWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    loadPaymentMethods();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/dashboard/user-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
      } else {
        console.error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value);
    if (numValue > 0 && numValue < 50) {
      setShowAmountWarning(true);
    } else {
      setShowAmountWarning(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (JPG/PNG)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      toast.success('File selected successfully');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
    // Reset the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setPaymentMethods([
        {
          id: 'trc20',
          name: 'USDT (TRC20)',
          description: 'Tether USD on TRON network',
          minAmount: 50,
          estimatedTime: '5-10 minutes',
          walletAddress: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
          network: 'TRON (TRC20)'
        },
        {
          id: 'bep20',
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

  const getCurrentWalletAddress = () => {
    const method = paymentMethods.find(m => m.id === selectedNetwork);
    return method?.walletAddress || '';
  };

  const getCurrentNetworkName = () => {
    const method = paymentMethods.find(m => m.id === selectedNetwork);
    return method?.network || '';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Address copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setUploadedFile(file);
      setUploadedFileName(file.name);
      toast.success('Payment proof uploaded successfully!');
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateQRCode = () => {
    const address = getCurrentWalletAddress();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
  };

  const handleVerifyDeposit = () => {
    if (!transactionHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    // Mock verification - replace with actual API call
    toast.success('Deposit verification submitted! Admin will review your transaction.');
    setShowVerifyModal(false);
    setTransactionHash('');
  };

  const closeVerifyModal = () => {
    setShowVerifyModal(false);
    setTransactionHash('');
  };

  const handleSaveAsImage = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a payment proof image first');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('transactionHash', transactionHash || '');
      formData.append('amount', '50'); // Default amount for now
      formData.append('referrerId', ''); // Will be fetched from user data

      // Get user email from state or prompt user
      if (!userEmail) {
        const email = prompt('Enter your email address:');
        if (!email) {
          alert('Email is required to upload payment proof');
          return;
        }
        setUserEmail(email);
      }
      
      formData.append('userEmail', userEmail);
      
      const response = await fetch('/api/upload-realtime', {
        method: 'POST',
        body: formData,
      });

        const data = await response.json();

      if (data.success) {
        setShowSaveModal(true);
        toast.success('Transaction proof saved successfully!');
        
        // Reset form
        setUploadedFile(null);
        setUploadedFileName('');
        setTransactionHash('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(data.error || 'Failed to save transaction proof');
      }
    } catch (error) {
      console.error('Error saving transaction proof:', error);
      toast.error('Failed to save transaction proof');
    } finally {
      setIsUploading(false);
    }
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const handleDeposit = async () => {
    if (!userEmail) {
      toast.error('Please enter your email address first');
      return;
    }

    if (!uploadedFile) {
      toast.error('Please upload a payment proof image first');
      return;
    }

    if (!transactionHash) {
      toast.error('Please enter the transaction hash');
      return;
    }

    setIsUploading(true);
    try {
      // First, get user ID from email
      const userResponse = await fetch(`/api/users/by-email?email=${encodeURIComponent(userEmail)}`);
      const userData = await userResponse.json();
      
      if (!userData.success || !userData.user) {
        toast.error('User not found. Please check your email address.');
        return;
      }

      const userId = userData.user.user_id;
      const selectedMethod = paymentMethods.find(method => method.id === selectedNetwork);
      
      if (!selectedMethod) {
        toast.error('Invalid payment method selected');
        return;
      }

      // Create deposit record
      const depositResponse = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          amount: 50, // Minimum deposit amount
          payment_method: selectedMethod.id,
          wallet_address: selectedMethod.walletAddress,
          transaction_hash: transactionHash,
          payment_proof_url: uploadedFile ? `/uploads/${uploadedFile.name}` : null
        }),
      });

      const depositData = await depositResponse.json();

      if (depositData.success) {
        toast.success('Deposit submitted successfully! Admin will verify your payment.');
        
        // Reset form
        setUploadedFile(null);
        setUploadedFileName('');
        setTransactionHash('');
        setUserEmail('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(depositData.error || 'Failed to submit deposit');
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
      toast.error('Failed to submit deposit');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-blue-200">Manage your account and deposit funds.</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment QR Code */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">Payment QR Code</h2>
            
            {/* Network Selection Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setSelectedNetwork('trc20')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedNetwork === 'trc20'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                TRX Tron (TRC20)
              </button>
              <button
                onClick={() => setSelectedNetwork('bep20')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedNetwork === 'bep20'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                BSC BNB Smart Chain (BEP20)
              </button>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-lg">
                <img 
                  src={generateQRCode()} 
                  alt="QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
            </div>

            {/* Deposit Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                {getCurrentNetworkName()} Deposit Address
              </label>
              <div className="flex items-center bg-white/20 p-3 rounded-lg">
                <code className="flex-1 text-sm font-mono text-white break-all">
                  {getCurrentWalletAddress()}
                </code>
                <button
                  onClick={() => copyToClipboard(getCurrentWalletAddress())}
                  className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                <Save className="h-4 w-4" />
                Save as Image
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                <Share2 className="h-4 w-4" />
                Share Address
              </button>
            </div>

            {/* Payment Details */}
            <div className="space-y-2 text-white">
              <div className="flex justify-between">
                <span className="text-sm">Minimum Deposit:</span>
                <span className="text-sm font-semibold">50 USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Network Fee:</span>
                <span className="text-sm font-semibold">~1-5 USDT</span>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-6">Payment Information</h2>
            
            <form className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Amount (USDT)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showAmountWarning && (
                  <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-200">
                      <strong>Warning:</strong> Minimum deposit is 50 USDT. Amounts below 50 USDT will not be processed.
                    </p>
                  </div>
                )}
              </div>

              {/* Network */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Network
                </label>
                <select className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="trc20" className="bg-gray-800">TRX Tron (TRC20)</option>
                  <option value="bep20" className="bg-gray-800">BSC BNB Smart Chain (BEP20)</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Transaction Screenshot
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                      <p className="text-sm text-white font-medium">{fileName}</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={removeFile}
                          className="px-3 py-1 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                        >
                          Change File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 text-white/70 mx-auto mb-2" />
                      <p className="text-sm text-white/70 mb-2">
                        Upload a screenshot of your blockchain transaction
                      </p>
                      <p className="text-xs text-white/50 mb-4">
                        (JPG/PNG, max 5MB)
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={parseFloat(amount) < 50}
                className={`w-full py-4 rounded-lg font-medium transition-all transform ${
                  parseFloat(amount) < 50
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                }`}
              >
                {parseFloat(amount) < 50 ? 'Minimum 50 USDT Required' : 'Submit Payment'}
              </button>
            </form>

            {/* Important Notice */}
            <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                <strong>Important:</strong> Make sure to send the exact amount and use the correct network. Double-check the wallet address before sending your transaction.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Verify Deposit Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Verify Deposit</h3>
              <button
                onClick={closeVerifyModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your transaction hash to verify your deposit:
              </p>

              {/* Network Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Network:
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {getCurrentNetworkName()}
                </p>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address:
                </label>
                <p className="text-sm text-gray-900 font-mono break-all">
                  {getCurrentWalletAddress()}
                </p>
            </div>

              {/* Transaction Hash Input */}
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter your transaction hash..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeVerifyModal}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyDeposit}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Verify Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Saved</h3>
            <p className="text-gray-600 mb-6">
              Your transaction proof has been saved successfully! Admin will review your payment.
            </p>
            <button
              onClick={closeSaveModal}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}