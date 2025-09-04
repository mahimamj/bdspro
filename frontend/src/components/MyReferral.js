import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import { 
  Users, 
  UserPlus, 
  Copy, 
  Check,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyReferral = () => {
  const [copied, setCopied] = useState(false);

  // Get referral data
  const { data: referralData, isLoading } = useQuery(
    'referrals',
    dashboardAPI.getReferralList,
    {
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  // Get referral link
  const { data: linkData } = useQuery(
    'referral-link',
    dashboardAPI.getReferralLink
  );

  const copyReferralLink = async () => {
    if (linkData?.data?.referralLink) {
      try {
        await navigator.clipboard.writeText(linkData.data.referralLink);
        setCopied(true);
        toast.success('Referral link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('Failed to copy referral link');
      }
    }
  };

  const getReferralStats = () => {
    if (!referralData?.data) return [];
    
    const referrals = referralData.data;
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

  return (
    <div className="space-y-6">
      {/* Referral Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getReferralStats().map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Referral Link</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={linkData?.data?.referralLink || 'Loading...'}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
          />
          <button
            onClick={copyReferralLink}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this link with friends to earn referral bonuses
        </p>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Referral List</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading referrals...</p>
          </div>
        ) : referralData?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referralData.data.map((referral, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {referral.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {referral.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Level {referral.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(referral.join_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        referral.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No referrals yet</p>
            <p className="text-sm text-gray-500">
              Share your referral link to start earning bonuses
            </p>
          </div>
        )}
      </div>

      {/* Referral Benefits Info */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-primary-900 mb-4">How Referral System Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium text-primary-900">Level 1 Referrals</h4>
              <p className="text-sm text-primary-700">
                Earn 5% commission on your direct referrals' investments
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-secondary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium text-secondary-900">Level 2 Referrals</h4>
              <p className="text-sm text-secondary-700">
                Earn 2% commission on your referrals' referrals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReferral;
