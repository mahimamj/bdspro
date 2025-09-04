'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Share2, Users, TrendingUp, Gift, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReferralStats {
  level1_referrals: Array<{
    user_id: number;
    name: string;
    email: string;
    created_at: string;
    total_invested: number;
  }>;
  level2_referrals: Array<{
    user_id: number;
    name: string;
    email: string;
    created_at: string;
    total_invested: number;
  }>;
  level1_count: number;
  level2_count: number;
  total_referrals: number;
  earnings: {
    level1_earnings: number;
    level2_earnings: number;
    total_earnings: number;
  };
}

interface ReferralLink {
  referral_code: string;
  referral_link: string;
}

export default function ReferralSystem() {
  const [referralLink, setReferralLink] = useState<ReferralLink | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      // Try to fetch referral link
      try {
        const linkResponse = await fetch(`${baseUrl}/api/referrals/link`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
          setReferralLink(linkData.data);
        }
      } catch (linkError) {
        console.log('Backend not available, using demo data');
        // Use demo data if backend is not available
        setReferralLink({
          referral_code: 'BDS' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          referral_link: `${window.location.origin}/signup?ref=BDS${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        });
      }

      // Try to fetch referral stats
      try {
        const statsResponse = await fetch(`${baseUrl}/api/referrals/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setReferralStats(statsData.data);
        }
      } catch (statsError) {
        console.log('Backend not available, using demo stats');
        // Use demo data if backend is not available
        setReferralStats({
          level1_referrals: [],
          level2_referrals: [],
          level1_count: 0,
          level2_count: 0,
          total_referrals: 0,
          earnings: {
            level1_earnings: 0,
            level2_earnings: 0,
            total_earnings: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Set demo data on error
      setReferralLink({
        referral_code: 'BDS' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        referral_link: `${window.location.origin}/signup?ref=BDS${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
      setReferralStats({
        level1_referrals: [],
        level2_referrals: [],
        level1_count: 0,
        level2_count: 0,
        total_referrals: 0,
        earnings: {
          level1_earnings: 0,
          level2_earnings: 0,
          total_earnings: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareReferralLink = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BDS PRO - Investment Platform',
          text: `Join me on BDS PRO and start earning 6% monthly returns! Use my referral code: ${referralLink.referral_code}`,
          url: referralLink.referral_link
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard(referralLink.referral_link);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral System</h1>
          <p className="text-gray-600">Earn 1% from your referrals' investments (2 levels deep)</p>
        </div>

        {/* Referral Link Section */}
        {referralLink && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary-600" />
              Your Referral Link
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralLink.referral_code}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink.referral_code)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
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
                    value={referralLink.referral_link}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink.referral_link)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={shareReferralLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </button>
                <button
                  onClick={() => window.open(referralLink.referral_link, '_blank')}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {referralStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats.total_referrals}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Level 1 Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats.level1_count}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Level 2 Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{referralStats.level2_count}</p>
                </div>
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Number(referralStats.earnings.total_earnings).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* Referral Lists */}
        {referralStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Level 1 Referrals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Level 1 Referrals ({referralStats.level1_count})
              </h3>
              
              {referralStats.level1_referrals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No level 1 referrals yet</p>
              ) : (
                <div className="space-y-3">
                  {referralStats.level1_referrals.map((referral) => (
                    <div key={referral.user_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{referral.name}</p>
                          <p className="text-sm text-gray-600">{referral.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${Number(referral.total_invested).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Invested</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Level 2 Referrals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Level 2 Referrals ({referralStats.level2_count})
              </h3>
              
              {referralStats.level2_referrals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No level 2 referrals yet</p>
              ) : (
                <div className="space-y-3">
                  {referralStats.level2_referrals.map((referral) => (
                    <div key={referral.user_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{referral.name}</p>
                          <p className="text-sm text-gray-600">{referral.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${Number(referral.total_invested).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Invested</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
