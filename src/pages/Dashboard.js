import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import callAPI from '../services/callAPI';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalSeekers: 0,
    totalConsultations: 0,
    totalRevenue: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await callAPI.get('/api/admin/dashboard/stats');
      
      // Extract data from the nested response structure
      if (statsResponse.data.success && statsResponse.data.data) {
        const { overview } = statsResponse.data.data;
        setStats({
          totalUsers: overview?.totalUsers || 0,
          totalProviders: overview?.totalProviders || 0,
          totalSeekers: overview?.totalSeekers || 0,
          totalConsultations: overview?.totalConsultations || 0,
          totalRevenue: overview?.totalRevenue || 0,
        });
      }
      
      // Fetch recent consultations from the stats response
      if (statsResponse.data.success && statsResponse.data.data) {
        const { recent } = statsResponse.data.data;
        setRecentConsultations(recent?.consultations || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats({
        totalUsers: 0,
        totalProviders: 0,
        totalSeekers: 0,
        totalConsultations: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: t('dashboard.totalUsers'),
      value: stats.totalUsers || 0,
      icon: UsersIcon,
      change: '+12%',
      changeType: 'positive',
      color: 'bg-blue-500',
      link: '/users',
    },
    {
      name: t('dashboard.totalProviders'),
      value: stats.totalProviders || 0,
      icon: UserGroupIcon,
      change: '+8%',
      changeType: 'positive',
      color: 'bg-green-500',
      link: '/providers',
    },
    {
      name: t('dashboard.totalSeekers'),
      value: stats.totalSeekers || 0,
      icon: UsersIcon,
      change: '+15%',
      changeType: 'positive',
      color: 'bg-indigo-500',
      link: '/seekers',
    },
    {
      name: t('dashboard.totalConsultations'),
      value: stats.totalConsultations || 0,
      icon: ChatBubbleLeftRightIcon,
      change: '+23%',
      changeType: 'positive',
      color: 'bg-purple-500',
      link: '/consultations',
    },
    {
      name: t('dashboard.totalRevenue'),
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: CreditCardIcon,
      change: '+18%',
      changeType: 'positive',
      color: 'bg-yellow-500',
      link: '/payments',
    },
    
  ];

  const chartData = [
    { name: 'Jan', users: 65, consultations: 28, revenue: 12000 },
    { name: 'Feb', users: 78, consultations: 35, revenue: 15000 },
    { name: 'Mar', users: 90, consultations: 42, revenue: 18000 },
    { name: 'Apr', users: 105, consultations: 48, revenue: 22000 },
    { name: 'May', users: 120, consultations: 55, revenue: 25000 },
    { name: 'Jun', users: 135, consultations: 62, revenue: 28000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`animate-spin rounded-full h-32 w-32 border-b-2 transition-colors duration-300 ${
          isDarkMode ? 'border-primary-400' : 'border-primary-600'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className={`text-2xl font-semibold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>{t('dashboard.title')}</h1>
        <p className={`mt-1 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <div 
            key={stat.name} 
            onClick={() => navigate(stat.link)}
            title={`Click to view ${stat.name.toLowerCase()}`}
            className={`card transition-all duration-300 hover:scale-105 cursor-pointer ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 shadow-gray-900/50 hover:bg-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 shadow-gray-200/50 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {stat.name}
                  </dt>
                  <dd className={`text-lg font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                {stat.changeType === 'positive' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                )}
                <span className={`ml-1 font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className={`ml-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>from last month</span>
              </div>
              {/* Click indicator */}
              <div className="mt-2 flex items-center justify-end">
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  Click to view details →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Users and Consultations Chart */}
        <div className={`card transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-white border-gray-200 shadow-gray-200/50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{t('dashboard.recentActivity')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#374151'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#374151'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#000000'
                }}
              />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="consultations" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className={`card transition-all duration-300 hover:scale-105 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
            : 'bg-white border-gray-200 shadow-gray-200/50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{t('dashboard.totalRevenue')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#374151'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#374151'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                  color: isDarkMode ? '#FFFFFF' : '#000000'
                }}
              />
              <Bar dataKey="revenue" fill="#EAB308" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Consultations */}
      <div className={`card transition-all duration-300 hover:scale-105 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 shadow-gray-900/50' 
          : 'bg-white border-gray-200 shadow-gray-200/50'
      }`}>
        <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>{t('consultations.title')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('common.providers')}</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('common.seekers')}</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('common.categories')}</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('consultations.type')}</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('common.status')}</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('common.price')}</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
            }`}>
              {recentConsultations.length > 0 ? (
                recentConsultations.map((consultation) => (
                  <tr key={consultation._id}>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}>
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {consultation.provider?.fullname?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {consultation.provider?.fullname || 'Unknown Provider'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}>
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {consultation.seeker?.fullname?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {consultation.seeker?.fullname || 'Unknown Seeker'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{consultation.category || 'N/A'}</td>
                    <td className={`table-cell capitalize transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{consultation.consultationType || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                        consultation.status === 'completed' ? 
                          (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
                        consultation.status === 'pending' ? 
                          (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                        consultation.status === 'accepted' ? 
                          (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') :
                          (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800')
                      }`}>
                        {consultation.status || 'N/A'}
                      </span>
                    </td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>₹{consultation.price || 0}</td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={`px-6 py-4 text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {t('messages.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

