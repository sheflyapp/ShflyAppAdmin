import React, { useState, useEffect, useCallback } from 'react';
import callAPI from '../services/callAPI';
import { useTheme } from '../contexts/ThemeContext';
import { ListPageSkeleton } from '../components/Skeleton';
import SpecializationSelector from '../components/SpecializationSelector';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserIcon,
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import Drawer from '../components/Drawer';
import UserEditFields from '../components/UserEditFields';
import SpecializationTags from '../components/SpecializationTags';
import UserDetails, { UserDetailsHeader } from '../components/UserDetails';

const Providers = () => {
  const { isDarkMode } = useTheme();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProviders, setTotalProviders] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    userType: 'provider',
    phone: '',
    specializations: [],
    price: 0,
    country: '',
    gender: 'other',
    dob: '1990-01-01',
    bio: '',
    isVerified: false,
    isActive: true
  });
  const [viewMode, setViewMode] = useState(() => {
    // Default to grid view on mobile devices for better mobile experience
    return window.innerWidth < 768 ? "grid" : "table";
  }); // "table", "list", "grid"

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        userType: 'provider',
        ...(searchTerm && { search: searchTerm }),
        ...(filterSpecialization !== 'all' && { specialization: filterSpecialization }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });

      const response = await callAPI.get(`/api/admin/users?${params}`);
      
      if (response.data.success) {
        // Ensure providers array exists and is valid
        const providersData = response.data.data?.users || [];
        const paginationData = response.data.data?.pagination || {};
        
        setProviders(Array.isArray(providersData) ? providersData : []);
        setTotalPages(paginationData.totalPages || 1);
        setTotalProviders(paginationData.totalUsers || 0);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterSpecialization, filterStatus]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Specialization filter options come from the categories list
  useEffect(() => {
    const fetchSpecializationOptions = async () => {
      try {
        const response = await callAPI.get('/api/admin/categories');
        if (response.data.success) {
          const list = (response.data.data?.categories || [])
            .filter(category => category.isActive)
            .sort((a, b) => a.name.localeCompare(b.name));
          setSpecializationOptions(list);
        }
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    };
    fetchSpecializationOptions();
  }, []);

  const filteredProviders = providers.filter(provider => {
    // Ensure provider object exists and has required properties
    if (!provider || typeof provider !== 'object') return false;
    
    // Safe search with null checks
    const fullname = (provider.fullname || '').toString();
    const email = (provider.email || '').toString();
    const specialization = (provider.specializations || []).map(spec => spec.name || '').join(' ');
    
    const matchesSearch = fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = filterSpecialization === 'all' ||
                                  (provider.specializations || []).some(spec => (spec._id || spec) === filterSpecialization);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && provider.isVerified) ||
                         (filterStatus === 'unverified' && !provider.isVerified) ||
                         (filterStatus === 'active' && provider.isActive) ||
                         (filterStatus === 'inactive' && !provider.isActive);
    
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setShowProviderModal(true);
  };

  const handleToggleActive = async (providerId) => {
    try {
      const provider = providers.find(p => p._id === providerId);
      const response = await callAPI.patch(`/api/admin/users/${providerId}/status`, {
        isActive: !provider.isActive
      });
      
      if (response.data.success) {
        setProviders(providers.map(provider => 
          provider._id === providerId 
            ? { ...provider, isActive: !provider.isActive }
            : provider
        ));
        toast.success(`Provider ${!provider.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating provider status:', error);
      toast.error('Failed to update provider status');
    }
  };

  const handleVerifyProvider = async (providerId, isVerified) => {
    try {
      const response = await callAPI.patch(`/api/admin/users/${providerId}/status`, { isVerified });

      if (response.data.success) {
        setProviders(providers.map(provider =>
          provider._id === providerId ? { ...provider, isVerified } : provider
        ));
        toast.success(isVerified ? 'Provider approved successfully' : 'Provider approval removed');
      }
    } catch (error) {
      console.error('Error updating provider approval:', error);
      toast.error('Failed to update provider approval');
    }
  };

  const handleDeleteProvider = async (providerId) => {
    if (window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      try {
        const response = await callAPI.delete(`/api/admin/users/${providerId}`);
        
        if (response.data.success) {
          setProviders(providers.filter(provider => provider._id !== providerId));
          toast.success('Provider deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting provider:', error);
        toast.error('Failed to delete provider');
      }
    }
  };

  const handleEditProvider = (provider) => {
    setEditingProvider({ ...provider });
    setShowEditModal(true);
  };

  const handleUpdateProvider = async (providerData) => {
    try {
      const response = await callAPI.put(`/api/admin/users/${providerData._id}`, providerData);
      
      if (response.data.success) {
        setProviders(providers.map(provider => 
          provider._id === providerData._id ? response.data.data.user : provider
        ));
        setShowEditModal(false);
        setEditingProvider(null);
        toast.success('Provider updated successfully');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      toast.error('Failed to update provider');
    }
  };

  const handleAddProvider = () => {
    setNewProvider({
      fullname: '',
      username: '',
      email: '',
      userType: 'provider',
      specialization: '',
      price: 0,
      country: '',
      gender: 'other',
      dob: '1990-01-01',
      bio: '',
      isVerified: false,
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleCreateProvider = async (providerData) => {
    try {
      // Prepare provider data with specializations
      const providerPayload = {
        ...providerData,
        specializations: providerData.specializations.map(spec => spec._id)
      };

      const response = await callAPI.post('/api/admin/users', providerPayload);
      
      if (response.data.success) {
        setProviders([response.data.data.user, ...providers]);
        setShowAddModal(false);
        setNewProvider({
          fullname: '',
          username: '',
          email: '',
          password: '',
          userType: 'provider',
          phone: '',
          specializations: [],
          price: 0,
          country: '',
          gender: 'other',
          dob: '1990-01-01',
          bio: '',
          isVerified: false,
          isActive: true
        });
        toast.success('Provider created successfully');
        fetchProviders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating provider:', error);
      toast.error(error.response?.data?.message || 'Failed to create provider');
    }
  };

  const getStatusBadge = (provider) => {
    if (!provider.isActive) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
          isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
        }`}>
          Inactive
        </span>
      );
    }
    if (!provider.isVerified) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
          isDarkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
        }`}>
          Pending Approval
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
        isDarkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'
      }`}>
        Active
      </span>
    );
  };

  const formatSpecializations = (specializations) => {
    if (!specializations || specializations.length === 0) {
      return 'No specializations';
    }
    return specializations.map(spec => spec.name || spec).join(', ');
  };

  const getUserTypeBadge = (userType) => {
    const typeConfig = {
      provider: {
        label: 'Provider',
        className: isDarkMode ? 'bg-purple-900/30 text-purple-200' : 'bg-purple-100 text-purple-800'
      },
      seeker: {
        label: 'Seeker',
        className: isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'
      },
      admin: {
        label: 'Admin',
        className: isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
      }
    };

    const config = typeConfig[userType] || typeConfig.provider;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className={`h-4 w-4 transition-colors duration-300 ${
        isDarkMode ? 'text-gray-500' : 'text-gray-300'
      }`} />);
    }
    
    return stars;
  };

  if (loading) {
    return <ListPageSkeleton selects={2} columns={7} />;
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
              isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <UserIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{providers.length}</p>
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
              }`}>Verified</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {providers.filter(p => p.isVerified).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-lg shadow-lg px-3 py-2 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
        }`}>
          <div className="flex items-center">
            <div className={`p-1.5 rounded-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <StarIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Avg Rating</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {providers.length > 0 
                  ? (providers.reduce((acc, p) => acc + (p.rating || 0), 0) / providers.length).toFixed(1)
                  : '0.0'
                }
              </p>
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
              <CurrencyDollarIcon className={`h-5 w-5 transition-colors duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="ms-3">
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Avg Price</p>
              <p className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ${providers.length > 0 
                  ? Math.round(providers.reduce((acc, p) => acc + (p.price || 0), 0) / providers.length)
                  : '0'
                }
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
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ps-10 pe-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
                <select
                  value={filterSpecialization}
                  onChange={(e) => { setFilterSpecialization(e.target.value); setCurrentPage(1); }}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Specializations</option>
                  {specializationOptions.map(spec => (
                    <option key={spec._id} value={spec._id}>{spec.name}</option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
          <button
            onClick={handleAddProvider}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="h-4 w-4 me-2" />
            New
          </button>
          </div>
</div>

      {/* Filters and Search */}
      <div className={`rounded-lg shadow-lg flex flex-col flex-1 min-h-0 overflow-hidden transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
      }`}>
        <div className="flex-1 min-h-0 overflow-auto">
        {viewMode === "table" && (
          <div>
            <table className={`min-w-full divide-y transition-colors duration-300 ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              <thead className={`sticky top-0 z-10 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    S.No.
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    Provider
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    Specialization
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    Rating
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    Price
                  </th>
                  <th className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`sticky-end-col px-6 py-3 text-start text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
              }`}>
                {filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <UserGroupIcon className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <h3 className={`text-lg font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-900'
                          }`}>No providers found</h3>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {searchTerm || filterStatus !== 'all' || filterSpecialization !== 'all'
                              ? 'Try adjusting your search or filters'
                              : 'No provider records available at the moment'
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                filteredProviders.map((provider, index) => (
                  <tr key={provider._id} className={`transition-colors duration-300 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
<td className="px-6 py-4 whitespace-nowrap">{(currentPage - 1) * 10 + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? 'bg-purple-600' : 'bg-purple-300'
                        }`}>
                          <UserIcon className={`h-6 w-6 transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-purple-600'
                          }`} />
                        </div>
                        <div className="ms-4">
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{provider.fullname}</div>
                          <div className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>{provider.email}</div>
                          <div className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-400'
                          }`}>@{provider.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SpecializationTags items={provider?.specializations} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center me-2">
                          {getRatingStars(provider.rating)}
                        </div>
                        <span className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{provider.rating}</span>
                        <span className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } ms-1`}>({provider.totalReviews})</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className={`h-4 w-4 transition-colors duration-300 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        } me-1`} />
                        {provider.price}/hour
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(provider)}
                    </td>
                    <td className="sticky-end-col px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProvider(provider)}
                          className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleEditProvider(provider)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Provider"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleActive(provider._id)}
                          className={`transition-colors duration-200 ${
                            provider.isActive 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={provider.isActive ? 'Deactivate Provider' : 'Activate Provider'}
                        >
                          {provider.isActive ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                        </button>
                        
                        {!provider.isVerified && (
                          <button
                            onClick={() => handleVerifyProvider(provider._id, true)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                            title="Approve Provider"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProvider(provider._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete Provider"
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
            {filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <UserGroupIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No providers found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm || filterStatus !== 'all' || filterSpecialization !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No provider records available at the moment'
                  }
                </p>
              </div>
            ) : (
              filteredProviders.map((provider) => (
                <div
                  key={provider._id}
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
                        style={{ backgroundColor: provider.specializations?.[0]?.color + '20' }}
                      >
                        <UserIcon
                          className={`h-6 w-6 transition-colors duration-300`}
                          style={{ color: provider.specializations?.[0]?.color }}
                        />
                      </div>
                      <div>
                        <div className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {provider.fullname}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          {provider.specializations?.[0]?.name || 'No Specialization'}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? "text-gray-400" : "text-gray-400"
                        }`}>
                          {formatSpecializations(provider.specializations)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-start sm:text-end">
                        <div className="mb-1">{getUserTypeBadge(provider.userType)}</div>
                        <div className="mb-1">{getStatusBadge(provider)}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          Rating: <span className="inline-flex items-center">{getRatingStars(provider.rating)}</span>
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          {provider.consultations?.length || 0} consultations
                        </div>
                      </div>
                      <div className="flex justify-start sm:justify-end space-x-2">
                        <button
                          onClick={() => handleViewProvider(provider)}
                          className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditProvider(provider)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Provider"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        {!provider.isVerified && (
                          <button
                            onClick={() => handleVerifyProvider(provider._id, true)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                            title="Approve Provider"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProvider(provider._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete Provider"
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
            {filteredProviders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <UserGroupIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No providers found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm || filterStatus !== 'all' || filterSpecialization !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No provider records available at the moment'
                  }
                </p>
              </div>
            ) : (
              filteredProviders.map((provider) => (
                <div
                  key={provider._id}
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
                      style={{ backgroundColor: provider.specializations?.[0]?.color + '20' }}
                    >
                      <UserIcon
                        className={`h-8 w-8 transition-colors duration-300`}
                        style={{ color: provider.specializations?.[0]?.color }}
                      />
                    </div>
                    <div className={`text-lg font-medium transition-colors duration-300 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {provider.fullname}
                    </div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {provider.specializations?.[0]?.name || 'No Specialization'}
                    </div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}>
                      {formatSpecializations(provider.specializations)}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-center">{getStatusBadge(provider)}</div>
                    <div className={`text-center text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Rating: <span className="inline-flex items-center justify-center">{getRatingStars(provider.rating)}</span>
                    </div>
                    <div className={`text-center text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      ${provider.price}/hour
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleViewProvider(provider)}
                      className="text-primary-600 hover:text-primary-800 transition-colors duration-200"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditProvider(provider)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      title="Edit Provider"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    {!provider.isVerified && (
                      <button
                        onClick={() => handleVerifyProvider(provider._id, true)}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                        title="Approve Provider"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProvider(provider._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      title="Delete Provider"
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
<Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalProviders} onPageChange={setCurrentPage} />
</div>

      {/* Provider Details Modal */}
      {showProviderModal && selectedProvider && (
        <Drawer onClose={() => setShowProviderModal(false)} header={<UserDetailsHeader user={selectedProvider} />}>
          <UserDetails user={selectedProvider} />
        </Drawer>
      )}

      {/* Edit Provider Modal */}
      {showEditModal && editingProvider && (
        <Drawer onClose={() => setShowEditModal(false)} header={<><h3 className="text-lg font-medium text-gray-900">Edit Provider</h3></>} footer={<><button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" form="drawer-form"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90"
                  >
                    Update Provider
                  </button></>}>
            <div className="mt-3">
              
              
              <form id="drawer-form" onSubmit={(e) => {
                e.preventDefault();
                handleUpdateProvider(editingProvider);
              }}>
                <div className="auto-grid gap-x-4 gap-y-4">
                  <UserEditFields value={editingProvider} onChange={(patch) => setEditingProvider({ ...editingProvider, ...patch })} />
                </div>
                
                
              </form>
            </div>
          </Drawer>
      )}

      {/* Add Provider Modal */}
      {showAddModal && (
        <Drawer onClose={() => setShowAddModal(false)} header={<><h3 className="text-lg font-medium text-gray-900">Add New Provider</h3></>} footer={<><button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewProvider({
                        fullname: '',
                        username: '',
                        email: '',
                        password: '',
                        userType: 'provider',
                        phone: '',
                        specialization: '',
                        price: 0,
                        country: '',
                        gender: 'other',
                        dob: '1990-01-01',
                        bio: '',
                        isVerified: false,
                        isActive: true
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" form="drawer-form"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90"
                  >
                    Create Provider
                  </button></>}>
            <div className="mt-3">
              
              
              <form id="drawer-form" onSubmit={(e) => {
                e.preventDefault();
                handleCreateProvider(newProvider);
              }}>
                <div className="auto-grid gap-x-4 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={newProvider.fullname}
                      onChange={(e) => setNewProvider({...newProvider, fullname: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username *</label>
                    <input
                      type="text"
                      required
                      value={newProvider.username}
                      onChange={(e) => setNewProvider({...newProvider, username: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={newProvider.email}
                      onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <input
                      type="password"
                      required
                      value={newProvider.password}
                      onChange={(e) => setNewProvider({...newProvider, password: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newProvider.phone}
                      onChange={(e) => setNewProvider({...newProvider, phone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., +1234567890"
                    />
                  </div>
                  
                  {/* Specializations - Required for providers */}
                  <SpecializationSelector
                    selectedSpecializations={newProvider.specializations}
                    onSpecializationsChange={(specializations) =>
                      setNewProvider({ ...newProvider, specializations })
                    }
                    required={true}
                    userType="provider"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Hour</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProvider.price}
                      onChange={(e) => setNewProvider({...newProvider, price: parseFloat(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={newProvider.country}
                      onChange={(e) => setNewProvider({...newProvider, country: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      value={newProvider.gender}
                      onChange={(e) => setNewProvider({...newProvider, gender: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      value={newProvider.dob}
                      onChange={(e) => setNewProvider({...newProvider, dob: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      rows={3}
                      value={newProvider.bio}
                      onChange={(e) => setNewProvider({...newProvider, bio: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description about the provider"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={newProvider.isVerified}
                      onChange={(e) => setNewProvider({...newProvider, isVerified: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVerified" className="ms-2 block text-sm text-gray-900">
                      Verified Provider
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newProvider.isActive}
                      onChange={(e) => setNewProvider({...newProvider, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ms-2 block text-sm text-gray-900">
                      Active Provider
                    </label>
                  </div>
                </div>
                
                
              </form>
            </div>
          </Drawer>
      )}

    </div>
  );
};

export default Providers;

