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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
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