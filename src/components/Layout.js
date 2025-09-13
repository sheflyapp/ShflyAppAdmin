import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  CreditCardIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: t('common.dashboard'), href: '/', icon: HomeIcon },
    { name: t('common.users'), href: '/users', icon: UsersIcon },
    { name: t('common.providers'), href: '/providers', icon: UserGroupIcon },
    { name: t('common.seekers'), href: '/seekers', icon: UsersIcon },
    { name: t('common.consultations'), href: '/consultations', icon: ChatBubbleLeftRightIcon },
    { name: t('common.questions'), href: '/questions', icon: QuestionMarkCircleIcon },
    { name: t('common.categories'), href: '/categories', icon: Squares2X2Icon },
    { name: t('common.payments'), href: '/payments', icon: CreditCardIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setProfileDropdownOpen(false);
    setIsHoveringDropdown(false);
  };

  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
        setIsHoveringDropdown(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Set initial mobile state
    handleResize();

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setIsHoveringDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-custom-dark text-white' 
        : 'bg-custom-light text-gray-900'
    }`} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
        sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          sidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`} onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 flex w-64 flex-col transition-all duration-300 ease-in-out transform ${
          currentLanguage === 'ar' ? 'right-0' : 'left-0'
        } ${
          sidebarOpen 
            ? 'translate-x-0' 
            : currentLanguage === 'ar' ? 'translate-x-full' : '-translate-x-full'
        } ${
          isDarkMode 
            ? `bg-gray-800 ${currentLanguage === 'ar' ? 'border-l border-gray-700' : 'border-r border-gray-700'}`
            : 'bg-white border-r border-gray-200'
        }`}>
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-x-3">
              <img 
                src="/logo.svg" 
                alt="SHFLY Logo" 
                className="h-8 w-8 transition-all duration-300"
              />
                              <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>SHFLY ADMIN</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 transition-all duration-500 ease-in-out">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  isActive(item.href)
                    ? isDarkMode 
                      ? 'bg-custom-btnBg text-white shadow-lg' 
                      : 'bg-custom-btnBg/10 text-custom-btnBg'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    currentLanguage === 'ar' ? 'ml-3' : 'mr-3'
                  } ${
                    isActive(item.href) 
                      ? isDarkMode ? 'text-white' : 'text-custom-btnBg'
                      : isDarkMode 
                        ? 'text-gray-400 group-hover:text-gray-300' 
                        : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Logout section at bottom for mobile */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 transition-all duration-500 ease-in-out">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-x-2 px-3 py-2 text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 rounded-md transition-all duration-200 hover:scale-105"
            >
              <ArrowRightOnRectangleIcon className={`h-5 w-5 flex-shrink-0 ${
                currentLanguage === 'ar' ? 'ml-2' : 'mr-2'
              }`} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-500 ease-in-out ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      } ${currentLanguage === 'ar' ? 'lg:right-0 sidebar-rtl' : 'lg:left-0'}`}>
        <div className={`flex flex-col flex-grow transition-colors duration-300 ${
          isDarkMode 
            ? `bg-gray-800 ${currentLanguage === 'ar' ? 'border-l border-gray-700' : 'border-r border-gray-700'}`
            : `bg-white ${currentLanguage === 'ar' ? 'border-l border-gray-200' : 'border-r border-gray-200'}`
        }`}>
          <div className="flex h-16 items-center px-4 overflow-hidden">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-x-3 transition-all duration-500 ease-in-out">
                <img 
                  src="/logo.svg" 
                  alt="SHFLY Logo" 
                  className="h-12 w-auto transition-all duration-500 ease-in-out"
                />
                <h1 className={`text-xl font-semibold transition-all duration-500 ease-in-out ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>SHFLY ADMIN</h1>
              </div>
            ) : (
              <img 
                src="/logo.svg" 
                alt="SHFLY Logo" 
                className="h-16 w-16 transition-all duration-500 ease-in-out"
              />
            )}
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 transition-all duration-500 ease-in-out">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  isActive(item.href)
                    ? isDarkMode 
                      ? 'bg-custom-btnBg text-white shadow-lg' 
                      : 'bg-custom-btnBg/10 text-custom-btnBg'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    sidebarCollapsed 
                      ? '' 
                      : currentLanguage === 'ar' ? 'ml-3' : 'mr-3'
                  } ${
                    isActive(item.href) 
                      ? isDarkMode ? 'text-white' : 'text-custom-btnBg'
                      : isDarkMode 
                        ? 'text-gray-400 group-hover:text-gray-300' 
                        : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className={`transition-all duration-500 ease-in-out ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                }`}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Logout section at bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 transition-all duration-500 ease-in-out">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-x-2 px-3 py-2 text-sm font-medium text-white bg-custom-btnBg hover:bg-custom-btnBg/90 rounded-md transition-all duration-200 hover:scale-105 ${
                sidebarCollapsed ? 'justify-center' : 'justify-start'
              }`}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <ArrowRightOnRectangleIcon className={`h-5 w-5 flex-shrink-0 ${
                sidebarCollapsed ? '' : (currentLanguage === 'ar' ? 'ml-2' : 'mr-2')
              }`} />
              <span className={`transition-all duration-500 ease-in-out ${
                sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
              }`}>
                {t('common.logout')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`main-content transition-all duration-500 ease-in-out ${
        currentLanguage === 'ar' 
          ? (sidebarCollapsed ? 'lg:pr-16' : 'lg:pr-64')
          : (sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')
      } ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Top bar */}
        <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-lg transition-colors duration-300 sm:gap-x-6px-4 ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-900 shadow-gray-900/50' 
            : 'border-gray-200 bg-white shadow-gray-200/50'
        }`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            } lg:hidden`}
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Desktop sidebar toggle button */}
          <button
            type="button"
            className={`hidden lg:flex -m-2.5 p-2.5 transition-all duration-200 hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            } rounded-lg`}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <Bars3Icon className="h-6 w-6" />
            ) : (
              <XMarkIcon className="h-6 w-6" />
            )}
          </button>

          <div className={`flex flex-1 gap-x-4 self-stretch lg:gap-x-6 ${
            currentLanguage === 'ar' ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <div className="flex flex-1"></div>
            <div className={`flex items-center gap-x-4 lg:gap-x-6 ${
              currentLanguage === 'ar' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className={`p-2 px-3 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`Switch to ${currentLanguage === 'en' ? 'Arabic' : 'English'}`}
              >
                <span className="text-sm font-medium">
                  {currentLanguage === 'en' ? 'AR' : 'EN'}
                </span>
              </button>
              
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              {/* User menu */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={isMobile ? toggleProfileDropdown : undefined}
                  onMouseEnter={!isMobile ? () => {
                    setProfileDropdownOpen(true);
                    setIsHoveringDropdown(true);
                  } : undefined}
                  onMouseLeave={!isMobile ? () => {
                    setIsHoveringDropdown(false);
                    // Delay closing to allow moving to dropdown
                    setTimeout(() => {
                      if (!isHoveringDropdown) {
                        setProfileDropdownOpen(false);
                      }
                    }, 150);
                  } : undefined}
                  className="flex items-center gap-x-3 p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserCircleIcon className={`h-8 w-8 transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-400'
                  }`} />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <>
                    {/* Invisible bridge to prevent gap */}
                    <div 
                      className="absolute right-0 top-full w-64 h-2 bg-transparent"
                      onMouseEnter={!isMobile ? () => {
                        setIsHoveringDropdown(true);
                        setProfileDropdownOpen(true);
                      } : undefined}
                    />
                                          <div 
                      className="absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                      onMouseEnter={!isMobile ? () => {
                        setIsHoveringDropdown(true);
                        setProfileDropdownOpen(true);
                      } : undefined}
                      onMouseLeave={!isMobile ? () => {
                        setIsHoveringDropdown(false);
                        setTimeout(() => {
                          if (!isHoveringDropdown) {
                            setProfileDropdownOpen(false);
                          }
                        }, 150);
                      } : undefined}
                    >
                    <div className="py-1">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-x-3">
                          <UserCircleIcon className={`h-10 w-10 transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-400'
                          }`} />
                          <div>
                            <div className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{user?.fullname}</div>
                            <div className={`text-xs transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{user?.email}</div>
                            <div className={`text-xs font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-custom-btnBg' : 'text-custom-btnBg'
                            }`}>
                              {user?.userType === 'admin' ? t('users.admin') : 
                               user?.userType === 'provider' ? t('providers.title') : 
                               user?.userType === 'seeker' ? t('seekers.title') : t('users.user')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Logout Option */}
                      <button
                        onClick={() => {
                          closeProfileDropdown();
                          handleLogout();
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-x-2">
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          <span>{t('common.logout')}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  </>
                )}
              </div>


            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;


