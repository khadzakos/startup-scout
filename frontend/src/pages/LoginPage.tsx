import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EmailLogin } from '../components/EmailLogin';
import { EmailRegister } from '../components/EmailRegister';

export const LoginPage: React.FC = () => {
  const { user, loading, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (user) {
    return <Navigate to="/" replace />;
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-float-delayed"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl">SS</span>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-secondary-900">
            Добро пожаловать!
          </h2>
          <p className="mt-2 text-lg text-secondary-600">
            Войдите, чтобы голосовать за проекты и запускать свои
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-sm py-10 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Login/Register */}
            {isLogin ? (
              <EmailLogin onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <EmailRegister onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>

          <div className="mt-8">
            <p className="text-xs text-secondary-500 text-center leading-relaxed">
              Авторизуясь, вы принимаете наши условия использования и политику конфиденциальности
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};