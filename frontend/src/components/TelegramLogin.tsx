import React, { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void;
    };
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

export const TelegramLogin: React.FC = () => {
  const { login } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Добавляем глобальную функцию для обработки авторизации
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        console.log('Telegram auth received:', user);
        
        // Преобразуем данные пользователя в формат, ожидаемый бэкендом
        const authParams = {
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name || '',
          username: user.username || '',
          photo_url: user.photo_url || '',
          auth_date: user.auth_date.toString(),
          hash: user.hash,
        };

        // Вызываем функцию логина из контекста аутентификации
        await login('telegram', authParams);
      } catch (error) {
        console.error('Telegram auth error:', error);
        alert('Ошибка авторизации через Telegram');
      }
    };

    // Загружаем Telegram Widget скрипт
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    
    // Конфигурация виджета согласно документации
    script.setAttribute('data-telegram-login', 'Startup_Scout_Bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-show-user-photo', 'true');

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Очистка при размонтировании
    return () => {
      if (containerRef.current) {
        const scripts = containerRef.current.querySelectorAll('script');
        scripts.forEach(s => s.remove());
      }
      // @ts-ignore
      delete window.onTelegramAuth;
    };
  }, [login]);

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="telegram-login-container">
        {/* Fallback если виджет не загрузился */}
        <div className="text-center text-gray-500 text-sm">
          Загрузка Telegram виджета...
        </div>
      </div>
    </div>
  );
}; 