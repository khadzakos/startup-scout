import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle } from 'lucide-react';

export const TelegramLoginRedirect: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleTelegramLogin = () => {
    setLoading(true);
    
    // Перенаправляем на Telegram OAuth
    const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=Startup_Scout_Bot&request_access=write&origin=${encodeURIComponent(window.location.origin)}`;
    window.location.href = telegramAuthUrl;
  };

  return (
    <button
      onClick={handleTelegramLogin}
      disabled={loading}
      className="w-full flex justify-center items-center space-x-3 py-3 px-4 border border-transparent rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <MessageCircle className="w-5 h-5" />
      )}
      <span>Войти через Telegram</span>
    </button>
  );
}; 