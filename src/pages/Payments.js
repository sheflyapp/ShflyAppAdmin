import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPayments = [
      {
        _id: '1',
        consultationId: 'CONS001',
        seeker: {
          _id: '1',
          fullname: 'John Doe',
          email: 'john@example.com'
        },
        provider: {
          _id: '1',
          fullname: 'Dr. Sarah Johnson',
          email: 'sarah@example.com'
        },
        amount: 150.00,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        transactionId: 'TXN_123456789',
        gateway: 'stripe',
        fee: 4.65,
        netAmount: 145.35,
        description: 'Mental Health Consultation - Video Session',
        createdAt: '2024-01-20T10:00:00Z',
        completedAt: '2024-01-20T10:05:00Z',
        refundedAt: null,
        refundAmount: 0,
        failureReason: null
      },
      {
        _id: '2',
        consultationId: 'CONS002',
        seeker: {
          _id: '2',
          fullname: 'Emma Wilson',
          email: 'emma@example.com'
        },
        provider: {
          _id: '2',
          fullname: 'Mike Chen',
          email: 'mike@example.com'
        },
        amount: 120.00,
        currency: 'USD',
        paymentMethod: 'bank_transfer',
        status: 'pending',
        transactionId: 'TXN_123456790',
        gateway: 'stripe',
        fee: 3.20,
        netAmount: 116.80,
        description: 'Life Coaching Session - Chat',
        createdAt: '2024-01-22T14:00:00Z',
        completedAt: null,
        refundedAt: null,
        refundAmount: 0,
        failureReason: null
      },
      {
        _id: '3',
        consultationId: 'CONS003',
        seeker: {
          _id: '3',
          fullname: 'Alex Chen',
          email: 'alex@example.com'
        },
        provider: {
          _id: '3',
          fullname: 'Anna Rodriguez',
          email: 'anna@example.com'
        },
        amount: 180.00,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'failed',
        transactionId: 'TXN_123456791',
        gateway: 'stripe',
        fee: 0,
        netAmount: 0,
        description: 'Relationship Counseling - Phone Call',
        createdAt: '2024-01-25T16:00:00Z',
        completedAt: null,
        refundedAt: null,
        refundAmount: 0,
        failureReason: 'Insufficient funds'
      },
      {
        _id: '4',
        consultationId: 'CONS004',
        seeker: {
          _id: '4',
          fullname: 'Sarah Martinez',
          email: 'sarah@example.com'
        },
        provider: {
          _id: '1',
          fullname: 'Dr. Sarah Johnson',
          email: 'sarah@example.com'
        },
        amount: 150.00,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'refunded',
        transactionId: 'TXN_123456792',
        gateway: 'stripe',
        fee: 4.65,
        netAmount: 145.35,
        description: 'Mental Health Consultation - Video Session',
        createdAt: '2024-01-19T13:00:00Z',
        completedAt: '2024-01-19T13:05:00Z',
        refundedAt: '2024-01-19T14:00:00Z',
        refundAmount: 150.00,
        failureReason: null
      }
    ];
    
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.seeker.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.provider.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.consultationId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleRefundPayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      try {
        // API call would go here
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
      } catch (error) {
        toast.error('Failed to refund payment');
      }
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        // API call would go here
        setPayments(payments.filter(payment => payment._id !== paymentId));
        toast.success('Payment record deleted successfully');
      } catch (error) {
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
      completed: { 
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
      .reduce((acc, p) => acc + p.netAmount, 0);
  };

  const calculateTotalFees = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + p.fee, 0);
  };

  const calculateTotalRefunds = () => {
    return payments
      .filter(p => p.status === 'refunded')
      .reduce((acc, p) => acc + p.refundAmount, 0);
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
                {formatCurrency(calculateTotalRevenue())}
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
                {payments.filter(p => p.status === 'completed').length}
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
                {formatCurrency(calculateTotalFees())}
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
                {formatCurrency(calculateTotalRefunds())}
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
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
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
                  Gateway
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
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className={`transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {payment.seeker.fullname} → {payment.provider.fullname}
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
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      {payment.fee > 0 && (
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          Fee: {formatCurrency(payment.fee, payment.currency)}
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
                  <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span className="capitalize">{payment.gateway}</span>
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
              ))}
            </tbody>
          </table>
        </div>
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
                  }`}>{selectedPayment.seeker.fullname}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedPayment.seeker.email}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Provider</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment.provider.fullname}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedPayment.provider.email}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Amount</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
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
                  }`}>Gateway</label>
                  <p className={`text-sm transition-colors duration-300 capitalize ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedPayment.gateway}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Fee</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(selectedPayment.fee, selectedPayment.currency)}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Net Amount</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(selectedPayment.netAmount, selectedPayment.currency)}
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
                      {formatCurrency(selectedPayment.refundAmount, selectedPayment.currency)}
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

