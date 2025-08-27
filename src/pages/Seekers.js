import React, { useState, useEffect } from 'react';
import callAPI from '../services/callAPI';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  PencilSquareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Seekers = () => {
  const { isDarkMode } = useTheme();
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [showSeekerModal, setShowSeekerModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSeekers, setTotalSeekers] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeeker, setEditingSeeker] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSeeker, setNewSeeker] = useState({
    fullname: '',
    username: '',
    email: '',
    userType: 'seeker',
    gender: 'other',
    country: '',
    dob: '1990-01-01',
    bio: '',
    isVerified: false,
    isActive: true
  });

  useEffect(() => {
    fetchSeekers();
  }, [currentPage, searchTerm, filterStatus, filterCountry]);

  const fetchSeekers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        userType: 'seeker',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCountry !== 'all' && { country: filterCountry }),
      });

      const response = await callAPI.get(`/api/admin/users?${params}`);
      
      if (response.data.success) {
        // Ensure seekers array exists and is valid
        const seekersData = response.data.data?.users || [];
        const paginationData = response.data.data?.pagination || {};
        
        setSeekers(Array.isArray(seekersData) ? seekersData : []);
        setTotalPages(paginationData.totalPages || 1);
        setTotalSeekers(paginationData.totalUsers || 0);
      }
    } catch (error) {
      console.error('Error fetching seekers:', error);
      toast.error('Failed to fetch seekers');
    } finally {
      setLoading(false);
    }
  };

  const filteredSeekers = seekers.filter(seeker => {
    // Ensure seeker object exists and has required properties
    if (!seeker || typeof seeker !== 'object') return false;
    
    // Safe search with null checks
    const fullname = (seeker.fullname || '').toString();
    const email = (seeker.email || '').toString();
    const username = (seeker.username || '').toString();
    
    const matchesSearch = fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'verified' && seeker.isVerified) ||
                         (filterStatus === 'unverified' && !seeker.isVerified) ||
                         (filterStatus === 'active' && seeker.isActive) ||
                         (filterStatus === 'inactive' && !seeker.isActive);
    
    const matchesCountry = filterCountry === 'all' || seeker.country === filterCountry;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const countries = [...new Set(seekers.filter(s => s.country && s.country.trim()).map(s => s.country.trim()))];

  const handleViewSeeker = (seeker) => {
    setSelectedSeeker(seeker);
    setShowSeekerModal(true);
  };

  const handleToggleActive = async (seekerId) => {
    try {
      const seeker = seekers.find(s => s._id === seekerId);
      const response = await callAPI.put(`/api/admin/users/${seekerId}/status`, {
        isActive: !seeker.isActive
      });
      
      if (response.data.success) {
        setSeekers(seekers.map(seeker => 
          seeker._id === seekerId 
            ? { ...seeker, isActive: !seeker.isActive }
            : seeker
        ));
        toast.success(`Seeker ${!seeker.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating seeker status:', error);
      toast.error('Failed to update seeker status');
    }
  };

  const handleDeleteSeeker = async (seekerId) => {
    if (window.confirm('Are you sure you want to delete this seeker? This action cannot be undone.')) {
      try {
        const response = await callAPI.delete(`/api/admin/users/${seekerId}`);
        
        if (response.data.success) {
          setSeekers(seekers.filter(seeker => seeker._id !== seekerId));
          toast.success('Seeker deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting seeker:', error);
        toast.error('Failed to delete seeker');
      }
    }
  };

  const handleEditSeeker = (seeker) => {
    setEditingSeeker({ ...seeker });
    setShowEditModal(true);
  };

  const handleUpdateSeeker = async (seekerData) => {
    try {
      const response = await callAPI.put(`/api/admin/users/${seekerData._id}`, seekerData);
      
      if (response.data.success) {
        setSeekers(seekers.map(seeker => 
          seeker._id === seekerData._id ? response.data.data : seeker
        ));
        setShowEditModal(false);
        setEditingSeeker(null);
        toast.success('Seeker updated successfully');
      }
    } catch (error) {
      console.error('Error updating seeker:', error);
      toast.error('Failed to update seeker');
    }
  };

  const handleAddSeeker = () => {
    setNewSeeker({
      fullname: '',
      username: '',
      email: '',
      userType: 'seeker',
      gender: 'other',
      country: '',
      dob: '1990-01-01',
      bio: '',
      isVerified: false,
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleCreateSeeker = async (seekerData) => {
    try {
      const response = await callAPI.post('/api/admin/users', seekerData);
      
      if (response.data.success) {
        setSeekers([response.data.data, ...seekers]);
        setShowAddModal(false);
        toast.success('Seeker created successfully');
        fetchSeekers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating seeker:', error);
      toast.error('Failed to create seeker');
    }
  };

  const getStatusBadge = (seeker) => {
    if (!seeker.isActive) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-red-900/30 text-red-400 border border-red-700' 
            : 'bg-red-100 text-red-800'
        }`}>
          Inactive
        </span>
      );
    }
    if (!seeker.isVerified) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          Unverified
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-green-900/30 text-green-400 border border-green-700' 
          : 'bg-green-100 text-green-800'
      }`}>
        Active
      </span>
    );
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      <div className="flex flex-col lg:flex-row justify-between items-center">
      <div className="mb-2 lg:mb-0">
            <h1 className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Seekers Management</h1>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Manage all service seekers in the system</p>
          </div>
          <button
            onClick={handleAddSeeker}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Seeker
          </button>
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
              <UserIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Total Seekers</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{seekers.length}</p>
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
              }`}>Verified Seekers</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {seekers.filter(s => s.isVerified).length}
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
              <ClockIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Active Seekers</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {seekers.filter(s => s.isActive).length}
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
              <ChatBubbleLeftIcon className={`h-6 w-6 transition-colors duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Countries</p>
              <p className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {new Set(seekers.filter(s => s.country).map(s => s.country)).size}
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
                  placeholder="Search seekers..."
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
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              
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
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seekers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Seeker
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Age
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Country
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Joined Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Last Login
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
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
              {filteredSeekers.map((seeker) => (
                <tr key={seeker._id} className={`transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        isDarkMode ? 'bg-blue-600' : 'bg-blue-300'
                      }`}>
                        <UserIcon className={`h-6 w-6 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{seeker.fullname}</div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>{seeker.email}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`}>@{seeker.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {calculateAge(seeker.dob)} years
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {seeker.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <ClockIcon className={`h-4 w-4 mr-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {seeker.createdAt ? new Date(seeker.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <ChatBubbleLeftIcon className={`h-4 w-4 mr-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`} />
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {seeker.lastLogin ? new Date(seeker.lastLogin).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(seeker)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewSeeker(seeker)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleEditSeeker(seeker)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                        title="Edit Seeker"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(seeker._id)}
                        className={`${seeker.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors duration-200`}
                        title={seeker.isActive ? 'Deactivate Seeker' : 'Activate Seeker'}
                      >
                        {seeker.isActive ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSeeker(seeker._id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Delete Seeker"
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

      {/* Seeker Details Modal */}
      {showSeekerModal && selectedSeeker && (
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
                }`}>Seeker Details</h3>
                <button
                  onClick={() => setShowSeekerModal(false)}
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
                  }`}>Full Name</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedSeeker.fullname}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Username</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>@{selectedSeeker.username}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Email</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedSeeker.email}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Age</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{calculateAge(selectedSeeker.dob)} years</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Gender</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedSeeker.gender}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Country</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedSeeker.country}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Bio</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedSeeker.bio}</p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Date of Birth</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedSeeker.dob ? new Date(selectedSeeker.dob).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</label>
                  <div className="flex space-x-2 mt-1">
                    {getStatusBadge(selectedSeeker)}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Joined</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {new Date(selectedSeeker.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Last Login</label>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {new Date(selectedSeeker.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Seeker Modal */}
      {showEditModal && editingSeeker && (
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
                }`}>Edit Seeker</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateSeeker(editingSeeker);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Full Name</label>
                    <input
                      type="text"
                      value={editingSeeker.fullname}
                      onChange={(e) => setEditingSeeker({...editingSeeker, fullname: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Username</label>
                    <input
                      type="text"
                      value={editingSeeker.username}
                      onChange={(e) => setEditingSeeker({...editingSeeker, username: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email</label>
                    <input
                      type="email"
                      value={editingSeeker.email}
                      onChange={(e) => setEditingSeeker({...editingSeeker, email: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Gender</label>
                    <select
                      value={editingSeeker.gender || ''}
                      onChange={(e) => setEditingSeeker({...editingSeeker, gender: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Country</label>
                    <input
                      type="text"
                      value={editingSeeker.country || ''}
                      onChange={(e) => setEditingSeeker({...editingSeeker, country: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={editingSeeker.isVerified}
                      onChange={(e) => setEditingSeeker({...editingSeeker, isVerified: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVerified" className={`ml-2 block text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Verified Seeker
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingSeeker.isActive}
                      onChange={(e) => setEditingSeeker({...editingSeeker, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className={`ml-2 block text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Active Seeker
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
                  >
                    Update Seeker
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Seeker Modal */}
      {showAddModal && (
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
                }`}>Add New Seeker</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateSeeker(newSeeker);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newSeeker.fullname}
                      onChange={(e) => setNewSeeker({...newSeeker, fullname: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Username *</label>
                    <input
                      type="text"
                      required
                      value={newSeeker.username}
                      onChange={(e) => setNewSeeker({...newSeeker, username: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email *</label>
                    <input
                      type="email"
                      required
                      value={newSeeker.email}
                      onChange={(e) => setNewSeeker({...newSeeker, email: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Gender</label>
                    <select
                      value={newSeeker.gender}
                      onChange={(e) => setNewSeeker({...newSeeker, gender: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Country</label>
                    <input
                      type="text"
                      value={newSeeker.country}
                      onChange={(e) => setNewSeeker({...newSeeker, country: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Date of Birth</label>
                    <input
                      type="date"
                      value={newSeeker.dob}
                      onChange={(e) => setNewSeeker({...newSeeker, dob: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Bio</label>
                    <textarea
                      rows={3}
                      value={newSeeker.bio}
                      onChange={(e) => setNewSeeker({...newSeeker, bio: e.target.value})}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                      placeholder="Brief description about the seeker"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={newSeeker.isVerified}
                      onChange={(e) => setNewSeeker({...newSeeker, isVerified: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVerified" className={`ml-2 block text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Verified Seeker
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newSeeker.isActive}
                      onChange={(e) => setNewSeeker({...newSeeker, isActive: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className={`ml-2 block text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Active Seeker
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 transition-all duration-200 hover:scale-105"
                  >
                    Create Seeker
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`px-4 py-3 flex items-center justify-between border-t transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } sm:px-6`}>
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, totalSeekers)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalSeekers}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                      currentPage === i + 1
                        ? 'z-10 bg-custom-btnBg/10 border-custom-btnBg text-custom-btnBg'
                        : isDarkMode
                          ? 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seekers;

