import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from './Avatar';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 text-primary-600 hover:text-primary-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">SS</span>
              </div>
              <span className="text-2xl font-bold text-secondary-900">
                Startup Scout
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-2">
              <Link
                to="/"
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-accent-600 bg-accent-50 shadow-sm' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                Главная
              </Link>
              <Link
                to="/about"
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive('/about') 
                    ? 'text-accent-600 bg-accent-50 shadow-sm' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                О проекте
              </Link>
              {user && (
                <>
                  <Link
                    to="/publish"
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive('/publish') 
                        ? 'text-accent-600 bg-accent-50 shadow-sm' 
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                    }`}
                  >
                    Опубликовать
                  </Link>
                  <Link
                    to="/profile"
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive('/profile') 
                        ? 'text-accent-600 bg-accent-50 shadow-sm' 
                        : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                    }`}
                  >
                    Профиль
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile"
                  className="flex items-center space-x-3 text-secondary-700 hover:text-secondary-900 transition-colors p-2 rounded-xl hover:bg-secondary-50"
                >
                  <Avatar 
                    src={user.avatar} 
                    alt={user.username}
                    size="md"
                    className="ring-2 ring-primary-100 shadow-md"
                  />
                  <span className="hidden sm:block text-sm font-semibold">{user.username}</span>
                </Link>
                                  <button
                    onClick={logout}
                    className="p-3 text-secondary-500 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all duration-200"
                    title="Выйти"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-3 rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <LogIn className="w-5 h-5" />
                <span>Войти</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};