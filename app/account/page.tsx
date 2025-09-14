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
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [hashPassword, setHashPassword] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Withdrawal state
  const [withdrawalNetwork, setWithdrawalNetwork] = useState<string>('TRC20');
  const [withdrawalHash, setWithdrawalHash] = useState<string>('');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalUid, setWithdrawalUid] = useState<string>('');
  const [withdrawalEmail, setWithdrawalEmail] = useState<string>('');

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
    // Clear amount error when user types
    if (formErrors.amount) {
      setFormErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!hashPassword.trim()) {
      errors.hashPassword = 'Hash password is required';
    } else if (hashPassword.length < 6) {
      errors.hashPassword = 'Hash password must be at least 6 characters';
    }
    
    if (!amount || parseFloat(amount) < 50) {
      errors.amount = 'Minimum deposit is 50 USDT';
    }
    
    if (!selectedFile) {
      errors.file = 'Please upload a transaction screenshot';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    // Clear file error when file is removed
    if (formErrors.file) {
      setFormErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleSaveAsImage = async () => {
    try {
      // Show loading message
      toast.loading('Generating QR code image...', { id: 'save-image' });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error('Unable to generate image - Canvas not supported');
        return;
      }

      // Set canvas size
      canvas.width = 400;
      canvas.height = 500;

      // Create background
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BDS PRO Payment QR Code', canvas.width / 2, 40);

      // Add network info
      ctx.font = '16px Arial';
      ctx.fillText(getCurrentNetworkName(), canvas.width / 2, 70);

      // Try to load and draw QR code image
      try {
        const qrCodeImg = new Image();
        qrCodeImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          qrCodeImg.onload = () => {
            console.log('QR code image loaded successfully');
            resolve(true);
          };
          qrCodeImg.onerror = (error) => {
            console.error('Failed to load QR code image:', error);
            reject(new Error('Failed to load QR code image'));
          };
          
          qrCodeImg.src = generateQRCode();
          
          setTimeout(() => {
            reject(new Error('QR code image load timeout'));
          }, 8000);
        });

        // Draw QR code
        ctx.drawImage(qrCodeImg, 100, 100, 200, 200);
      } catch (qrError) {
        console.warn('QR code image failed to load, using fallback:', qrError);
        
        // Fallback: Draw a placeholder QR code area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(100, 100, 200, 200);
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', 200, 180);
        ctx.fillText('(Click to scan)', 200, 200);
        ctx.fillText('in your wallet app', 200, 220);
      }

      // Add wallet address
      ctx.font = '12px monospace';
      ctx.fillText('Wallet Address:', canvas.width / 2, 320);
      ctx.fillText(getCurrentWalletAddress(), canvas.width / 2, 340);

      // Add minimum deposit info
      ctx.font = '14px Arial';
      ctx.fillText('Minimum Deposit: 50 USDT', canvas.width / 2, 380);
      ctx.fillText('Network Fee: ~1-5 USDT', canvas.width / 2, 400);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bds-pro-payment-qr-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('QR Code saved as image!', { id: 'save-image' });
        } else {
          toast.error('Failed to generate image blob', { id: 'save-image' });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save image', { id: 'save-image' });
    }
  };

  const handleShareAddress = async () => {
    try {
      const shareData = {
        title: 'BDS PRO Payment Address',
        text: `Send USDT to this address: ${getCurrentWalletAddress()}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Address shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `BDS PRO Payment Address\nNetwork: ${getCurrentNetworkName()}\nAddress: ${getCurrentWalletAddress()}\nMinimum Deposit: 50 USDT`
        );
        toast.success('Address copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing address:', error);
      toast.error('Failed to share address');
    }
  };

  const handleSubmitPayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    if (!selectedFile) {
      toast.error('Please upload a transaction screenshot');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('amount', amount);
      formData.append('hashPassword', hashPassword);
      formData.append('network', selectedNetwork);
      formData.append('walletAddress', getCurrentWalletAddress());

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment submitted successfully! Admin will review your transaction.');
        
        // Reset form
        setFullName('');
        setEmail('');
        setAmount('');
        setHashPassword('');
        setSelectedFile(null);
        setFileName('');
        setFormErrors({});
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        toast.error(data.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    } finally {
      setIsUploading(false);
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

  const handleWithdrawalSubmit = async () => {
    if (!withdrawalHash.trim() || !withdrawalUid.trim() || !withdrawalEmail.trim() || !withdrawalAmount || parseFloat(withdrawalAmount) < 10) {
      toast.error('Please fill in all required fields (minimum 10 USDT)');
      return;
    }

    if (!userData?.user_id) {
      toast.error('User data not found. Please refresh the page.');
      return;
    }

    try {
      const response = await fetch('/api/withdrawals/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.user_id,
          email: withdrawalEmail,
          network: withdrawalNetwork,
          transactionHash: withdrawalHash,
          transactionUid: withdrawalUid,
          amount: parseFloat(withdrawalAmount),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Withdrawal request submitted successfully! It will be processed within 60 minutes.');
        setWithdrawalHash('');
        setWithdrawalUid('');
        setWithdrawalEmail('');
        setWithdrawalAmount('');
        setWithdrawalNetwork('TRC20');
      } else {
        toast.error(result.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
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
              <button 
                onClick={handleSaveAsImage}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save as Image
              </button>
              <button 
                onClick={handleShareAddress}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
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

            {/* Withdrawal Section */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Withdrawal Request</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Payment Network *</label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setWithdrawalNetwork('TRC20')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        withdrawalNetwork === 'TRC20'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      TRC20 (Tron)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawalNetwork('BEP20')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        withdrawalNetwork === 'BEP20'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      BEP20 (BSC)
                    </button>
            </div>
          </div>

                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Transaction Hash *</label>
                  <input
                    type="text"
                    value={withdrawalHash}
                    onChange={(e) => setWithdrawalHash(e.target.value)}
                    placeholder="Enter your transaction hash"
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Transaction UID *</label>
                  <input
                    type="text"
                    value={withdrawalUid}
                    onChange={(e) => setWithdrawalUid(e.target.value)}
                    placeholder="Enter transaction UID"
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={withdrawalEmail}
                    onChange={(e) => setWithdrawalEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Withdrawal Amount (USDT) *</label>
                  <input
                    type="number"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="Enter withdrawal amount"
                    min="10"
                    step="0.01"
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Withdrawal Process:</strong> Your withdrawal will be processed within 60 minutes to your account. Please ensure the transaction hash is correct and matches the selected network.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleWithdrawalSubmit}
                  disabled={!withdrawalHash || !withdrawalUid || !withdrawalEmail || !withdrawalAmount || parseFloat(withdrawalAmount) < 10}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Withdrawal Request
                </button>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formErrors.fullName) {
                      setFormErrors(prev => ({ ...prev, fullName: '' }));
                    }
                  }}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.fullName ? 'border-red-500' : 'border-white/30'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.fullName}</p>
            )}
          </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address *
            </label>
            <input
              type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
              placeholder="Enter your email address"
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.email ? 'border-red-500' : 'border-white/30'
                  }`}
            />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.email}</p>
                )}
          </div>

              {/* Hash Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hash Password *
            </label>
            <input
              type="password"
                  value={hashPassword}
                  onChange={(e) => {
                    setHashPassword(e.target.value);
                    if (formErrors.hashPassword) {
                      setFormErrors(prev => ({ ...prev, hashPassword: '' }));
                    }
                  }}
              placeholder="Enter your hash password"
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.hashPassword ? 'border-red-500' : 'border-white/30'
                  }`}
            />
                {formErrors.hashPassword && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.hashPassword}</p>
                )}
          </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Amount (USDT) *
            </label>
            <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.amount ? 'border-red-500' : 'border-white/30'
                  }`}
                />
                {formErrors.amount && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.amount}</p>
                )}
                {showAmountWarning && !formErrors.amount && (
                  <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-200">
                      <strong>Warning:</strong> Minimum deposit is 50 USDT. Amounts below 50 USDT will not be processed.
                    </p>
                  </div>
                )}
          </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Transaction Screenshot *
            </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  formErrors.file ? 'border-red-500' : 'border-white/30'
                }`}>
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
                {formErrors.file && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.file}</p>
                )}
          </div>

              {/* Submit Button */}
            <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (validateForm()) {
                    handleSubmitPayment();
                  }
                }}
                disabled={isUploading}
                className={`w-full py-4 rounded-lg font-medium transition-all transform ${
                  isUploading
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                }`}
              >
                {isUploading ? 'Submitting...' : 'Submit Payment'}
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