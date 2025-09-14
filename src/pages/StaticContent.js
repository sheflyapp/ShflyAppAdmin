import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import callAPI from '../services/callAPI';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

const StaticContent = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { isDarkMode } = useTheme();
  
  const [contentList, setContentList] = useState([]);
  const [selectedType, setSelectedType] = useState('privacy-policy');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentAr: '',
    version: '1.0.0',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isActive: true
  });

  const contentTypes = [
    { 
      value: 'privacy-policy', 
      label: t('staticContent.privacyPolicy'), 
      icon: ShieldCheckIcon,
      description: t('staticContent.privacyPolicyDesc')
    },
    { 
      value: 'terms-conditions', 
      label: t('staticContent.termsConditions'), 
      icon: DocumentTextIcon,
      description: t('staticContent.termsConditionsDesc')
    },
    { 
      value: 'help', 
      label: t('staticContent.help'), 
      icon: QuestionMarkCircleIcon,
      description: t('staticContent.helpDesc')
    },
    { 
      value: 'onboarding', 
      label: t('staticContent.onboarding'), 
      icon: RocketLaunchIcon,
      description: t('staticContent.onboardingDesc')
    },
    { 
      value: 'about', 
      label: t('staticContent.about'), 
      icon: InformationCircleIcon,
      description: t('staticContent.aboutDesc')
    },
    { 
      value: 'contact', 
      label: t('staticContent.contact'), 
      icon: EnvelopeIcon,
      description: t('staticContent.contactDesc')
    },
    { 
      value: 'faq', 
      label: t('staticContent.faq'), 
      icon: ChatBubbleLeftRightIcon,
      description: t('staticContent.faqDesc')
    }
  ];

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    try {
      setIsLoading(true);
      const response = await callAPI.get('/api/content/admin/all');
      if (response.data.success) {
        setContentList(response.data.data);
      }
    } catch (error) {
      toast.error(t('staticContent.errorLoadingContent'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadContent = async (type) => {
    try {
      const response = await callAPI.get(`/api/content/${type}?lang=${currentLanguage}`);
      if (response.data.success && response.data.data) {
        setFormData({
          title: response.data.data.title || '',
          content: response.data.data.content || '',
          contentAr: response.data.data.contentAr || '',
          version: response.data.data.version || '1.0.0',
          seoTitle: response.data.data.seoTitle || '',
          seoDescription: response.data.data.seoDescription || '',
          seoKeywords: (response.data.data.seoKeywords || []).join(', '),
          isActive: true
        });
        setIsEditing(true);
        setShowForm(true);
      } else {
        // New content
        setFormData({
          title: contentTypes.find(ct => ct.value === type)?.label || '',
          content: '',
          contentAr: '',
          version: '1.0.0',
          seoTitle: '',
          seoDescription: '',
          seoKeywords: '',
          isActive: true
        });
        setIsEditing(false);
        setShowForm(true);
      }
    } catch (error) {
      // Content doesn't exist, create new
      setFormData({
        title: contentTypes.find(ct => ct.value === type)?.label || '',
        content: '',
        contentAr: '',
        version: '1.0.0',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        isActive: true
      });
      setIsEditing(false);
      setShowForm(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const submitData = {
        ...formData,
        seoKeywords: formData.seoKeywords.split(',').map(k => k.trim()).filter(k => k)
      };

      const response = await callAPI.post(`/api/content/${selectedType}`, submitData);
      
      if (response.data.success) {
        toast.success(isEditing ? t('staticContent.contentUpdated') : t('staticContent.contentCreated'));
        setShowForm(false);
        loadAllContent();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || t('staticContent.errorSavingContent'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (content) => {
    if (!window.confirm(t('staticContent.confirmDelete'))) return;
    
    try {
      const response = await callAPI.delete(`/api/content/${content.type}`);
      if (response.data.success) {
        toast.success(t('staticContent.contentDeleted'));
        loadAllContent();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || t('staticContent.errorDeletingContent'));
    }
  };

  const handleEdit = (content) => {
    setSelectedType(content.type);
    loadContent(content.type);
  };

  const handleCreateNew = (type) => {
    setSelectedType(type);
    loadContent(type);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US');
  };

  const getContentTypeInfo = (type) => {
    return contentTypes.find(ct => ct.value === type) || contentTypes[0];
  };

  const formatContent = (content) => {
    return content ? content.replace(/\n/g, '<br>') : '';
  };

  if (showForm) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isEditing ? t('staticContent.editContent') : t('staticContent.createContent')}
                </h1>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {getContentTypeInfo(selectedType).description}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => {/* Language switching handled by context */}}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentLanguage === 'en'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                English
              </button>
              <button
                onClick={() => {/* Language switching handled by context */}}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentLanguage === 'ar'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                العربية
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="p-6">
                {/* Title */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('staticContent.title')}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('staticContent.content')} ({currentLanguage === 'en' ? 'English' : 'Arabic'})
                  </label>
                  <textarea
                    value={currentLanguage === 'en' ? formData.content : formData.contentAr}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [currentLanguage === 'en' ? 'content' : 'contentAr']: e.target.value 
                    })}
                    rows={12}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                {/* SEO Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('staticContent.seoTitle')}
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t('staticContent.version')}
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('staticContent.seoDescription')}
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('staticContent.seoKeywords')}
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder={t('staticContent.keywordsPlaceholder')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className={`ml-2 text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {t('staticContent.active')}
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <EyeIcon className="h-4 w-4 mr-2 inline" />
                    {t('staticContent.preview')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? t('common.saving') : (isEditing ? t('common.update') : t('common.create'))}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium">{t('staticContent.preview')}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <h1 className="text-2xl font-bold mb-4">{formData.title}</h1>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatContent(currentLanguage === 'en' ? formData.content : formData.contentAr) 
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('staticContent.title')}
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('staticContent.subtitle')}
          </p>
        </div>

        {/* Content Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const existingContent = contentList.find(c => c.type === type.value);
            
            return (
              <div
                key={type.value}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 transition-all hover:shadow-md ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className={`h-8 w-8 mr-3 ${
                      isDarkMode ? 'text-orange-400' : 'text-orange-600'
                    }`} />
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                  {existingContent && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      existingContent.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {existingContent.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCreateNew(type.value)}
                    className="flex-1 bg-custom-btnBg hover:bg-custom-btnBg/90 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {existingContent ? t('staticContent.edit') : t('staticContent.create')}
                  </button>
                  {existingContent && (
                    <button
                      onClick={() => handleDelete(existingContent)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Content List */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('staticContent.allContent')}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('common.loading')}
              </p>
            </div>
          ) : contentList.length === 0 ? (
            <div className="p-6 text-center">
              <DocumentDuplicateIcon className={`h-12 w-12 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('staticContent.noContent')}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('staticContent.createFirstContent')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {t('staticContent.type')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {t('staticContent.title')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {t('staticContent.version')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {t('common.status')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {t('staticContent.lastUpdated')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contentList.map((content) => {
                    const typeInfo = getContentTypeInfo(content.type);
                    const Icon = typeInfo.icon;
                    
                    return (
                      <tr key={content._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Icon className={`h-5 w-5 mr-3 ${
                              isDarkMode ? 'text-orange-400' : 'text-orange-600'
                            }`} />
                            <span className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {content.title}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {content.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            content.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {content.isActive ? t('common.active') : t('common.inactive')}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {formatDate(content.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(content)}
                              className={`text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300`}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(content)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaticContent;
