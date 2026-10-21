import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ListPageSkeleton } from '../components/Skeleton';
import callAPI from '../services/callAPI';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TrashIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  PhoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import Drawer from '../components/Drawer';

const Consultations = () => {
  const { isDarkMode } = useTheme();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Default to grid view on mobile devices for better mobile experience
    return window.innerWidth < 768 ? "grid" : "table";
  }); // "table", "list", "grid"

  // Fetch consultations from API
  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await callAPI.get('/api/admin/consultations');
      
      if (response.data.success) {
        setConsultations(response.data.data.consultations || []);
      } else {
        toast.error('Failed to fetch consultations');
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to fetch consultations');
      // Set empty array as fallback
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };


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
      const response = await callAPI.put(`/api/admin/consultations/${consultationId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
      setConsultations(consultations.map(consultation => 
        consultation._id === consultationId 
          ? { ...consultation, status: newStatus }
          : consultation
      ));
      toast.success(`Consultation status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast.error('Failed to update consultation status');
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (window.confirm('Are you sure you want to delete this consultation?')) {
      try {
        const response = await callAPI.delete(`/api/admin/consultations/${consultationId}`);
        
        if (response.data.success) {
        setConsultations(consultations.filter(consultation => consultation._id !== consultationId));
        toast.success('Consultation deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting consultation:', error);
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center transition-colors duration-300 ${
        isDarkMode 
          ? `${theme.bg} ${theme.text} ${theme.border}` 
          : `${theme.bg} ${theme.text}`
      }`}>
        <Icon className="h-3 w-3 me-1" />
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

  // Back to the first page whenever search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType, filterCategory]);

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredConsultations.length / PAGE_SIZE));
  const paginated = filteredConsultations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return <ListPageSkeleton selects={3} addButton={false} columns={8} />;
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="mb-6 shrink-0 flex flex-wrap items-center justify-between gap-3">
  <div className="flex flex-wrap gap-3">
        <div className={`rounded-lg shadow-lg px-3 py-2 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <ClockIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{consultations.length}</p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg px-3 py-2 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircleIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Completed</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {consultations.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg px-3 py-2 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <CurrencyDollarIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Revenue</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {(() => {
                  const paidConsultations = consultations.filter(c => c.paymentStatus === 'paid');
                  const totalRevenue = paidConsultations.length > 0 
                    ? paidConsultations.reduce((acc, c) => acc + (c.price || 0), 0)
                    : 0;
                  return formatCurrency(totalRevenue);
                })()}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg px-3 py-2 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
            }`}>
              <CalendarIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Scheduled</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {consultations.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
      </div>
<div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
<div className="relative w-full sm:w-56">
                <MagnifyingGlassIcon className={`h-5 w-5 absolute start-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search consultations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ps-10 pe-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
<div className="flex flex-col sm:flex-row gap-2">
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
                </div>
                
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
<div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 justify-center sm:justify-start">
                <button
                  onClick={() => setViewMode("table")}
                  aria-label="Table View"
                  className={`group relative px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "table"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3zm0 6h18M3 12h18M3 18h18M9 3v18M15 3v18" />
                    </svg>
                    <span className="pointer-events-none absolute start-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-gray-700 transition-opacity duration-150 group-hover:opacity-100">Table View</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List View"
                  className={`group relative px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="pointer-events-none absolute start-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-gray-700 transition-opacity duration-150 group-hover:opacity-100">List View</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid View"
                  className={`group relative px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="pointer-events-none absolute start-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-gray-700 transition-opacity duration-150 group-hover:opacity-100">Grid View</span>
                  </div>
                </button>
              </div>
    </div>
</div>

      {/* Filters and Search */}
      <div className={`rounded-lg shadow-lg flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
      }`}>

        <div className="flex-1 min-h-0 overflow-auto">
        {viewMode === "table" && (
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`sticky top-0 z-10 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                    S.No.
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Consultation
                </th>
                <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Type
                </th>
                <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Price
                </th>
                <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Payment
                </th>
                <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Scheduled
                </th>
                <th className={`sticky-end-col px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
            }`}>
              {filteredConsultations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <ChatBubbleLeftRightIcon className="h-8 w-8" />
                      </div>
                      <div className="text-center">
                        <h3 className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>No consultations found</h3>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'No consultation records available at the moment'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
              paginated.map((consultation, index) => (
                <tr key={consultation._id} className={`transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
<td className="px-6 py-4 whitespace-nowrap">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
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
                      <CurrencyDollarIcon className={`h-4 w-4 me-1 transition-colors duration-300 ${
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
                      <CalendarIcon className={`h-4 w-4 me-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {formatDateTime(consultation.scheduledAt)}
                      </span>
                    </div>
                  </td>
                  <td className="sticky-end-col px-6 py-4 whitespace-nowrap text-sm font-medium">
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
              ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3 p-6">
            {filteredConsultations.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No consultations found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No consultation records available at the moment'
                  }
                </p>
              </div>
            ) : (
              paginated.map((consultation) => (
                <div
                  key={consultation._id}
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
                        <ChatBubbleLeftRightIcon
                          className={`h-6 w-6 transition-colors duration-300 ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {consultation.seeker.fullname} → {consultation.provider.fullname}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          {consultation.category}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? "text-gray-400" : "text-gray-400"
                        }`}>
                          {new Date(consultation.scheduledAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-start sm:text-end">
                        <div className="mb-1">{getTypeBadge(consultation.type)}</div>
                        <div className="mb-1">{getStatusBadge(consultation.status)}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          ${consultation.price}
                        </div>
                      </div>
                      <div className="flex justify-start sm:justify-end space-x-2">
                        <button
                          onClick={() => handleViewConsultation(consultation)}
                          className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(consultation._id, 'completed')}
                          className="text-green-600 hover:text-green-800 transition-colors duration-200"
                          title="Mark Complete"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteConsultation(consultation._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete Consultation"
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
            {filteredConsultations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No consultations found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No consultation records available at the moment'
                  }
                </p>
              </div>
            ) : (
              paginated.map((consultation) => (
                <div
                  key={consultation._id}
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
                      <ChatBubbleLeftRightIcon
                        className={`h-8 w-8 transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className={`text-lg font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {consultation.seeker.fullname} → {consultation.provider.fullname}
                    </div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {consultation.category}
                    </div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}>
                      {new Date(consultation.scheduledAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-center">{getTypeBadge(consultation.type)}</div>
                    <div className="flex justify-center">{getStatusBadge(consultation.status)}</div>
                    <div className={`text-center text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      ${consultation.price}
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleViewConsultation(consultation)}
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(consultation._id, 'completed')}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200"
                      title="Mark Complete"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteConsultation(consultation._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      title="Delete Consultation"
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
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredConsultations.length} onPageChange={setCurrentPage} />
</div>

      {/* Consultation Details Modal */}
      {showConsultationModal && selectedConsultation && (
        <Drawer onClose={() => setShowConsultationModal(false)} header={<><h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Consultation Details</h3></>}>
            <div className="mt-3">
              
              
              <div className="auto-grid auto-grid-sm gap-x-4 gap-y-4">
                <div className="min-w-0 break-words">
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
                
                <div className="min-w-0 break-words">
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
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Category</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedConsultation.category}</p>
                </div>
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Type</label>
                  <div className="mt-1">
                    {getTypeBadge(selectedConsultation.type)}
                  </div>
                </div>
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                </div>
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Price</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatCurrency(selectedConsultation.price)}</p>
                </div>
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Duration</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedConsultation.duration} minutes</p>
                </div>
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Scheduled At</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatDateTime(selectedConsultation.scheduledAt)}</p>
                </div>
                
                {selectedConsultation.completedAt && (
                  <div className="min-w-0 break-words">
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Completed At</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formatDateTime(selectedConsultation.completedAt)}</p>
                  </div>
                )}
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Payment Status</label>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedConsultation.paymentStatus)}
                  </div>
                </div>
                
                {selectedConsultation.rating && (
                  <div className="min-w-0 break-words">
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Rating</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedConsultation.rating}/5</p>
                  </div>
                )}
                
                {selectedConsultation.review && (
                  <div className="min-w-0 break-words col-span-full">
                    <label className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Review</label>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedConsultation.review}</p>
                  </div>
                )}
                
                <div className="min-w-0 break-words">
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Created</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{formatDateTime(selectedConsultation.createdAt)}</p>
                </div>
              </div>
            </div>
          </Drawer>
      )}
    </div>
  );
};

export default Consultations;

