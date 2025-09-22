import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import callAPI from '../services/callAPI';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Payments = () => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Default to grid view on mobile devices for better mobile experience
    return window.innerWidth < 768 ? "grid" : "table";
  }); // "table", "list", "grid"

  // Currency to display in summary cards (SAR as requested)
  const displayCurrency = 'SAR';

  // Local currency conversion rates to SAR for frontend fallbacks
  const currencyToSarRate = {
    SAR: 1,
    USD: 3.75,
    EUR: 4.1,
    GBP: 4.8,
    AED: 1.02
  };

  const toSar = (amountCents, currency) => {
    const rate = currencyToSarRate[currency] || 1;
    const amount = (Number(amountCents) || 0) / 100; // backend amounts in cents
    return amount * rate;
  };

  const fromCents = (amountCents) => (Number(amountCents) || 0) / 100;

 // Fetch payments from API
  useEffect(() => {
  fetchPayments();
}, []);

const fetchPayments = async () => {
  try {
    setLoading(true);
    const response = await callAPI.get('/api/admin/payments');
    
    if (response.data.success) {
      setPayments(response.data.data.payments || []);
      setTotals(response.data.data.totals || null);
    } else {
      toast.error('Failed to fetch payments');
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    toast.error('Failed to fetch payments');
    // Set empty array as fallback
    setPayments([]);
  } finally {
      setLoading(false);
  }
};

  const filteredPayments = payments.filter(payment => {
    const seekerName = (payment?.seeker?.fullname || '').toString();
    const providerName = (payment?.provider?.fullname || '').toString();
    const transactionId = (payment?.transactionId || '').toString();
    const consultationId = (payment?.consultationId || '').toString();

    const matchesSearch = seekerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment?.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment?.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleRefundPayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      try {
        const response = await callAPI.put(`/api/admin/payments/${paymentId}/refund`);
        
        if (response.data.success) {
        setPayments(payments.map(payment => 
          payment._id === paymentId 
            ? { 
                ...payment, 
                status: 'refunded',
                refundedAt: new Date().toISOString(),
                refundAmount: payment.amount
              }
            : payment
        ));
        toast.success('Payment refunded successfully');
        }
      } catch (error) {
        console.error('Error refunding payment:', error);
        toast.error('Failed to refund payment');
      }
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        const response = await callAPI.delete(`/api/admin/payments/${paymentId}`);
        
        if (response.data.success) {
        setPayments(payments.filter(payment => payment._id !== paymentId));
        toast.success('Payment record deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting payment:', error);
        toast.error('Failed to delete payment record');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        light: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        dark: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border border-yellow-700' },
        icon: ClockIcon 
      },
      success: { 
        light: { bg: 'bg-green-100', text: 'text-green-800' },
        dark: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border border-green-700' },
        icon: CheckCircleIcon 
      },
      failed: { 
        light: { bg: 'bg-red-100', text: 'text-red-800' },
        dark: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border border-red-700' },
        icon: XCircleIcon 
      },
      refunded: { 
        light: { bg: 'bg-gray-100', text: 'text-gray-800' },
        dark: { bg: 'bg-gray-900/30', text: 'text-gray-400', border: 'border border-gray-700' },
        icon: ArrowPathIcon 
      },
      cancelled: { 
        light: { bg: 'bg-red-100', text: 'text-red-800' },
        dark: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border border-red-700' },
        icon: XCircleIcon 
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    const theme = isDarkMode ? config.dark : config.light;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center transition-colors duration-300 ${
        isDarkMode 
          ? `${theme.bg} ${theme.text} ${theme.border}` 
          : `${theme.bg} ${theme.text}`
      }`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      credit_card: { 
        light: { bg: 'bg-blue-100', text: 'text-blue-800' },
        dark: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border border-blue-700' },
        icon: CreditCardIcon, 
        label: 'Credit Card' 
      },
      bank_transfer: { 
        light: { bg: 'bg-green-100', text: 'text-green-800' },
        dark: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border border-green-700' },
        icon: BanknotesIcon, 
        label: 'Bank Transfer' 
      },
      paypal: { 
        light: { bg: 'bg-blue-100', text: 'text-blue-800' },
        dark: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border border-blue-700' },
        icon: CreditCardIcon, 
        label: 'PayPal' 
      },
      apple_pay: { 
        light: { bg: 'bg-black', text: 'text-white' },
        dark: { bg: 'bg-gray-800', text: 'text-white', border: 'border border-gray-600' },
        icon: CreditCardIcon, 
        label: 'Apple Pay' 
      },
      google_pay: { 
        light: { bg: 'bg-green-100', text: 'text-green-800' },
        dark: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border border-green-700' },
        icon: CreditCardIcon, 
        label: 'Google Pay' 
      }
    };
    
    const config = methodConfig[method] || methodConfig.credit_card;
    const Icon = config.icon;
    const theme = isDarkMode ? config.dark : config.light;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center transition-colors duration-300 ${
        isDarkMode 
          ? `${theme.bg} ${theme.text} ${theme.border}` 
          : `${theme.bg} ${theme.text}`
      }`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateTotalRevenue = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + (p.netAmount || 0), 0);
  };

  // Deprecated in favor of SAR-based calculation

  const calculateTotalFeesSar = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + toSar(p.fee || 0, p.currency), 0);
  };

  // Deprecated in favor of SAR-based calculation

  const calculateTotalRefundsSar = () => {
    return payments
      .filter(p => p.status === 'cancelled' || p.status === 'refunded')
      .reduce((acc, p) => acc + toSar((p.refundAmount || p.amount || 0), p.currency), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 transition-colors duration-300 ${
          isDarkMode ? 'border-primary-400' : 'border-primary-600'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Payments Management</h1>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Manage all payment transactions in the system</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <CurrencyDollarIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Revenue</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency((totals?.totalAmountSar ?? fromCents(calculateTotalRevenue())), displayCurrency)}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircleIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Completed Payments</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {payments.filter(p => p.status === 'success').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <CurrencyDollarIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Fees</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency(calculateTotalFeesSar(), displayCurrency)}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <ArrowPathIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Refunds</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency((totals?.statusTotals?.cancelled?.amountSar ?? calculateTotalRefundsSar()), displayCurrency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`rounded-lg shadow-lg mb-6 transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Methods</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
                </select>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 justify-center sm:justify-start">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3zm0 6h18M3 12h18M3 18h18M9 3v18M15 3v18" />
                    </svg>
                    <span>Table</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>List</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Grid</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Views */}
        {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  S.No.
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Transaction
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Amount
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Method
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
            }`}>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <CurrencyDollarIcon className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <h3 className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>No payments found</h3>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {searchTerm || filterStatus !== 'all' || filterMethod !== 'all' 
                            ? 'Try adjusting your search or filters'
                            : 'No payment records available at the moment'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
              filteredPayments.map((payment,index) => (
                <tr key={payment._id} className={`transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                   <td className="px-6 py-4 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {(payment?.seekerId?.fullname || payment?.seekerId?.email || 'Unknown Seeker')} → {(payment?.providerId?.fullname || payment?.providerId?.email || 'Unknown Provider')}
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>{payment.consultationId}</div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`}>{payment.transactionId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(fromCents(payment.amount), payment.currency)}
                      </div>
                      {payment.fee > 0 && (
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Fee: {formatCurrency(fromCents(payment.fee), payment.currency)}
                        </div>
                      )}
                      {payment.refundAmount > 0 && (
                        <div className="text-xs text-red-500">
                          Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentMethodBadge(payment.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-1">
                      <div className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formatDateTime(payment.createdAt)}</div>
                      {payment.completedAt && (
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Completed: {formatDateTime(payment.completedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPayment(payment)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefundPayment(payment._id)}
                          className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
                          title="Refund Payment"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeletePayment(payment._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete Payment Record"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3 p-6">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No payments found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm || filterStatus !== 'all' || filterMethod !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No payment records available at the moment'
                  }
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isDarkMode 
                      ? "border-gray-700 bg-gray-800 hover:bg-gray-700" 
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      >
                        <CurrencyDollarIcon
                          className={`h-6 w-6 transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {(payment?.seeker?.fullname || 'Unknown Seeker')} → {(payment?.provider?.fullname || 'Unknown Provider')}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          {payment.transactionId}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? "text-gray-400" : "text-gray-400"
                        }`}>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-left sm:text-right">
                        <div className="mb-1">{getPaymentMethodBadge(payment.paymentMethod)}</div>
                        <div className="mb-1">{getStatusBadge(payment.status)}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          {formatCurrency(fromCents(payment.amount), payment.currency)}
                        </div>
                      </div>
                      <div className="flex justify-start sm:justify-end space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleRefundPayment(payment._id)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                            title="Refund Payment"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePayment(payment._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete Payment"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredPayments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No payments found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm || filterStatus !== 'all' || filterMethod !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No payment records available at the moment'
                  }
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div
                  key={payment._id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isDarkMode 
                      ? "border-gray-700 bg-gray-800 hover:bg-gray-700" 
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center mb-4">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300 ${
                        isDarkMode ? "bg-gray-600" : "bg-gray-300"
                      }`}
                    >
                      <CurrencyDollarIcon
                        className={`h-8 w-8 transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className={`text-lg font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {(payment?.seeker?.fullname || 'Unknown Seeker')} → {(payment?.provider?.fullname || 'Unknown Provider')}
                    </div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {payment.transactionId}
                    </div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-center">{getPaymentMethodBadge(payment.paymentMethod)}</div>
                    <div className="flex justify-center">{getStatusBadge(payment.status)}</div>
                    <div className={`text-center text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {formatCurrency(fromCents(payment.amount), payment.currency)}
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleViewPayment(payment)}
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {payment.status === 'completed' && (
                      <button
                        onClick={() => handleRefundPayment(payment._id)}
                        className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                        title="Refund Payment"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePayment(payment._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      title="Delete Payment"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className={`relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 shadow-gray-900/50' 
              : 'bg-white border-gray-300 shadow-gray-200/50'
          }`}>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Payment Details</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Transaction ID</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment.transactionId}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Consultation ID</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment.consultationId}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Seeker</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment?.seeker?.fullname || 'Unknown Seeker'}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedPayment?.seeker?.email || '—'}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Provider</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment?.provider?.fullname || 'Unknown Provider'}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedPayment?.provider?.email || '—'}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Amount</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(fromCents(selectedPayment.amount), selectedPayment.currency)}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Payment Method</label>
                  <div className="mt-1">
                    {getPaymentMethodBadge(selectedPayment.paymentMethod)}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Fee</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(fromCents(selectedPayment.fee), selectedPayment.currency)}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Net Amount</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(fromCents(selectedPayment.netAmount), selectedPayment.currency)}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Description</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment.description}</p>
                </div>
                
                {selectedPayment.failureReason && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Failure Reason</label>
                    <p className="text-sm text-red-600">{selectedPayment.failureReason}</p>
                  </div>
                )}
                
                {selectedPayment.refundAmount > 0 && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Refund Amount</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(fromCents(selectedPayment.refundAmount), selectedPayment.currency)}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Created</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatDateTime(selectedPayment.createdAt)}</p>
                </div>
                
                {selectedPayment.completedAt && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Completed</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formatDateTime(selectedPayment.completedAt)}</p>
                  </div>
                )}
                
                {selectedPayment.refundedAt && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Refunded</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formatDateTime(selectedPayment.refundedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;