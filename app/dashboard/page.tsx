"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Users, LayoutGrid, Wallet, TrendingUp, Gift, Briefcase, ArrowUpRight } from 'lucide-react';

type StatCard = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

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

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for Google OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('user');

      if (token && userData) {
        // Handle Google OAuth callback
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(user));
          setIsAuthenticated(true);
          
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
        const response = await fetch('http://localhost:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const qs = new URLSearchParams({ category: selectedCategory });
        if (fromFilter) qs.set('withdrawal_from', fromFilter);
        if (startDate) qs.set('start', startDate);
        if (endDate) qs.set('end', endDate);
        const res = await fetch(`${baseUrl}/api/transactions/by-category?${qs.toString()}`);
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        
        console.log('Fetching user data with token:', token ? 'present' : 'missing');
        
        const response = await fetch(`${baseUrl}/api/dashboard/user-data`, {
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
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


