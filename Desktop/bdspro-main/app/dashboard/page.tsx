"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  LogOut, 
  User, 
  Users, 
  LayoutGrid, 
  Wallet, 
  TrendingUp, 
  Gift, 
  Briefcase, 
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  Download,
  Share2,
  Shield,
  Info,
  ChevronDown,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

type StatCard = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

interface DepositAddress {
  network: string;
  address: string;
  minAmount: string;
  qrCode: string;
}

interface PaymentFormData {
  name: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  screenshot: FileList;
}

interface Payment {
  _id: string;
  name: string;
  email: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  status: 'pending' | 'paid' | 'rejected';
  createdAt: string;
  paidAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data fetching hooks - moved to top to follow Rules of Hooks
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [rows, setRows] = useState<Array<{ date: string; withdrawal_amount: number; transaction_id: string; withdrawal_from: string }>>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromFilter, setFromFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // User data state
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  
  // Payment system states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittedPaymentId, setSubmittedPaymentId] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState('BEP20');
  const [showDetails, setShowDetails] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [verifying, setVerifying] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<PaymentFormData>();

  // Cryptocurrency deposit addresses
  const depositAddresses: Record<string, DepositAddress> = {
    BEP20: {
      network: 'BSC BNB Smart Chain (BEP20)',
      address: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
      minAmount: '50',
      qrCode: '/qr-bep20.png'
    },
    TRC20: {
      network: 'TRX Tron (TRC20)',
      address: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
      minAmount: '50',
      qrCode: '/qr-trc20.png'
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for Google OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const googleAuth = urlParams.get('google_auth');
      const token = urlParams.get('token');
      const name = urlParams.get('name');
      const email = urlParams.get('email');

      if (googleAuth === 'success' && token && name && email) {
        // Handle Google OAuth callback
        try {
          const user = {
            name,
            email,
            provider: 'google'
          };
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(user));
          setIsAuthenticated(true);
          
          console.log('Google OAuth success, user authenticated:', user);
          
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing OAuth data:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Regular token check
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        router.push('/login');
        return;
      }

      try {
        console.log('Checking authentication with token:', storedToken);
        
        // Simple token validation - just check if token exists and is not empty
        if (storedToken && storedToken.length > 10) {
          console.log('Token is valid, setting authenticated');
          setIsAuthenticated(true);
        } else {
          console.error('Invalid token, redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Data fetching useEffect - moved to top to follow Rules of Hooks
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCategory) return;
      if (selectedCategory.toLowerCase() === 'rewards') return; // excluded
      try {
        setDataLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const qs = new URLSearchParams({ category: selectedCategory });
        if (fromFilter) qs.set('withdrawal_from', fromFilter);
        if (startDate) qs.set('start', startDate);
        if (endDate) qs.set('end', endDate);
        const res = await fetch(`/api/transactions/by-category?${qs.toString()}`);
        const text = await res.text();
        let json: any;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error(`Unexpected response from server (${res.status}). Check API URL.`);
        }
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load');
        setRows(json.data || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, fromFilter, startDate, endDate]);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || loading) return;
      
      try {
        setUserLoading(true);
        const token = localStorage.getItem('authToken');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        console.log('Fetching user data with token:', token ? 'present' : 'missing');
        
        const response = await fetch(`/api/dashboard/user-data`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('User data response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data received:', data);
          setUserData(data.data);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch user data:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, loading]);

  // Fetch user payments
  useEffect(() => {
    const fetchUserPayments = async () => {
      if (!userData?.email) return;
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${baseUrl}/api/payments?email=${encodeURIComponent(userData.email)}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserPayments(result.data.payments || []);
          }
        }
      } catch (error) {
        console.error('Error fetching user payments:', error);
      }
    };

    fetchUserPayments();
  }, [userData?.email]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  // Payment functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = depositAddresses[selectedNetwork].qrCode;
    link.download = `usdt-deposit-${selectedNetwork.toLowerCase()}.png`;
    link.click();
  };

  const shareAddress = async () => {
    const address = depositAddresses[selectedNetwork].address;
    const network = depositAddresses[selectedNetwork].network;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'USDT Deposit Address',
          text: `Deposit USDT to ${network}: ${address}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard(address);
    }
  };

  const onSubmitPayment = async (data: PaymentFormData) => {
    // Validate minimum amount
    if (data.amount < 50) {
      toast.error('Minimum deposit amount is 50 USDT');
      return;
    }

    setIsSubmittingPayment(true);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('amount', data.amount.toString());
      formData.append('network', data.network);
      formData.append('screenshot', data.screenshot[0]);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmittedPaymentId(result.data.id);
        setPaymentSubmitted(true);
        toast.success('Payment submitted successfully!');
        reset();
        // Refresh payments list
        const paymentsResponse = await fetch(`${baseUrl}/api/payments?email=${encodeURIComponent(data.email)}`);
        if (paymentsResponse.ok) {
          const paymentsResult = await paymentsResponse.json();
          if (paymentsResult.success) {
            setUserPayments(paymentsResult.data.payments || []);
          }
        }
      } else {
        toast.error(result.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const cards: StatCard[] = [
    { 
      title: 'Account Balance', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.account_balance || 0).toFixed(2)} USDT`, 
      icon: Wallet 
    },
    { 
      title: 'Total Earnings', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.total_earning || 0).toFixed(2)} USDT`, 
      icon: TrendingUp 
    },
    { 
      title: 'My Level 1 Income', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.level1_income || 0).toFixed(2)} USDT`, 
      icon: ArrowUpRight 
    },
    { 
      title: 'Rewards', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.rewards || 0).toFixed(2)} USDT`, 
      icon: Gift 
    },
    { 
      title: 'My Level 1 Business', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.level1_business || 0).toFixed(2)} USDT`, 
      icon: Briefcase 
    },
    { 
      title: 'My Level 2 Income', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.level2_income || 0).toFixed(2)} USDT`, 
      icon: ArrowUpRight 
    },
    { 
      title: 'My Level 2 Business', 
      value: userLoading ? 'Loading...' : `$${Number(userData?.level2_business || 0).toFixed(2)} USDT`, 
      icon: Briefcase 
    },
  ];

  const SidebarLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
    >
      {children}
    </Link>
  );

  const Card = ({ title, value, Icon, onClick }: { title: string; value: string; Icon: React.ComponentType<{ className?: string }>, onClick?: () => void }) => (
    <button onClick={onClick} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-left hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 grid place-items-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wider text-gray-500">{title.toUpperCase()}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-500">+0.00%</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2 px-2">
            <LayoutGrid className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-semibold text-gray-800">Menu</span>
          </div>
          <nav className="flex flex-col gap-1">
            <SidebarLink href="/dashboard">
              <LayoutGrid className="h-5 w-5" />
              <span>Dashboard</span>
            </SidebarLink>
            <SidebarLink href="/account">
              <User className="h-5 w-5" />
              <span>My Account</span>
            </SidebarLink>
            <SidebarLink href="/referral">
              <Users className="h-5 w-5" />
              <span>Referral and Team</span>
            </SidebarLink>
            <div className="mt-2 h-px bg-gray-200" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 transition w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back! Here's your trading overview.</p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Card
                key={c.title}
                title={c.title}
                value={c.value}
                Icon={c.icon}
                onClick={() => setSelectedCategory(c.title)}
              />
            ))}
          </div>

          {/* Payment Section */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Deposit USDT</h2>
                <p className="text-sm text-gray-500">Add funds to your account</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Secure</span>
              </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !showPaymentForm
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Quick Deposit
                </button>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    showPaymentForm
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Submit Payment
                </button>
              </div>
            </div>

            {!showPaymentForm ? (
              <>
                {/* QR Code */}
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <img 
                      src={depositAddresses[selectedNetwork].qrCode} 
                      alt="USDT Deposit QR Code"
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                </div>

                {/* Network Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Network
                  </label>
                  <div className="relative">
                    <select
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                    >
                      <option value="BEP20">BSC BNB Smart Chain (BEP20)</option>
                      <option value="TRC20">TRX Tron (TRC20)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Deposit Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {depositAddresses[selectedNetwork].network} Deposit Address
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                      {depositAddresses[selectedNetwork].address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(depositAddresses[selectedNetwork].address)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedAddress === depositAddresses[selectedNetwork].address ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Minimum Deposit */}
                <div className="mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Minimum Deposit</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {depositAddresses[selectedNetwork].minAmount} USDT
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Save as Image
                  </button>
                  <button
                    onClick={shareAddress}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Address
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Payment Form */}
                <div className="mb-6">
                  <form onSubmit={handleSubmit(onSubmitPayment)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          {...register('name', { required: 'Name is required' })}
                          type="text"
                          defaultValue={userData?.name || ''}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          type="email"
                          defaultValue={userData?.email || ''}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter your email address"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (USDT)
                        </label>
                        <input
                          {...register('amount', { 
                            required: 'Amount is required',
                            min: { value: 50, message: 'Minimum amount is 50 USDT' }
                          })}
                          type="number"
                          step="0.01"
                          min="50"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="50.00"
                        />
                        {errors.amount && (
                          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Network
                        </label>
                        <select
                          {...register('network', { required: 'Network is required' })}
                          value={selectedNetwork}
                          onChange={(e) => setSelectedNetwork(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="TRC20">TRX Tron (TRC20)</option>
                          <option value="BEP20">BSC BNB Smart Chain (BEP20)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Screenshot
                      </label>
                      <input
                        {...register('screenshot', { required: 'Screenshot is required' })}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                      />
                      <p className="text-gray-500 text-sm mt-1">
                        Upload a screenshot of your blockchain transaction (JPG/PNG, max 5MB)
                      </p>
                      {errors.screenshot && (
                        <p className="text-red-500 text-sm mt-1">{errors.screenshot.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmittingPayment ? 'Submitting Payment...' : 'Submit Payment'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Payment History Section */}
          {userPayments.length > 0 && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Payment History</h2>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Network
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.amount} USDT
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payment.network}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">{payment.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => window.open(`/payment-status?id=${payment._id}`, '_blank')}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions table */}
          {selectedCategory && selectedCategory.toLowerCase() !== 'rewards' && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">{selectedCategory}</h2>
                  <p className="text-sm text-gray-500">Transactions</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Withdrawal From</label>
                    <select
                      value={fromFilter}
                      onChange={(e) => setFromFilter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="">All</option>
                      <option value="Cashback">Cashback</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Date From</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">To</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => { /* trigger effect by toggling state noop */ setFromFilter((v) => v); }}
                      className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              {dataLoading ? (
                <p className="text-gray-600">Loading…</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : rows.length === 0 ? (
                <p className="text-gray-600">No transactions found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Amount (USDT)</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Transaction ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">From</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-800">{new Date(r.date).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">{Number(r.withdrawal_amount).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{r.transaction_id}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{r.withdrawal_from}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


