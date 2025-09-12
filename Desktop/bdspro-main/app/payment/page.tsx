'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Copy, Download, Share2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// QR Code images (you'll need to generate these)
const QR_CODES = {
  TRC20: '/qr-trc20.png', // Replace with actual QR code image
  BEP20: '/qr-bep20.png'  // Replace with actual QR code image
};

const WALLET_ADDRESSES = {
  TRC20: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
  BEP20: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30'
};

interface PaymentFormData {
  name: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  screenshot: FileList;
}

export default function PaymentPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'rejected'>('pending');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<PaymentFormData>();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!');
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = QR_CODES[selectedNetwork];
    link.download = `bds-pro-${selectedNetwork.toLowerCase()}-qr.png`;
    link.click();
  };

  const shareAddress = () => {
    if (navigator.share) {
      navigator.share({
        title: 'BDS PRO Payment Address',
        text: `Pay ${selectedNetwork} to: ${WALLET_ADDRESSES[selectedNetwork]}`,
        url: window.location.href
      });
    } else {
      copyToClipboard(WALLET_ADDRESSES[selectedNetwork]);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('amount', data.amount.toString());
      formData.append('network', data.network);
      formData.append('screenshot', data.screenshot[0]);

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPaymentId(result.data.id);
        toast.success('Payment submitted successfully!');
      } else {
        toast.error(result.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (paymentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            {paymentStatus === 'pending' && (
              <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            )}
            {paymentStatus === 'paid' && (
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            )}
            {paymentStatus === 'rejected' && (
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-white mb-2">
              {paymentStatus === 'pending' && 'Payment Submitted'}
              {paymentStatus === 'paid' && 'Payment Confirmed!'}
              {paymentStatus === 'rejected' && 'Payment Rejected'}
            </h2>
            <p className="text-gray-300">
              {paymentStatus === 'pending' && 'Your payment is under review. We\'ll notify you once it\'s confirmed.'}
              {paymentStatus === 'paid' && 'Your payment has been successfully verified and confirmed.'}
              {paymentStatus === 'rejected' && 'Your payment was rejected. Please contact support for more information.'}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">Payment ID</p>
            <p className="text-white font-mono text-sm">{paymentId}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Make Another Payment
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white text-center">Deposit USDT</h1>
          <p className="text-gray-300 text-center mt-2">Secure cryptocurrency payment gateway</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Payment QR Code</h2>
            
            {/* Network Selection */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setSelectedNetwork('TRC20')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedNetwork === 'TRC20'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                TRX Tron (TRC20)
              </button>
              <button
                onClick={() => setSelectedNetwork('BEP20')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedNetwork === 'BEP20'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                BSC BNB Smart Chain (BEP20)
              </button>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={QR_CODES[selectedNetwork]}
                  alt={`${selectedNetwork} QR Code`}
                  className="w-64 h-64 mx-auto"
                  onError={(e) => {
                    // Fallback to a placeholder if QR code image doesn't exist
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
                        <rect width="256" height="256" fill="white"/>
                        <text x="128" y="128" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
                          QR Code for ${selectedNetwork}
                        </text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {selectedNetwork} Deposit Address
                </span>
                <button
                  onClick={() => copyToClipboard(WALLET_ADDRESSES[selectedNetwork])}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white font-mono text-sm break-all">
                {WALLET_ADDRESSES[selectedNetwork]}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={downloadQR}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Save as Image</span>
              </button>
              <button
                onClick={shareAddress}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Address</span>
              </button>
            </div>

            {/* Security Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Minimum Deposit</span>
                <span className="text-white">50 USDT</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Network Fee</span>
                <span className="text-white">~1-5 USDT</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Network
                </label>
                <select
                  {...register('network', { required: 'Network is required' })}
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value as 'TRC20' | 'BEP20')}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="TRC20">TRX Tron (TRC20)</option>
                  <option value="BEP20">BSC BNB Smart Chain (BEP20)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Screenshot
                </label>
                <input
                  {...register('screenshot', { required: 'Screenshot is required' })}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Upload a screenshot of your blockchain transaction (JPG/PNG, max 5MB)
                </p>
                {errors.screenshot && (
                  <p className="text-red-400 text-sm mt-1">{errors.screenshot.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting Payment...' : 'Submit Payment'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-200 text-sm">
                <strong>Important:</strong> Make sure to send the exact amount and use the correct network. 
                Double-check the wallet address before sending your transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
