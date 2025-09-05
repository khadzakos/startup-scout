import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Loader2, Heart, Camera, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { Vote, Project } from '../types';
import { Avatar } from '../components/Avatar';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || ''
  });
  const [showAllLikes, setShowAllLikes] = useState(false);
  const [showAllLaunches, setShowAllLaunches] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [, votesData, projectsData] = await Promise.all([
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

  // Обновляем profileData при изменении user
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleAvatarUpload = async (imageUrl: string) => {
    if (!user) return;
    
    setAvatarLoading(true);
    setError(null); // Сбрасываем предыдущие ошибки
    try {
      await apiClient.updateAvatar(imageUrl);
      // Закрываем форму редактирования
      setIsEditingAvatar(false);
    } catch (err) {
      console.error('Failed to update avatar:', err);
      setError('Не удалось обновить аватарку');
      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => setError(null), 5000);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    setError(null); // Сбрасываем предыдущие ошибки
    try {
      const response = await apiClient.updateProfile(profileData);
      // Обновляем состояние пользователя с новыми данными
      if (response.user) {
        updateUser(response.user);
      }
      // Закрываем форму редактирования
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Не удалось обновить профиль');
      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => setError(null), 5000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setAvatarLoading(true);
    try {
      const result = await apiClient.uploadImage(file);
      await handleAvatarUpload(result.image_url);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError('Не удалось загрузить аватарку');
      // Автоматически скрываем ошибку через 5 секунд
      setTimeout(() => setError(null), 5000);
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Требуется авторизация</h2>
            <p className="text-secondary-600 mb-4">Войдите в систему, чтобы просмотреть профиль</p>
            <Link
              to="/login"
              className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    );
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

  const likes = votes?.length || 0; // Теперь все голоса - это лайки
  const launches = userProjects?.length || 0; // Количество запущенных проектов

  // Функция для получения названия проекта по ID
  const getProjectName = (projectId: string): string => {
    const project = projects?.find(p => p.id === projectId);
    return project ? project.name : `Проект #${projectId}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar
              src={user.avatar}
              alt={user.username}
              size="xl"
              className="ring-4 ring-primary-100"
            />
            <button
              onClick={() => {
                setIsEditingAvatar(!isEditingAvatar);
                setError(null); // Сбрасываем ошибки при открытии/закрытии
              }}
              className="absolute -bottom-1 -right-1 bg-accent-500 text-white rounded-full p-2 hover:bg-accent-600 transition-colors shadow-lg"
              title="Изменить аватарку"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user.username
                }
              </h1>
              <button
                onClick={() => {
                  setIsEditingProfile(!isEditingProfile);
                  setError(null); // Сбрасываем ошибки при открытии/закрытии
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Редактировать профиль"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 mb-1">{user.email}</p>
            {user.first_name && user.last_name && (
              <p className="text-sm text-gray-500">@{user.username}</p>
            )}
          </div>
        </div>

        {/* Avatar Upload Section */}
        {isEditingAvatar && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Изменить аватарку
              </h3>
              <button
                onClick={() => {
                  setIsEditingAvatar(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Закрыть"
              >
                ×
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors cursor-pointer"
              >
                Выбрать файл
              </label>
              <span className="text-sm text-gray-600">
                JPG, PNG до 5MB
              </span>
            </div>
            {avatarLoading && (
              <div className="mt-3 flex items-center text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Загружаем аватарку...
              </div>
            )}
          </div>
        )}

        {/* Profile Edit Section */}
        {isEditingProfile && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Редактировать профиль
              </h3>
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Закрыть"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Введите имя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия
                </label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Введите фамилию"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Введите имя пользователя"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setError(null); // Сбрасываем ошибки при отмене
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={profileLoading}
                className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50"
              >
                {profileLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Сохраняем...
                  </div>
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </div>
        )}

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

      {/* My Launches */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Rocket className="w-5 h-5 text-accent-600" />
          <h2 className="text-xl font-semibold text-gray-900">Мои запуски</h2>
        </div>

        <div className="space-y-4">
          {userProjects.length > 0 ? (
            <>
              {(showAllLaunches ? userProjects : userProjects.slice(0, 10)).map(project => (
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
              ))}
              
              {userProjects.length > 10 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllLaunches(!showAllLaunches)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {showAllLaunches ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Показать меньше
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Показать все ({userProjects.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
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
      </div>

      {/* Recent Votes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Мои лайки</h2>
        </div>

        <div className="space-y-4">
          {votes && votes.length > 0 ? (
            <>
              {(showAllLikes ? votes : votes.slice(0, 10)).map(vote => (
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
              ))}
              
              {votes.length > 10 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllLikes(!showAllLikes)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {showAllLikes ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Показать меньше
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Показать все ({votes.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
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
      </div>
    </div>
  );
};