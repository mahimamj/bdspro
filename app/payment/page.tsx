'use client';

import React from 'react';

export default function PaymentPage() {
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
            <h2 className="text-2xl font-bold text-white mb-6">Payment QR Code</h2>
            <div className="bg-white p-6 rounded-2xl shadow-2xl mb-6">
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-4xl">QR</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <p className="text-sm text-blue-200 mb-2">Wallet Address:</p>
              <code className="text-white text-sm font-mono break-all">
                TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE
              </code>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg text-white placeholder-gray-300" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg text-white placeholder-gray-300" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Amount USDT</label>
                <input type="number" min="50" className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg text-white placeholder-gray-300" placeholder="50.00" />
                <p className="text-blue-200 text-xs mt-1">Minimum deposit: 50 USDT</p>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-lg font-medium transition-all">
                Submit Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
