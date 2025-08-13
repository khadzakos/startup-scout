import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Trophy, ThumbsUp, Rocket, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { Vote, ProfileResponse } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [profileData, votesData] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getUserVotes()
        ]);
        
        setVotes(votesData.votes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ошибка загрузки профиля
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalVotes = votes.length;
  const upvotes = votes.filter(v => v.vote_type === 'up').length;
  const downvotes = votes.filter(v => v.vote_type === 'down').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start space-x-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {user.auth_type === 'telegram' ? 'Telegram' : 'Яндекс'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalVotes}</div>
            <div className="text-sm text-gray-600">Всего голосов</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg mx-auto mb-2">
              <Rocket className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{upvotes}</div>
            <div className="text-sm text-gray-600">Положительных</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-secondary-100 rounded-lg mx-auto mb-2">
              <Trophy className="w-5 h-5 text-secondary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{downvotes}</div>
            <div className="text-sm text-gray-600">Отрицательных</div>
          </div>
        </div>
      </div>

      {/* Recent Votes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ThumbsUp className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Мои голоса</h2>
        </div>

        <div className="space-y-4">
          {votes.length > 0 ? (
            votes.slice(0, 10).map(vote => (
              <div 
                key={vote.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Проект #{vote.project_id}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        vote.vote_type === 'up' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vote.vote_type === 'up' ? '👍 За' : '👎 Против'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(vote.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Пока нет голосов
              </h3>
              <p className="text-gray-600">
                Проголосуйте за проекты, чтобы увидеть их здесь
              </p>
            </div>
          )}
        </div>

        {votes.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Показано 10 из {votes.length} голосов
            </p>
          </div>
        )}
      </div>
    </div>
  );
};