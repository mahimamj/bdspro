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
  Gift
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

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

      const response = await fetch('/api/transactions/upload-proof', {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account and deposit funds.</p>
        </div>

        {/* Account Overview */}
        <div className="bg-gray-100 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Account Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Balance</p>
                <p className="text-xl font-semibold">$0.00 USDT</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl font-semibold">$0.00 USDT</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rewards</p>
                <p className="text-xl font-semibold">$0.00 USDT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit USDT Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Deposit USDT</h2>
            <div className="flex items-center text-green-600 text-sm">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secure</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img 
                src={generateQRCode()} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
          </div>

          {/* Network Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Network
            </label>
            <div className="relative">
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="bep20">BSC BNB Smart Chain (BEP20)</option>
                <option value="trc20">TRX Tron (TRC20)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Deposit Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getCurrentNetworkName()} Deposit Address
            </label>
            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">
                {getCurrentWalletAddress()}
              </code>
              <button
                onClick={() => copyToClipboard(getCurrentWalletAddress())}
                className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Security Verification */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">
                Deposit Address Security Verification
              </span>
              <button 
                onClick={() => setShowVerifyModal(true)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Verify Now →
              </button>
            </div>
          </div>

          {/* Minimum Deposit */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Minimum Deposit</span>
              <AlertCircle className="h-4 w-4 text-gray-400 ml-1" />
            </div>
            <span className="text-sm font-semibold text-gray-900">50 USDT</span>
          </div>

          {/* Details Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Details
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            {showDetails && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  • Only send USDT to this address<br/>
                  • Sending other cryptocurrencies may result in permanent loss<br/>
                  • Minimum deposit: 50 USDT<br/>
                  • Processing time: 5-10 minutes
                </p>
              </div>
            )}
          </div>

          {/* Upload Payment Proof */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Proof (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {uploadedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-sm text-gray-600">{uploadedFileName}</p>
                  <button
                    onClick={removeUploadedFile}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload payment screenshot
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload a screenshot of your payment for admin verification
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleSaveAsImage}
              disabled={!uploadedFile || isUploading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isUploading ? 'Saving...' : 'Save as Image'}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2 className="h-4 w-4" />
              Share Address
            </button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800">
                Have an uncredited deposit? If you've made a deposit but it hasn't appeared in your account, please contact support.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:underline mt-1">
                Apply for return →
              </button>
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