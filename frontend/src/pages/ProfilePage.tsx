import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Rocket, Loader2, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { Vote, ProfileResponse, Project } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [profileData, votesData, projectsData] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getUserVotes(),
          apiClient.getProjects()
        ]);
        
        setVotes(votesData.votes);
        setProjects(projectsData.projects);
        
        // Получаем проекты пользователя
        if (user.id) {
          try {
            const userProjectsData = await apiClient.getUserProjects(user.id);
            setUserProjects(userProjectsData.projects || []);
          } catch (err) {
            console.warn('Failed to load user projects:', err);
            setUserProjects([]);
          }
        }
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

  const likes = votes.length; // Теперь все голоса - это лайки
  const launches = userProjects?.length || 0; // Количество запущенных проектов

  // Функция для получения названия проекта по ID
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : `Проект #${projectId}`;
  };

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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-accent-100 rounded-lg mx-auto mb-2">
              <Rocket className="w-5 h-5 text-accent-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{launches}</div>
            <div className="text-sm text-gray-600">Запусков</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{likes}</div>
            <div className="text-sm text-gray-600">Лайков</div>
          </div>
        </div>
      </div>

      {/* Recent Votes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Мои лайки</h2>
        </div>

        <div className="space-y-4">
          {votes.length > 0 ? (
            votes.slice(0, 10).map(vote => (
              <div 
                key={vote.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/project/${vote.project_id}`}
                      className="block text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {getProjectName(vote.project_id)}
                    </Link>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        ❤️ Лайк
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(vote.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link 
                      to={`/project/${vote.project_id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Перейти к проекту →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Пока нет лайков
              </h3>
              <p className="text-gray-600">
                Поставьте лайки проектам, чтобы увидеть их здесь
              </p>
            </div>
          )}
        </div>

        {votes.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Показано 10 из {votes.length} лайков
            </p>
          </div>
        )}
      </div>

      {/* My Launches */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Rocket className="w-5 h-5 text-accent-600" />
          <h2 className="text-xl font-semibold text-gray-900">Мои запуски</h2>
        </div>

        <div className="space-y-4">
          {userProjects.length > 0 ? (
            userProjects.slice(0, 10).map(project => (
              <div 
                key={project.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/project/${project.id}`}
                      className="block text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-800">
                        🚀 Запущен
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('ru-RU')}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">{project.upvotes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link 
                      to={`/project/${project.id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Перейти к проекту →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Пока нет запусков
              </h3>
              <p className="text-gray-600">
                Опубликуйте свой первый проект, чтобы увидеть его здесь
              </p>
              <Link 
                to="/publish"
                className="inline-flex items-center mt-3 px-4 py-2 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-colors"
              >
                Опубликовать проект
              </Link>
            </div>
          )}
        </div>

        {userProjects.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Показано 10 из {userProjects.length} проектов
            </p>
          </div>
        )}
      </div>
    </div>
  );
};