'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Image, 
  Users, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Hash,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your application</p>
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Transaction Proofs */}
          <Link 
            href="/admin/transaction-proofs"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transaction Proofs</h3>
                <p className="text-gray-600">View and verify payment proofs</p>
              </div>
            </div>
          </Link>

          {/* Referrals Management */}
          <Link 
            href="/admin/referrals"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Hash className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Referral Codes</h3>
                <p className="text-gray-600">Manage referral codes and tracking</p>
              </div>
            </div>
          </Link>

          {/* Deposits Management */}
          <Link 
            href="/admin/deposits"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deposits</h3>
                <p className="text-gray-600">Manage deposits and payment verification</p>
              </div>
            </div>
          </Link>

          {/* Payment Management */}
          <Link 
            href="/admin/payments"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
                <p className="text-gray-600">Verify cryptocurrency payments</p>
              </div>
            </div>
          </Link>

          {/* Withdrawal Management */}
          <Link 
            href="/admin/withdrawals"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Withdrawal Management</h3>
                <p className="text-gray-600">Manage user withdrawal requests</p>
              </div>
            </div>
          </Link>

          {/* Users Management */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-not-allowed opacity-50">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                <p className="text-gray-600">Manage user accounts (Coming Soon)</p>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-not-allowed opacity-50">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View statistics (Coming Soon)</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-not-allowed opacity-50">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">System configuration (Coming Soon)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Pending Proofs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Verified Proofs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Rejected Proofs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
