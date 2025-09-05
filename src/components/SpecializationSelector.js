import React, { useState, useEffect } from 'react';
import callAPI from '../services/callAPI';
import { useTheme } from '../contexts/ThemeContext';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const SpecializationSelector = ({ 
  selectedSpecializations = [], 
  onSpecializationsChange, 
  required = false,
  disabled = false,
  userType = 'seeker' // 'seeker', 'provider', 'admin'
}) => {
  const { isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await callAPI.get('/api/admin/categories');
      
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.isActive && 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (category) => {
    if (disabled) return;
    
    const isSelected = selectedSpecializations.some(spec => spec._id === category._id);
    
    if (isSelected) {
      // Remove category
      const updatedSpecializations = selectedSpecializations.filter(spec => spec._id !== category._id);
      onSpecializationsChange(updatedSpecializations);
    } else {
      // Add category
      const updatedSpecializations = [...selectedSpecializations, category];
      onSpecializationsChange(updatedSpecializations);
    }
  };

  const handleRemoveSpecialization = (categoryId) => {
    if (disabled) return;
    
    const updatedSpecializations = selectedSpecializations.filter(spec => spec._id !== categoryId);
    onSpecializationsChange(updatedSpecializations);
  };

  const isCategorySelected = (category) => {
    return selectedSpecializations.some(spec => spec._id === category._id);
  };

  const getValidationError = () => {
    if (required && userType !== 'admin' && selectedSpecializations.length === 0) {
      return 'At least one specialization is required';
    }
    return null;
  };

  const validationError = getValidationError();

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium transition-colors duration-300 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Specializations {required && userType !== 'admin' && <span className="text-red-500">*</span>}
      </label>
      
      {/* Selected Specializations */}
      {selectedSpecializations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSpecializations.map((specialization) => (
            <span
              key={specialization._id}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {specialization.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(specialization._id)}
                  className={`ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-300 ${
                    isDarkMode 
                      ? 'hover:bg-blue-500' 
                      : 'hover:bg-blue-200'
                  }`}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            validationError ? 'border-red-500' : ''
          }`}
        >
          {loading ? 'Loading categories...' : 'Select specializations...'}
        </button>

        {showDropdown && !disabled && (
          <div className={`absolute z-10 w-full mt-1 border rounded-md shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700' 
              : 'border-gray-300 bg-white'
          }`}>
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>

            {/* Categories List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className={`px-3 py-2 text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchTerm ? 'No categories found' : 'No categories available'}
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center justify-between ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <span>{category.name}</span>
                    {isCategorySelected(category) && (
                      <CheckIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <p className="text-sm text-red-500">{validationError}</p>
      )}

      {/* Help Text */}
      {userType === 'admin' && (
        <p className={`text-xs transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Admin users do not require specializations
        </p>
      )}
    </div>
  );
};

export default SpecializationSelector;
