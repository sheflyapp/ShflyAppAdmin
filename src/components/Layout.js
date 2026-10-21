import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChevronDoubleLeftIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

const SIDEBAR_KEY = 'adminSidebarCollapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch (e) {
    return false;
  }
};

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const navigation = [
    { name: t('common.dashboard'), href: '/', icon: HomeIcon },
    { name: t('common.users'), href: '/users', icon: UsersIcon },
    { name: t('common.providers'), href: '/providers', icon: UserGroupIcon },
    { name: t('common.seekers'), href: '/seekers', icon: UsersIcon },
    { name: t('common.consultations'), href: '/consultations', icon: ChatBubbleLeftRightIcon },
    { name: t('common.questions'), href: '/questions', icon: QuestionMarkCircleIcon },
    { name: t('common.categories'), href: '/categories', icon: Squares2X2Icon },
    { name: t('common.payments'), href: '/payments', icon: CreditCardIcon },
    { name: t('staticContent.title'), href: '/static-content', icon: DocumentTextIcon },
  ];

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const currentItem = navigation.find((item) => isActive(item.href));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, prev ? '0' : '1');
      } catch (e) {
        /* storage unavailable: keep in-memory state only */
      }
      return !prev;
    });
  };

  // Publish the desktop sidebar width so drawers can size themselves beside it
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '76px' : '256px');
  }, [collapsed]);

  // Close overlays on navigation
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const roleLabel =
    user?.userType === 'admin' ? t('users.admin')
      : user?.userType === 'provider' ? t('providers.title')
        : user?.userType === 'seeker' ? t('seekers.title')
          : t('users.user');

  const initials = (user?.fullname || user?.email || 'A')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  // `showLabels` is false only for the collapsed desktop rail
  const renderSidebar = ({ showLabels, onNavigate }) => (
    <>
      <div className={`flex h-16 shrink-0 items-center gap-3 px-4 ${showLabels ? '' : 'justify-center px-0'}`}>
        <img src="/logo.svg" alt="SHFLY" className="h-9 w-9 shrink-0 rounded-xl" />
        {showLabels && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-base font-bold tracking-tight text-fg">SHFLY</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-widest text-muted">Admin</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={onNavigate}
              title={showLabels ? undefined : item.name}
              className={`group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                showLabels ? 'px-3' : 'justify-center px-0'
              } ${
                active
                  ? 'bg-brand-soft text-brand'
                  : 'text-muted hover:bg-surface-2 hover:text-fg'
              }`}
            >
              {active && (
                <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-brand" aria-hidden="true" />
              )}
              <item.icon className="h-5 w-5 shrink-0" />
              {showLabels && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <button
          onClick={handleLogout}
          title={showLabels ? undefined : t('common.logout')}
          className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500 ${
            showLabels ? 'px-3' : 'justify-center px-0'
          }`}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0 rtl:-scale-x-100" />
          {showLabels && <span>{t('common.logout')}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-app text-fg transition-colors duration-300">
      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col border-e border-line bg-surface shadow-lift transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="btn-ghost absolute end-3 top-3 z-10"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          {renderSidebar({ showLabels: true, onNavigate: () => setMobileOpen(false) })}
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-30 hidden flex-col border-e border-line bg-surface transition-[width] duration-300 ease-in-out lg:flex ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {renderSidebar({ showLabels: !collapsed })}
      </aside>

      {/* Main column */}
      <div
        className={`flex h-screen flex-col transition-[padding] duration-300 ease-in-out ${
          collapsed ? 'lg:ps-[76px]' : 'lg:ps-64'
        }`}
      >
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/80 px-4 backdrop-blur-md sm:gap-3 sm:px-6">
          <button
            type="button"
            className="btn-ghost lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <button
            type="button"
            className="btn-ghost hidden lg:inline-flex"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronDoubleLeftIcon
              className={`h-5 w-5 transition-transform duration-300 ${
                collapsed ? 'rotate-180 rtl:rotate-0' : 'rtl:rotate-180'
              }`}
            />
          </button>

          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
            {currentItem?.name}
          </h1>

          <button
            onClick={toggleLanguage}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-sm font-medium text-fg transition hover:border-brand/50"
            title={currentLanguage === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <LanguageIcon className="h-4 w-4 text-muted" />
            <span>{currentLanguage === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg transition hover:border-brand/50"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5" />}
          </button>

          {/* Profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 items-center gap-2 rounded-xl ps-1 pe-1 transition hover:bg-surface-2 sm:pe-3"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-bold text-brand-fg">
                {initials}
              </span>
              <span className="hidden min-w-0 text-start leading-tight sm:block">
                <span className="block max-w-[140px] truncate text-sm font-medium">{user?.fullname}</span>
                <span className="block text-[11px] text-muted">{roleLabel}</span>
              </span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute end-0 top-full z-50 mt-2 w-64 origin-top animate-pop-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
              >
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-brand-fg">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user?.fullname}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                    <p className="text-xs font-medium text-brand">{roleLabel}</p>
                  </div>
                </div>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted transition hover:bg-red-500/10 hover:text-red-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 rtl:-scale-x-100" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
