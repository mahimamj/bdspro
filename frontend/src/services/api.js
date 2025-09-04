import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  demoLogin: (email) => api.post('/auth/demo-login', { email }),
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard/demo/data'),
  getCashbackTransactions: (params) => api.get('/dashboard/demo/cashback', { params }),
  getTransactionHistory: (params) => api.get('/dashboard/demo/history', { params }),
  getLevel1IncomeTransactions: (params) => api.get('/dashboard/demo/level1-income', { params }),
  getLevel2IncomeTransactions: (params) => api.get('/dashboard/demo/level2-income', { params }),
  getLevel1BusinessTransactions: (params) => api.get('/dashboard/demo/level1-business', { params }),
  getLevel2BusinessTransactions: (params) => api.get('/dashboard/demo/level2-business', { params }),
};

// Transactions API
export const transactionsAPI = {
  createDeposit: (data) => api.post('/transactions/deposit', data),
  createWithdrawal: (data) => api.post('/transactions/withdrawal', data),
  getWithdrawalRequests: (params) => api.get('/transactions/withdrawals', { params }),
  updateWithdrawalStatus: (transactionId, status) => 
    api.patch(`/transactions/withdrawals/${transactionId}/status`, { status }),
};

export default api;
