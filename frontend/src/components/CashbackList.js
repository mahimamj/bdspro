import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const CashbackList = ({ onClose, cardType = 'balance' }) => {
  const [filters, setFilters] = useState({
    dateRange: 'before_06_06_2025',
    cashbackType: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  // Function to get the appropriate API call based on card type
  const getApiCall = (cardType) => {
    switch (cardType) {
      case 'balance':
        return dashboardAPI.getCashbackTransactions(filters);
      case 'earnings':
        return dashboardAPI.getTransactionHistory(filters);
      case 'level1':
        return dashboardAPI.getLevel1IncomeTransactions(filters);
      case 'level2':
        return dashboardAPI.getLevel2IncomeTransactions(filters);
      case 'business1':
        return dashboardAPI.getLevel1BusinessTransactions(filters);
      case 'business2':
        return dashboardAPI.getLevel2BusinessTransactions(filters);
      default:
        return dashboardAPI.getCashbackTransactions(filters);
    }
  };

  const { data, isLoading, error, refetch } = useQuery(
    ['transactions', cardType, filters],
    () => getApiCall(cardType),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleReset = () => {
    setFilters({
      dateRange: 'before_06_06_2025',
      cashbackType: 'all',
      search: '',
      page: 1,
      limit: 10
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'cashback':
        return <DollarSign className="w-4 h-4" />;
      case 'level1_income':
      case 'level2_income':
        return <Users className="w-4 h-4" />;
      case 'reward':
        return <TrendingUp className="w-4 h-4" />;
      case 'withdrawal':
        return <Download className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'badge-success', text: 'Completed' },
      pending: { color: 'badge-warning', text: 'Pending' },
      failed: { color: 'badge-danger', text: 'Failed' },
      cancelled: { color: 'badge-info', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.color}`}>{config.text}</span>;
  };

  if (error) {
    toast.error('Failed to load cashback data');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {cardType === 'balance' ? 'Cashback List' :
               cardType === 'earnings' ? 'Total Earnings Transactions' :
               cardType === 'level1' ? 'Level 1 Income Transactions' :
               cardType === 'level2' ? 'Level 2 Income Transactions' :
               cardType === 'business1' ? 'Level 1 Business Transactions' :
               cardType === 'business2' ? 'Level 2 Business Transactions' :
               'Transaction List'}
            </h2>
            <p className="text-gray-600 mt-1">
              {cardType === 'balance' ? 'View and filter your cashback transactions' :
               cardType === 'earnings' ? 'View and filter your total earnings transactions' :
               cardType === 'level1' ? 'View and filter your level 1 income transactions' :
               cardType === 'level2' ? 'View and filter your level 2 income transactions' :
               cardType === 'business1' ? 'View and filter your level 1 business transactions' :
               cardType === 'business2' ? 'View and filter your level 2 business transactions' :
               'View and filter your transactions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="select w-full"
              >
                <option value="before_06_06_2025">Before 06-06-2025</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Cashback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cashback Type
              </label>
              <select
                value={filters.cashbackType}
                onChange={(e) => handleFilterChange('cashbackType', e.target.value)}
                className="select w-full"
              >
                <option value="all">All Types</option>
                <option value="my_cashback">My Cashback</option>
                <option value="my_level_cashback">My Level Cashback</option>
                <option value="extra_cashback">Extra Cashback</option>
                <option value="cashback_withdrawal">Cashback Withdrawal</option>
              </select>
            </div>

            {/* Rows per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rows per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="select w-full"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search transactions..."
                  className="input pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleReset}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
            <div className="text-sm text-gray-600">
              {data?.data?.pagination && (
                <span>
                  Showing {((data.data.pagination.page - 1) * data.data.pagination.limit) + 1} to{' '}
                  {Math.min(data.data.pagination.page * data.data.pagination.limit, data.data.pagination.total)} of{' '}
                  {data.data.pagination.total} results
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Detail</th>
                <th className="table-header-cell">Credit</th>
                <th className="table-header-cell">Debit</th>
                <th className="table-header-cell">Balance</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="table-cell text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.data?.transactions?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-cell text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                data?.data?.transactions?.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {transaction.date}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <span className="ml-2">{transaction.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-700">{transaction.detail}</span>
                    </td>
                    <td className="table-cell">
                      {transaction.credit > 0 ? (
                        <span className="text-green-600 font-medium">
                          +${transaction.credit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {transaction.debit > 0 ? (
                        <span className="text-red-600 font-medium">
                          -${transaction.debit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell font-medium">
                      ${transaction.balance.toFixed(2)}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: data.data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange('page', page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    page === filters.page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === data.data.pagination.totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashbackList;
