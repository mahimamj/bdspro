'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Info } from 'lucide-react';

interface UserData {
  user_id: string;
  name: string;
  email: string;
  account_balance: number;
  total_earning: number;
  rewards: number;
}

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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

    </div>
  );
}


