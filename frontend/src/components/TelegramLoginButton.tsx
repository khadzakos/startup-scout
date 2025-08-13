import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MessageCircle } from 'lucide-react';

export const TelegramLoginButton: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleTelegramLogin = () => {
    setLoading(true);
    
    // Создаем popup окно для Telegram авторизации
    const popup = window.open(
      'https://oauth.telegram.org/auth?bot_id=Startup_Scout_Bot&request_access=write&origin=http://127.0.0.1:3000',
      'telegram_login',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Слушаем сообщения от popup окна
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== 'https://oauth.telegram.org') {
        return;
      }

      if (event.data && event.data.type === 'telegram_auth') {
        try {
          const userData = event.data.user;
          
          // Преобразуем данные пользователя в формат, ожидаемый бэкендом
          const authParams = {
            id: userData.id.toString(),
            first_name: userData.first_name,
            last_name: userData.last_name || '',
            username: userData.username || '',
            photo_url: userData.photo_url || '',
            auth_date: userData.auth_date.toString(),
            hash: userData.hash,
          };

          await login('telegram', authParams);
          popup?.close();
          window.removeEventListener('message', handleMessage);
        } catch (error) {
          console.error('Telegram auth error:', error);
          alert('Ошибка авторизации через Telegram');
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Проверяем, закрылось ли окно
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setLoading(false);
      }
    }, 1000);
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