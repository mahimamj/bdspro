'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import InvestmentPlans from '@/components/InvestmentPlans';
import PremiumRewards from '@/components/PremiumRewards';
import Community from '@/components/Community';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const handleAdminClick = () => {
    setShowAdminModal(true);
    setAdminPassword('');
    setPasswordError('');
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'bdspro@77$$') {
      setShowAdminModal(false);
      router.push('/admin');
    } else {
      setPasswordError('Only admin can access');
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setAdminPassword('');
    setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BDS PRO
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-700 hover:text-blue-500 font-medium">Features</a>
              <a href="#plans" className="text-gray-700 hover:text-blue-500 font-medium">Plans</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-500 font-medium">Contact</a>
              <a href="/deposits" className="text-gray-700 hover:text-blue-500 font-medium">Live Deposits</a>
              <a href="/referral-links" className="text-gray-700 hover:text-blue-500 font-medium">Referral Links</a>
              <button 
                onClick={handleAdminClick}
                className="text-gray-700 hover:text-red-500 font-medium"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="pt-16">
        <Hero />
        <Features />
        <InvestmentPlans />
        <PremiumRewards />
        <Community />
        <Contact />
      </main>
      
      <Footer />

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Access</h3>
              <p className="text-gray-600">Enter admin password to access the admin panel</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter admin password"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAdminModal}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Access Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
