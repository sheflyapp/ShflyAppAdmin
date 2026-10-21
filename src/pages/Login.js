import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import {
  EyeIcon,
  EyeSlashIcon,
  SunIcon,
  MoonIcon,
  LanguageIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Login = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: UserGroupIcon, label: t('common.providers') },
    { icon: ChartBarIcon, label: t('common.consultations') },
    { icon: ShieldCheckIcon, label: t('common.payments') },
  ];

  return (
    <div className="grid min-h-screen bg-app text-fg transition-colors duration-300 lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-orange-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -start-20 h-96 w-96 rounded-full bg-black/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <img src="/logo.svg" alt="SHFLY" className="h-11 w-11 rounded-xl bg-white/90 p-1" />
          <span className="text-xl font-bold tracking-tight">SHFLY ADMIN</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">{t('auth.heroTitle')}</h2>
          <p className="mt-4 text-lg text-white/80">{t('auth.heroSubtitle')}</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {features.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur"
              >
                <Icon className="h-4 w-4" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} SHFLY</p>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="absolute end-4 top-4 flex items-center gap-2 sm:end-6 sm:top-6">
          <button
            onClick={toggleLanguage}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-medium transition hover:border-brand/50"
            title={currentLanguage === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <LanguageIcon className="h-4 w-4 text-muted" />
            {currentLanguage === 'en' ? 'العربية' : 'EN'}
          </button>
          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface transition hover:border-brand/50"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo.svg" alt="SHFLY" className="h-11 w-11 rounded-xl" />
            <span className="text-xl font-bold tracking-tight">SHFLY ADMIN</span>
          </div>

          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
            <p className="mt-1.5 text-sm text-muted">{t('auth.loginSubtitle')}</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-600 dark:text-red-300"
                >
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  {t('common.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  {t('common.password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pe-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 end-0 flex items-center px-3.5 text-muted transition hover:text-fg"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  t('common.login')
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted">{t('auth.adminOnly')}</p>
        </div>
      </main>
    </div>
  );
};

export default Login;
