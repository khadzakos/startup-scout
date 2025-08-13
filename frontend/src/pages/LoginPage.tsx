import React, { useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EmailLogin } from '../components/EmailLogin';
import { EmailRegister } from '../components/EmailRegister';
import { ENV_CONFIG } from '../config/env';
import { AuthType } from '../types';

export const LoginPage: React.FC = () => {
  const { user, loading, error } = useAuth();
  const [authLoading, setAuthLoading] = useState<AuthType | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleYandexLogin = async () => {
    setAuthLoading('yandex');
    try {
      // Для Yandex получаем код из URL
      const code = searchParams.get('code');
      if (code) {
        // Обработка Yandex callback
        // TODO: Добавить обработку Yandex авторизации
        console.log('Yandex code received:', code);
      } else {
        // Если кода нет, перенаправляем на Yandex OAuth
        const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${ENV_CONFIG.YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/login')}`;
        window.location.href = yandexAuthUrl;
      }
    } catch (error) {
      console.error('Yandex login failed:', error);
    } finally {
      setAuthLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">SS</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Добро пожаловать!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Войдите, чтобы голосовать за проекты и запускать свои
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Login/Register */}
            {isLogin ? (
              <EmailLogin onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <EmailRegister onSwitchToLogin={() => setIsLogin(true)} />
            )}

            {/* Разделитель */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">или</span>
              </div>
            </div>

            {/* Yandex Login */}
            <button
              onClick={handleYandexLogin}
              disabled={authLoading !== null}
              className="w-full flex justify-center items-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {authLoading === 'yandex' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  Я
                </span>
              )}
              <span>Войти через Яндекс</span>
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center">
              Авторизуясь, вы принимаете наши условия использования и политику конфиденциальности
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};