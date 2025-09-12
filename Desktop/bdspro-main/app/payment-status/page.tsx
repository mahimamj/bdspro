'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import io from 'socket.io-client';

interface Payment {
  _id: string;
  name: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  status: 'pending' | 'paid' | 'rejected';
  paidAt?: string;
  createdAt: string;
}

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('id');
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');
    setSocket(newSocket);

    // Join payment room for real-time updates
    newSocket.emit('join-payment-room', paymentId);

    // Listen for payment status updates
    newSocket.on('payment-status-updated', (data: any) => {
      if (data.paymentId === paymentId) {
        setPayment(prev => prev ? { ...prev, status: data.status, paidAt: data.paidAt } : null);
        toast.success('Payment status updated!');
      }
    });

    // Fetch initial payment data
    fetchPayment();

    return () => {
      newSocket.disconnect();
    };
  }, [paymentId]);

  const fetchPayment = async () => {
    if (!paymentId) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const result = await response.json();

      if (result.success) {
        setPayment(result.data);
      } else {
        toast.error('Payment not found');
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      toast.error('Failed to fetch payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPayment = () => {
    fetchPayment();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-400" />;
      case 'paid':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-400" />;
      default:
        return <Clock className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Payment Under Review',
          message: 'Your payment is being reviewed by our team. We\'ll notify you once it\'s confirmed.',
          color: 'text-yellow-400'
        };
      case 'paid':
        return {
          title: 'Payment Confirmed!',
          message: 'Your payment has been successfully verified and confirmed.',
          color: 'text-green-400'
        };
      case 'rejected':
        return {
          title: 'Payment Rejected',
          message: 'Your payment was rejected. Please contact support for more information.',
          color: 'text-red-400'
        };
      default:
        return {
          title: 'Unknown Status',
          message: 'Unable to determine payment status.',
          color: 'text-gray-400'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading payment details...</div>
        </div>
      </div>
    );
  }

  if (!paymentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Payment ID</h1>
          <p className="text-gray-300">No payment ID provided in the URL.</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Not Found</h1>
          <p className="text-gray-300">The payment you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(payment.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {getStatusIcon(payment.status)}
        </div>

        {/* Status Title */}
        <h1 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
          {statusInfo.title}
        </h1>

        {/* Status Message */}
        <p className="text-gray-300 mb-6">
          {statusInfo.message}
        </p>

        {/* Payment Details */}
        <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Payment ID:</span>
            <span className="text-white font-mono text-sm">{payment._id}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Amount:</span>
            <span className="text-white font-bold">{payment.amount} USDT</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Network:</span>
            <span className="text-white">{payment.network}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={`font-medium capitalize ${statusInfo.color}`}>
              {payment.status}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Submitted:</span>
            <span className="text-white text-sm">
              {new Date(payment.createdAt).toLocaleString()}
            </span>
          </div>
          
          {payment.paidAt && (
            <div className="flex justify-between">
              <span className="text-gray-400">Confirmed:</span>
              <span className="text-white text-sm">
                {new Date(payment.paidAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={refreshPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/payment'}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Make Another Payment
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Real-time indicator */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Real-time updates enabled</span>
        </div>
      </div>
    </div>
  );
}
