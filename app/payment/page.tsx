'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { 
  QrCode, 
  Copy, 
  Check, 
  Upload, 
  DollarSign, 
  Shield, 
  Clock,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';

// Validation schema with proper TypeScript types
const paymentSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  amount: yup.number()
    .min(50, 'Minimum deposit is 50 USDT')
    .required('Amount is required'),
  network: yup.string().required('Network selection is required'),
  transactionScreenshot: yup.mixed()
    .required('Transaction screenshot is required')
    .test('fileSize', 'File size must be less than 5MB', (value: FileList | File[] | null) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only JPG and PNG files are allowed', (value: FileList | File[] | null) => {
      if (!value || value.length === 0) return true;
      return ['image/jpeg', 'image/png'].includes(value[0].type);
    })
});

interface PaymentFormData {
  fullName: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  transactionScreenshot: FileList;
}

const PaymentPage = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      network: 'TRC20'
    }
  });

  // Wallet addresses
  const walletAddresses = {
    TRC20: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
    BEP20: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30'
  };

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      const address = walletAddresses[selectedNetwork];
      const qrData = ethereum:?amount=&token=USDT;
      setQrCodeUrl(qrData);
    };
    generateQR();
  }, [selectedNetwork, watch('amount')]);

  // Copy address to clipboard
  const copyAddress = async () => {
    const address = walletAddresses[selectedNetwork];
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  // Handle form submission
  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('amount', data.amount.toString());
      formData.append('network', data.network);
      formData.append('transactionScreenshot', data.transactionScreenshot[0]);

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Payment submitted successfully!');
        window.location.reload();
      } else {
        toast.error(result.message || 'Payment submission failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Cryptocurrency Payment
          </h1>
          <p className="text-blue-200 text-lg">
            Secure USDT payment with real-time verification
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <QrCode className="mr-3" />
              Payment QR Code
            </h2>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setSelectedNetwork('TRC20');
                  setValue('network', 'TRC20');
                }}
                className={px-6 py-3 rounded-lg font-semibold transition-all }
              >
                TRC20
              </button>
              <button
                onClick={() => {
                  setSelectedNetwork('BEP20');
                  setValue('network', 'BEP20');
                }}
                className={px-6 py-3 rounded-lg font-semibold transition-all }
              >
                BEP20
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 mb-6 shadow-2xl">
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
                <p className="text-gray-500 text-sm">QR Code will appear here</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white/80 text-sm mb-2">Wallet Address:</p>
              <div className="flex items-center gap-2">
                <code className="text-white text-sm font-mono break-all">
                  {walletAddresses[selectedNetwork]}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Save QR Code
              </button>
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share Address
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <DollarSign className="mr-3" />
              Payment Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  {...register('fullName')}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Amount USDT
                </label>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  min="50"
                  step="0.01"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="50.00"
                />
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Network
                </label>
                <select
                  {...register('network')}
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="TRC20" className="bg-gray-800">TRC20</option>
                  <option value="BEP20" className="bg-gray-800">BEP20</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-semibold mb-2">
                  Transaction Screenshot
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/80 text-sm mb-2">
                    Upload your transaction screenshot
                  </p>
                  <p className="text-white/60 text-xs">
                    JPG or PNG, max 5MB
                  </p>
                  <input
                    {...register('transactionScreenshot')}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="inline-block mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
                {errors.transactionScreenshot && (
                  <p className="text-red-400 text-sm mt-1">{errors.transactionScreenshot.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Important Information</h3>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Minimum deposit: 50 USDT</li>
                    <li>• Only send USDT to the provided address</li>
                    <li>• Include transaction screenshot for verification</li>
                    <li>• Processing time: 5-15 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
