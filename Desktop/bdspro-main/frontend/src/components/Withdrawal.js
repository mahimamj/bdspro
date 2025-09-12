import React from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Withdrawal = () => {
  // Get withdrawal data
  const { data: withdrawalData, isLoading } = useQuery(
    'withdrawals',
    dashboardAPI.getWithdrawalHistory,
    {
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  const getWithdrawalStats = () => {
    if (!withdrawalData?.data) return [];
    
    const withdrawals = withdrawalData.data;
    const pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + parseFloat(w.amount), 0);
    
    return [
      {
        title: 'Pending Withdrawals',
        value: pendingCount,
        icon: Clock,
        color: 'bg-yellow-500',
        change: 'pending'
      },
      {
        title: 'Total Withdrawn',
        value: `$${totalWithdrawn.toFixed(2)}`,
        icon: DollarSign,
        color: 'bg-green-500',
        change: 'completed'
      }
    ];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAddress = (address) => {
    if (address.length <= 20) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
  };

  return (
    <div className="space-y-6">
      {/* Withdrawal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getWithdrawalStats().map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="text-right">
                {stat.change === 'pending' && (
                  <div className="flex items-center text-yellow-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                )}
                {stat.change === 'completed' && (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Withdrawal History</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading withdrawal history...</p>
          </div>
        ) : withdrawalData?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawalData.data.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(withdrawal.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -${withdrawal.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatAddress(withdrawal.address)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {withdrawal.transaction_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No withdrawal requests</p>
            <p className="text-sm text-gray-500">
              You haven't made any withdrawal requests yet
            </p>
          </div>
        )}
      </div>

      {/* Withdrawal Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Withdrawal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Processing Time</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pending withdrawals are processed within 24-48 hours</li>
              <li>• Failed withdrawals are automatically refunded</li>
              <li>• You'll receive email notifications for status updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Minimum withdrawal: 10 USDT</li>
              <li>• Valid TRC20 USDT address required</li>
              <li>• Account must be fully verified</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 mb-4">Status Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pending</p>
              <p className="text-xs text-gray-500">Processing your request</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Completed</p>
              <p className="text-xs text-gray-500">Successfully processed</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Failed</p>
              <p className="text-xs text-gray-500">Request failed, refunded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
