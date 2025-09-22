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
  Squares2X2Icon,
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
    totalCategories: 0,
    totalConsultations: 0,
    totalQuestions: 0,
    totalRevenue: 0,
  });
  const [paymentsStats, setPaymentsStats] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    // Default to grid view on mobile devices for better mobile experience
    return window.innerWidth < 768 ? "grid" : "table";
  }); // "table", "list", "grid"

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
        const { overview, payments } = statsResponse.data.data;
        setStats({
          totalUsers: overview?.totalUsers || 0,
          totalProviders: overview?.totalProviders || 0,
          totalSeekers: overview?.totalSeekers || 0,
          totalCategories: overview?.totalCategories || 0,
          totalConsultations: overview?.totalConsultations || 0,
          totalQuestions: overview?.totalQuestions || 0,
          totalRevenue: overview?.totalRevenue || 0,
        });
        setPaymentsStats(payments || null);
      }
      
      // Fetch recent questions and charts from the stats response
      if (statsResponse.data.success && statsResponse.data.data) {
        const { recent, charts: chartsData } = statsResponse.data.data;
        const recentQs = recent?.questions || [];
        setRecentQuestions(recentQs);
        setCharts(chartsData || []);
      }

      // Fallback: If no recent questions came from stats API, pull last 6 via questions API
      if ((!statsResponse.data?.data?.recent?.questions || statsResponse.data.data.recent.questions.length === 0)) {
        try {
          const qsRes = await callAPI.get('/api/questions?limit=6');
              if (qsRes.data?.success && qsRes.data?.data?.questions) {
            const mapped = qsRes.data.data.questions.map(q => ({
              _id: q._id,
              postedBy: { fullname: q.userId?.fullname, email: q.userId?.email },
              solvedBy: null,
              category: q.category?.name,
              subcategory: q.subcategory?.name,
                  description: q.description,
              status: q.status,
              createdAt: q.createdAt
            }));
            setRecentQuestions(mapped);
          }
        } catch (e) {
          // ignore fallback errors
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats({
        totalUsers: 0,
        totalProviders: 0,
        totalSeekers: 0,
        totalCategories: 0,
        totalConsultations: 0,
        totalQuestions: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencySAR = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(Number(amount || 0));

  const truncateWords = (text, maxWords = 4) => {
    if (!text) return '';
    const words = String(text).trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const statCards = [
    // Row 1: Users, Providers, Seekers
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
    // Row 2: Categories, Consultations, Payments
    {
      name: t('Total Categories'),
      value: stats.totalCategories || 0,
      icon: Squares2X2Icon,
      change: '+5%',
      changeType: 'positive',
      color: 'bg-orange-500',
      link: '/categories',
    },
    {
      name: t('Total Questions'),
      value: stats.totalQuestions || 0,
      icon: ChatBubbleLeftRightIcon,
      change: '+23%',
      changeType: 'positive',
      color: 'bg-purple-500',
      link: '/questions',
    },
    {
      name: t('dashboard.totalRevenue'),
      value: formatCurrencySAR(stats.totalRevenue || 0),
      icon: CreditCardIcon,
      change: '+18%',
      changeType: 'positive',
      color: 'bg-yellow-500',
      link: '/payments',
    },
    // Payments KPIs (SAR)
    {
      name: 'Total Payments',
      value: paymentsStats?.totalPayments || 0,
      icon: CreditCardIcon,
      change: '',
      changeType: 'positive',
      color: 'bg-teal-500',
      link: '/payments',
    },
    {
      name: 'Successful Amount (SAR)',
      value: formatCurrencySAR(paymentsStats?.statusTotals?.success?.amountSar || 0),
      icon: ArrowTrendingUpIcon,
      change: '',
      changeType: 'positive',
      color: 'bg-green-600',
      link: '/payments',
    },
    {
      name: 'Failed Amount (SAR)',
      value: formatCurrencySAR(paymentsStats?.statusTotals?.failed?.amountSar || 0),
      icon: ArrowTrendingDownIcon,
      change: '',
      changeType: 'negative',
      color: 'bg-red-600',
      link: '/payments',
    },
    {
      name: 'Cancelled Amount (SAR)',
      value: formatCurrencySAR(paymentsStats?.statusTotals?.cancelled?.amountSar || 0),
      icon: ArrowTrendingDownIcon,
      change: '',
      changeType: 'negative',
      color: 'bg-gray-600',
      link: '/payments',
    },
  ];

  const chartData = charts;

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <Line type="monotone" dataKey="questions" stroke="#8B5CF6" strokeWidth={2} />
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
        <div className="flex flex-col gap-4 mb-4">
          <h3 className={`text-lg font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Recent Questions</h3>
          
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
        
        {/* Conditional Views */}
        {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Posted By</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Solved By</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Category</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Desc.</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Subcategory</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Status</th>
                <th className={`table-header transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-500'
                }`}>Date</th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
            }`}>
              {recentQuestions.length > 0 ? (
                recentQuestions.map((q) => (
                  <tr key={q._id}>
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
                            {q.postedBy?.fullname?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {q.postedBy?.fullname || q.postedBy?.email || 'Unknown'}
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
                            {q.solvedBy?.fullname?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {q.solvedBy?.fullname || q.solvedBy?.email || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{q.category || 'N/A'}</td>
                    <td title={q.description} className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{truncateWords(q.description, 4) || '—'}</td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{q.subcategory || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                        q.status === 'answered' ? 
                          (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
                        q.status === 'pending' ? 
                          (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                        q.status === 'closed' ? 
                          (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') :
                          (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800')
                      }`}>
                        {q.status || 'N/A'}
                      </span>
                    </td>
                    <td className={`table-cell transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={`px-6 py-4 text-center transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {recentQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No questions found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No recent question records available at the moment
                </p>
              </div>
            ) : (
              recentQuestions.map((q) => (
                <div
                  key={q._id}
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
                          {q.postedBy?.fullname || q.postedBy?.email || 'Unknown'} {q.solvedBy ? `→ ${q.solvedBy?.fullname || q.solvedBy?.email}` : ''}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}>
                          {q.category || 'N/A'}
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? "text-gray-400" : "text-gray-400"
                        }`}>
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <div className="mb-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                          q.status === 'answered' ? 
                            (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
                          q.status === 'pending' ? 
                            (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                          q.status === 'closed' ? 
                            (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') :
                            (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800')
                        }`}>
                          {q.status || 'N/A'}
                        </span>
                      </div>
                      <div className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {q.category || 'N/A'}
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {q.subcategory || 'N/A'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentQuestions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'
                }`}>
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </div>
                <h3 className={`text-lg font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-900'
                }`}>No questions found</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No recent question records available at the moment
                </p>
              </div>
            ) : (
              recentQuestions.map((q) => (
                <div
                  key={q._id}
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
                      {q.postedBy?.fullname || q.postedBy?.email || 'Unknown'} {q.solvedBy ? `→ ${q.solvedBy?.fullname || q.solvedBy?.email}` : ''}
                    </div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {q.category || 'N/A'}
                    </div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}>
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
                        q.status === 'answered' ? 
                          (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') :
                        q.status === 'pending' ? 
                          (isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                        q.status === 'closed' ? 
                          (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800') :
                          (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800')
                      }`}>
                        {q.status || 'N/A'}
                      </span>
                    </div>
                    <div className={`text-center text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {q.category || 'N/A'}
                    </div>
                    <div className={`text-center text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {q.subcategory || 'N/A'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

