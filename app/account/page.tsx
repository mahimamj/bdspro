'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ExternalLink
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

  // Cryptocurrency deposit addresses
  const depositAddresses: Record<string, DepositAddress> = {
    BEP20: {
      network: 'BSC BNB Smart Chain (BEP20)',
      address: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
      minAmount: '0.01',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=0xdfca28ad998742570aecb7ffde1fe564b7d42c30`
    },
    TRC20: {
      network: 'TRX Tron (TRC20)',
      address: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
      minAmount: '0.01',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt`
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        
        const response = await fetch(`${baseUrl}/api/dashboard/user-data`, {
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Deposit USDT</h2>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Secure</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
              <img 
                src={currentAddress.qrCode} 
                alt="USDT Deposit QR Code"
                className="w-64 h-64 mx-auto"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                <option value="BEP20">BSC BNB Smart Chain (BEP20)</option>
                <option value="TRC20">TRX Tron (TRC20)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Deposit Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentAddress.network} Deposit Address
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                {currentAddress.address}
              </code>
              <button
                onClick={() => copyToClipboard(currentAddress.address)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copiedAddress === currentAddress.address ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Security Verification */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700">Deposit Address Security Verification</span>
              </div>
              <button 
                onClick={() => setShowVerifyModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Verify Now →
              </button>
            </div>
          </div>

          {/* Minimum Deposit */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Minimum Deposit</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {currentAddress.minAmount} USDT
              </span>
            </div>
          </div>

          {/* Details Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <span>Details</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            
            {showDetails && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Only send USDT to this address</p>
                  <p>• Deposits are processed automatically</p>
                  <p>• Minimum deposit: {currentAddress.minAmount} USDT</p>
                  <p>• Network: {currentAddress.network}</p>
                  <p>• Do not send other cryptocurrencies to this address</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadQRCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Save as Image
            </button>
            <button
              onClick={shareAddress}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Share Address
            </button>
          </div>
        </div>

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


