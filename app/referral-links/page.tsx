'use client';

import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Users, Link, RefreshCw, QrCode, Share2 } from 'lucide-react';

interface UserReferralLink {
  id: number;
  name: string;
  email: string;
  referralCode: string;
  referralLink: string;
  clicks: number;
  signups: number;
  linkCreatedAt: string | null;
  isGenerated: boolean;
}

export default function ReferralLinksPage() {
  const [users, setUsers] = useState<UserReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchReferralLinks = async () => {
    try {
      console.log('Fetching referral links...');
      const response = await fetch('/api/referrals/user-links');
      const data = await response.json();

      if (data.success) {
        // Use the referral codes from the database
        const usersWithDatabaseCodes = data.users.map((user: UserReferralLink) => {
          const baseUrl = 'https://bdspro-fawn.vercel.app';
          return {
            ...user,
            referralLink: `${baseUrl}/signup?ref=${user.referralCode}`
          };
        });
        
        setUsers(usersWithDatabaseCodes);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch referral links');
      }
    } catch (err) {
      console.error('Error fetching referral links:', err);
      setError('Network error while fetching referral links');
    } finally {
      setLoading(false);
    }
  };

  const generateAllLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referrals/user-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generateForAll: true }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchReferralLinks();
        alert(`Generated ${data.generatedCount} referral links!`);
      } else {
        setError(data.error || 'Failed to generate links');
      }
    } catch (err) {
      console.error('Error generating links:', err);
      setError('Network error while generating links');
    }
  };

  const copyToClipboard = async (text: string, link: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not generated';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchReferralLinks();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReferralLinks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading referral links...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Link className="h-8 w-8 mr-3 text-blue-500" />
                User Referral Links
              </h1>
              <p className="mt-2 text-gray-600">
                Unique referral links for all users - Auto-refreshes every 30 seconds
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={generateAllLinks}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Generate All Links
              </button>
              <button
                onClick={fetchReferralLinks}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {lastUpdated && (
                <p className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Link className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Generated Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isGenerated).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExternalLink className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.clicks, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Signups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.signups, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Links Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All User Referral Links</h3>
            <p className="text-sm text-gray-500">
              Click copy button to copy referral link to clipboard
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 truncate max-w-xs">
                            {user.referralLink}
                          </span>
                          <button
                            onClick={() => copyToClipboard(user.referralLink, user.referralLink)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy link"
                          >
                            {copiedLink === user.referralLink ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-4">
                          <div>
                            <span className="text-gray-500">Clicks:</span>
                            <span className="ml-1 font-medium">{user.clicks}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Signups:</span>
                            <span className="ml-1 font-medium">{user.signups}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={user.referralLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(user.referralCode, user.referralCode)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Auto-refreshing every 30 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
