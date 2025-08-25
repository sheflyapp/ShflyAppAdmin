import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Consultations = () => {
  const { isDarkMode } = useTheme();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockConsultations = [
      {
        _id: '1',
        seeker: {
          _id: '1',
          fullname: 'John Doe',
          email: 'john@example.com'
        },
        provider: {
          _id: '1',
          fullname: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',
          specialization: 'Mental Health'
        },
        category: 'Mental Health',
        type: 'video',
        status: 'completed',
        price: 150,
        duration: 60,
        scheduledAt: '2024-01-20T10:00:00Z',
        completedAt: '2024-01-20T11:00:00Z',
        paymentStatus: 'paid',
        rating: 5,
        review: 'Excellent session, very helpful insights.',
        createdAt: '2024-01-18T15:30:00Z'
      },
      {
        _id: '2',
        seeker: {
          _id: '2',
          fullname: 'Emma Wilson',
          email: 'emma@example.com'
        },
        provider: {
          _id: '2',
          fullname: 'Mike Chen',
          email: 'mike@example.com',
          specialization: 'Life Coaching'
        },
        category: 'Life Coaching',
        type: 'chat',
        status: 'active',
        price: 120,
        duration: 45,
        scheduledAt: '2024-01-22T14:00:00Z',
        completedAt: null,
        paymentStatus: 'paid',
        rating: null,
        review: null,
        createdAt: '2024-01-20T09:15:00Z'
      },
      {
        _id: '3',
        seeker: {
          _id: '3',
          fullname: 'Alex Chen',
          email: 'alex@example.com'
        },
        provider: {
          _id: '3',
          fullname: 'Anna Rodriguez',
          email: 'anna@example.com',
          specialization: 'Relationship Counseling'
        },
        category: 'Relationship Counseling',
        type: 'call',
        status: 'scheduled',
        price: 180,
        duration: 90,
        scheduledAt: '2024-01-25T16:00:00Z',
        completedAt: null,
        paymentStatus: 'pending',
        rating: null,
        review: null,
        createdAt: '2024-01-22T11:45:00Z'
      },
      {
        _id: '4',
        seeker: {
          _id: '4',
          fullname: 'Sarah Martinez',
          email: 'sarah@example.com'
        },
        provider: {
          _id: '1',
          fullname: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',
          specialization: 'Mental Health'
        },
        category: 'Mental Health',
        type: 'video',
        status: 'cancelled',
        price: 150,
        duration: 60,
        scheduledAt: '2024-01-19T13:00:00Z',
        completedAt: null,
        paymentStatus: 'refunded',
        rating: null,
        review: null,
        createdAt: '2024-01-17T14:20:00Z'
      }
    ];
    
    setTimeout(() => {
      setConsultations(mockConsultations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.seeker.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.provider.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    const matchesType = filterType === 'all' || consultation.type === filterType;
    const matchesCategory = filterCategory === 'all' || consultation.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  const categories = [...new Set(consultations.map(c => c.category))];

  const handleViewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  const handleUpdateStatus = async (consultationId, newStatus) => {
    try {
      // API call would go here
      setConsultations(consultations.map(consultation => 
        consultation._id === consultationId 
          ? { ...consultation, status: newStatus }
          : consultation
      ));
      toast.success(`Consultation status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update consultation status');
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (window.confirm('Are you sure you want to delete this consultation?')) {
      try {
        // API call would go here
        setConsultations(consultations.filter(consultation => consultation._id !== consultationId));
        toast.success('Consultation deleted successfully');
      } catch (error) {
        toast.error('Failed to delete consultation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { 
        light: { bg: 'bg-blue-100', text: 'text-blue-800' },
        dark: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border border-blue-700' },
        label: 'Scheduled' 
      },
      active: { 
        light: { bg: 'bg-green-100', text: 'text-green-800' },
        dark: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border border-green-700' },
        label: 'Active' 
      },
      completed: { 
        light: { bg: 'bg-purple-100', text: 'text-purple-800' },
        dark: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border border-purple-700' },
        label: 'Completed' 
      },
      cancelled: { 
        light: { bg: 'bg-red-100', text: 'text-red-800' },
        dark: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border border-red-700' },
        label: 'Cancelled' 
      },
      rescheduled: { 
        light: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        dark: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border border-yellow-700' },
        label: 'Rescheduled' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    const theme = isDarkMode ? config.dark : config.light;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
        isDarkMode 
          ? `${theme.bg} ${theme.text} ${theme.border}` 
          : `${theme.bg} ${theme.text}`
      }`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      chat: { 
        light: { bg: 'bg-green-100', text: 'text-green-800' },
        dark: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border border-green-700' },
        icon: ChatBubbleLeftIcon 
      },
      call: { 
        light: { bg: 'bg-blue-100', text: 'text-blue-800' },
        dark: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border border-blue-700' },
        icon: PhoneIcon 
      },
      video: { 
        light: { bg: 'bg-purple-100', text: 'text-purple-800' },
        dark: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border border-purple-700' },
        icon: VideoCameraIcon 
      }
    };
    
    const config = typeConfig[type] || typeConfig.chat;
    const Icon = config.icon;
    const theme = isDarkMode ? config.dark : config.light;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center transition-colors duration-300 ${
        isDarkMode 
          ? `${theme.bg} ${theme.text} ${theme.border}` 
          : `${theme.bg} ${theme.text}`
      }`}>
        <Icon className="h-3 w-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        light: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        dark: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border border-yellow-700' }
      },
      paid: { 
        light: { bg: 'bg-green-100', text: 'text-green-800' },
        dark: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border border-green-700' }
      },
      failed: { 
        light: { bg: 'bg-red-100', text: 'text-red-800' },
        dark: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border border-red-700' }
      },
      refunded: { 
        light: { bg: 'bg-gray-100', text: 'text-gray-800' },
        dark: { bg: 'bg-gray-900/30', text: 'text-gray-400', border: 'border border-gray-700' }
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const theme = isDarkMode ? config.dark : config.light;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
        isDarkMode 
          ? `${theme.bg} ${theme.text} ${theme.border}` 
          : `${theme.bg} ${theme.text}`
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
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
            }`}>Consultations Management</h1>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Manage all consultations in the system</p>
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
              <ClockIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Consultations</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{consultations.length}</p>
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
              }`}>Completed</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {consultations.filter(c => c.status === 'completed').length}
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
              }`}>Total Revenue</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatCurrency(consultations.filter(c => c.paymentStatus === 'paid').reduce((acc, c) => acc + c.price, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
            }`}>
              <CalendarIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Scheduled</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {consultations.filter(c => c.status === 'scheduled').length}
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
                  placeholder="Search consultations..."
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
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Types</option>
                <option value="chat">Chat</option>
                <option value="call">Call</option>
                <option value="video">Video</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Consultations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Consultation
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Type
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Price
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Payment
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Scheduled
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
              {filteredConsultations.map((consultation) => (
                <tr key={consultation._id} className={`transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {consultation.seeker.fullname} → {consultation.provider.fullname}
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>{consultation.category}</div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`}>
                        Duration: {consultation.duration} min
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(consultation.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(consultation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className={`h-4 w-4 mr-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {formatCurrency(consultation.price)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPaymentStatusBadge(consultation.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <CalendarIcon className={`h-4 w-4 mr-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {formatDateTime(consultation.scheduledAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewConsultation(consultation)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {consultation.status === 'scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(consultation._id, 'active')}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                          title="Start Consultation"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      {consultation.status === 'active' && (
                        <button
                          onClick={() => handleUpdateStatus(consultation._id, 'completed')}
                          className="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                          title="Complete Consultation"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteConsultation(consultation._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete Consultation"
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

      {/* Consultation Details Modal */}
      {showConsultationModal && selectedConsultation && (
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
                }`}>Consultation Details</h3>
                <button
                  onClick={() => setShowConsultationModal(false)}
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
                  }`}>Seeker</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedConsultation.seeker.fullname}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedConsultation.seeker.email}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Provider</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedConsultation.provider.fullname}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedConsultation.provider.email}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`}>{selectedConsultation.provider.specialization}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Category</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedConsultation.category}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Type</label>
                  <div className="mt-1">
                    {getTypeBadge(selectedConsultation.type)}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Price</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatCurrency(selectedConsultation.price)}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Duration</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedConsultation.duration} minutes</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Scheduled At</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatDateTime(selectedConsultation.scheduledAt)}</p>
                </div>
                
                {selectedConsultation.completedAt && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Completed At</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formatDateTime(selectedConsultation.completedAt)}</p>
                  </div>
                )}
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Payment Status</label>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedConsultation.paymentStatus)}
                  </div>
                </div>
                
                {selectedConsultation.rating && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Rating</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedConsultation.rating}/5</p>
                  </div>
                )}
                
                {selectedConsultation.review && (
                  <div>
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Review</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedConsultation.review}</p>
                  </div>
                )}
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Created</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatDateTime(selectedConsultation.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations;

