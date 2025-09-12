'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Copy, 
  Check,
  TrendingUp,
  DollarSign,
  Share2,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralData {
  referrals: Array<{
    id: number;
    name: string;
    email: string;
    level: number;
    joinedAt: string;
    totalInvested: number;
  }>;
  referralLink?: string;
  referralCode?: string;
}

export default function ReferralPage() {
  const router = useRouter();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
        return;
    }
      setIsAuthenticated(true);
      loadReferralData();
    };

    checkAuth();
  }, [router]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // First, try to get referral code from localStorage (from login response)
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user);
        console.log('Referral code from localStorage:', user.referral_code);
        
        if (user.referral_code) {
          // Use referral code from login response
          const baseUrl = 'https://bdspro-fawn.vercel.app';
          const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;
          
          const transformedData: ReferralData = {
            referrals: [], // Will be loaded separately if needed
            referralLink: referralLink,
            referralCode: user.referral_code
          };
          
          console.log('Using referral code from localStorage:', transformedData);
          setReferralData(transformedData);
          
          // Still load referral statistics from API
          await loadReferralStats(user.user_id || user.id);
          return;
        } else {
          console.log('No referral_code found in localStorage user data');
        }
      } else {
        console.log('No userData found in localStorage');
      }
      
      // Fallback: Get user ID and make API call
      let userId = localStorage.getItem('userId');
      if (!userId && userData) {
        const user = JSON.parse(userData);
        const extractedUserId = user.user_id || user.id;
        if (extractedUserId) {
          userId = extractedUserId;
          localStorage.setItem('userId', extractedUserId);
        }
      }
      
      if (!userId) {
        console.error('No user ID found');
        toast.error('Please log in to view referral data');
        router.push('/login');
        return;
      }
      
      console.log('Loading referral data for user:', userId);
      
      const response = await fetch(`/api/referrals/user-referrals?userId=${userId}`);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.success) {
        // Transform API data to match component interface
        const transformedData: ReferralData = {
          referrals: [
            ...(data.referrals.level1 || []).map((ref: any) => ({
              id: ref.id,
              name: ref.name,
              email: ref.email,
              level: 1,
              joinedAt: ref.joinedDate,
              totalInvested: parseFloat(ref.totalInvested || 0)
            })),
            ...(data.referrals.level2 || []).map((ref: any) => ({
              id: ref.id,
              name: ref.name,
              email: ref.email,
              level: 2,
              joinedAt: ref.joinedDate,
              totalInvested: parseFloat(ref.totalInvested || 0)
            }))
          ],
          referralLink: data.user.referralLink,
          referralCode: data.user.referralCode
        };
        
        console.log('Transformed data:', transformedData);
        setReferralData(transformedData);
      } else {
        console.error('API error:', data.error);
        toast.error(data.error || 'Failed to load referral data');
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast.error('Network error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadReferralStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/referrals/user-referrals?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update only the referrals data, keep the referral code from localStorage
          setReferralData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              referrals: [
                ...(data.referrals.level1 || []).map((ref: any) => ({
                  id: ref.id,
                  name: ref.name,
                  email: ref.email,
                  level: 1,
                  joinedAt: ref.joinedDate,
                  totalInvested: parseFloat(ref.totalInvested || 0)
                })),
                ...(data.referrals.level2 || []).map((ref: any) => ({
                  id: ref.id,
                  name: ref.name,
                  email: ref.email,
                  level: 2,
                  joinedAt: ref.joinedDate,
                  totalInvested: parseFloat(ref.totalInvested || 0)
                }))
              ]
            };
          });
        }
      }
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  const copyReferralLink = async () => {
    if (referralData?.referralLink) {
      try {
        await navigator.clipboard.writeText(referralData.referralLink);
        setCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy referral link');
      }
    }
  };

  const copyReferralCode = async () => {
    if (referralData?.referralCode) {
      try {
        await navigator.clipboard.writeText(referralData.referralCode);
        setCopied(true);
        toast.success('Referral code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy referral code');
      }
    }
  };

  const getReferralStats = () => {
    if (!referralData?.referrals) return [];
    
    const referrals = referralData.referrals;
    const level1Count = referrals.filter(r => r.level === 1).length;
    const level2Count = referrals.filter(r => r.level === 2).length;
    
    return [
      {
        title: 'Total Referrals',
        value: referrals.length,
        icon: Users,
        color: 'bg-blue-500'
      },
      {
        title: 'Level 1 Referrals',
        value: level1Count,
        icon: UserPlus,
        color: 'bg-green-500'
      },
      {
        title: 'Level 2 Referrals',
        value: level2Count,
        icon: TrendingUp,
        color: 'bg-purple-500'
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Referral</h1>
          <p className="text-gray-600">Track your referrals and earn commissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {getReferralStats().map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral Link Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary-600" />
            Your Referral Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralData?.referralCode || 'Loading...'}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-mono"
                />
                <button
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralData?.referralLink || 'Loading...'}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm"
                />
                <button
                  onClick={copyReferralLink}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Share this link with friends to earn referral bonuses
          </p>
        </div>

        {/* Referral List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            Your Referrals
          </h3>
          
          {referralData?.referrals && referralData.referrals.length > 0 ? (
            <div className="space-y-4">
              {referralData.referrals.map((referral) => (
                <div key={referral.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        referral.level === 1 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{referral.name}</h4>
                        <p className="text-sm text-gray-600">{referral.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(referral.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${referral.totalInvested.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Invested</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        referral.level === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        Level {referral.level}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No referrals yet</p>
              <p className="text-sm text-gray-500">Share your referral link to start earning</p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Referral System Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Share Your Link</h4>
              <p className="text-sm text-gray-600">
                Share your referral link with friends and family
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">They Invest</h4>
              <p className="text-sm text-gray-600">
                When they make an investment, you earn 1% (Level 1)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Earn More</h4>
              <p className="text-sm text-gray-600">
                When their referrals invest, you earn 1% (Level 2)
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}