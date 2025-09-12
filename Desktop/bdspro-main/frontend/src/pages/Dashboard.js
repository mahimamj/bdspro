import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import CashbackList from '../components/CashbackList';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Gift, 
  DollarSign,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, setUserAndToken } = useAuth();
  const [showCashbackList, setShowCashbackList] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCardType, setActiveCardType] = useState('balance');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const error = urlParams.get('error');

    console.log('Dashboard OAuth callback:', { token: !!token, userParam: !!userParam, error });

    if (error === 'oauth_failed') {
      toast.error('Google authentication failed. Please try again.');
      navigate('/login', { replace: true });
    } else if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        console.log('Setting user and token:', { userData, token });
        setUserAndToken(userData, token);
        toast.success('Successfully signed in with Google!');
        // Clean up URL parameters after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Error processing Google authentication. Please try again.');
        navigate('/login', { replace: true });
      }
    }
  }, [location.search, navigate, setUserAndToken]);

  // Redirect to login if not authenticated (after OAuth callback handling)
  useEffect(() => {
    // Only redirect if we're not in the middle of processing OAuth callback
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    console.log('Dashboard auth check:', { user: !!user, token: !!token, userParam: !!userParam });
    
    // Add a delay to allow OAuth processing to complete
    const timeoutId = setTimeout(() => {
      if (!user && !token && !userParam) {
        console.log('Redirecting to login - no authentication found');
      window.location.href = '/login';
    }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user, location.search]);

  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    dashboardAPI.getDashboardData,
    {
      enabled: !!user, // Only run query if user is authenticated
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true
    }
  );

  const handleCardClick = (cardType) => {
    setShowCashbackList(true);
    setActiveCardType(cardType);
  };

  const handleLogout = () => {
    logout();
  };

  if (error) {
    toast.error('Failed to load dashboard data');
  }

  // Show loading if user is not authenticated yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Account Balance',
      value: dashboardData?.data?.user?.account_balance || 0,
      icon: Wallet,
      onClick: () => handleCardClick('balance')
    },
    {
      title: 'Total Earnings',
      value: dashboardData?.data?.user?.total_earning || 0,
      icon: TrendingUp,
      onClick: () => handleCardClick('earnings')
    },
    {
      title: 'My Level 1 Income',
      value: dashboardData?.data?.network?.level1_income || 0,
      icon: Users,
      onClick: () => handleCardClick('level1')
    },
    {
      title: 'My Level 2 Income',
      value: dashboardData?.data?.network?.level2_income || 0,
      icon: Users,
      onClick: () => handleCardClick('level2')
    },
    {
      title: 'Rewards',
      value: dashboardData?.data?.user?.rewards || 0,
      icon: Gift,
      onClick: () => handleCardClick('rewards')
    },
    {
      title: 'My Level 1 Business',
      value: dashboardData?.data?.network?.level1_business || 0,
      icon: DollarSign,
      onClick: () => handleCardClick('business1')
    },
    {
      title: 'My Level 2 Business',
      value: dashboardData?.data?.network?.level2_business || 0,
      icon: DollarSign,
      onClick: () => handleCardClick('business2')
    }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, color: 'blue' },
    { id: 'account', label: 'My Account', icon: User, color: 'green' },
    { id: 'referral', label: 'My Referral', icon: Users, color: 'purple' }
  ];

  const handleSidebarClick = (itemId) => {
    if (itemId === 'account') {
      navigate('/my-account');
    } else {
      setActiveTab(itemId);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gradient">BDS PRO</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all duration-200 group ${
                activeTab === item.id
                  ? `bg-gradient-to-r from-${item.color}-100 to-${item.color}-200 text-${item.color}-800 shadow-md`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg mr-3 transition-colors ${
                activeTab === item.id
                  ? `bg-${item.color}-200`
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <item.icon className={`w-4 h-4 ${
                  activeTab === item.id
                    ? `text-${item.color}-700`
                    : 'text-gray-500 group-hover:text-gray-700'
                }`} />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
              <LogOut className="w-4 h-4 text-red-600" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-12 px-4 sm:px-6 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-600 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="pt-1 px-4 pb-4 sm:pt-1 sm:px-6 sm:pb-6 lg:pt-1 lg:px-6 lg:pb-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome section */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.name}!
                </h2>
                    <p className="text-blue-100 text-lg">
                  Here's an overview of your BDS PRO account
                </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4">
                {dashboardCards.map((card, index) => (
                  <DashboardCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    onClick={card.onClick}
                  />
                ))}
              </div>

              {/* Recent transactions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                ) : dashboardData?.data?.recentTransactions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Date</th>
                          <th className="table-header-cell">Type</th>
                          <th className="table-header-cell">Amount</th>
                          <th className="table-header-cell">Status</th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {dashboardData.data.recentTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="table-cell">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </td>
                            <td className="table-cell">
                              <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                            </td>
                            <td className="table-cell">
                              <span className={transaction.credit > 0 ? 'text-green-600' : 'text-red-600'}>
                                {transaction.credit > 0 ? '+' : ''}${transaction.amount}
                              </span>
                            </td>
                            <td className="table-cell">
                              <span className={`badge badge-${transaction.status === 'completed' ? 'success' : 'warning'}`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent transactions</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">My Account</h2>
                <p className="text-green-100">Manage your account settings and preferences</p>
              </div>

              {/* Account Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Status</p>
                      <p className="text-2xl font-bold text-green-600">Active</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-green-600 text-sm font-medium">✓ Verified Account</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-2xl font-bold text-gray-900">Jan 2024</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Gift className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">Premium Member</span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Full Name</span>
                    <span className="text-sm text-gray-900">{user?.name || 'John Doe'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Email Address</span>
                    <span className="text-sm text-gray-900">{user?.email || 'john@example.com'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Phone Number</span>
                    <span className="text-sm text-gray-900">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Account ID</span>
                    <span className="text-sm text-gray-900">#BDS{user?.user_id || '12345'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">Last Login</span>
                    <span className="text-sm text-gray-900">Today at 2:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex justify-center">
                  <button 
                    onClick={() => navigate('/my-account')}
                    className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors"
                  >
                    <div className="p-2 bg-blue-500 rounded-lg mr-3">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Deposit Funds</p>
                      <p className="text-sm text-gray-600">Add money to your account</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">My Referral Network</h2>
                <p className="text-purple-100">Track your referral network and earnings</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                      <p className="text-3xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-green-600 text-sm font-medium">+12% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Level 1 Referrals</p>
                      <p className="text-3xl font-bold text-gray-900">18</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-green-600 text-sm font-medium">+8% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Level 2 Referrals</p>
                      <p className="text-3xl font-bold text-gray-900">6</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-green-600 text-sm font-medium">+4% from last month</span>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value="https://bdspro.com/ref/12345"
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Share this link to earn referral commissions</p>
              </div>

              {/* Recent Referrals */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h3>
                <div className="space-y-3">
                  {[
                    { name: 'John Smith', email: 'john@example.com', date: '2024-01-15', level: 1, status: 'Active' },
                    { name: 'Sarah Johnson', email: 'sarah@example.com', date: '2024-01-14', level: 1, status: 'Active' },
                    { name: 'Mike Wilson', email: 'mike@example.com', date: '2024-01-13', level: 2, status: 'Pending' },
                  ].map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {referral.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{referral.name}</p>
                          <p className="text-sm text-gray-500">{referral.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Level {referral.level}</p>
                        <p className="text-xs text-gray-500">{referral.date}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          referral.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Cashback List Modal */}
      {showCashbackList && (
        <CashbackList 
          onClose={() => setShowCashbackList(false)} 
          cardType={activeCardType}
        />
      )}
    </div>
  );
};

export default Dashboard;
