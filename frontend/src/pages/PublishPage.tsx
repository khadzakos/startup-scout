import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { ProjectCreateRequest } from '../types';

export const PublishPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectCreateRequest>({
    name: '',
    description: '',
    full_description: '',
    images: [],
    creators: [''],
    telegram_contact: '',
    website: '',
  });

  const handleInputChange = (field: keyof ProjectCreateRequest, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreatorChange = (index: number, value: string) => {
    const newCreators = [...formData.creators];
    newCreators[index] = value;
    setFormData(prev => ({
      ...prev,
      creators: newCreators
    }));
  };

  const addCreator = () => {
    setFormData(prev => ({
      ...prev,
      creators: [...prev.creators, '']
    }));
  };

  const removeCreator = (index: number) => {
    if (formData.creators.length > 1) {
      const newCreators = formData.creators.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        creators: newCreators
      }));
    }
  };

  const addImage = () => {
    const url = prompt('Введите URL изображения:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Необходимо войти в систему');
      return;
    }

    // Валидация
    if (!formData.name.trim()) {
      setError('Название проекта обязательно');
      return;
    }

    if (!formData.description.trim()) {
      setError('Краткое описание обязательно');
      return;
    }

    if (!formData.full_description.trim()) {
      setError('Полное описание обязательно');
      return;
    }

    // Фильтруем пустых создателей
    const filteredCreators = formData.creators.filter(creator => creator.trim() !== '');

    setLoading(true);
    setError(null);

    try {
      const projectData = {
        ...formData,
        creators: filteredCreators
      };

      await apiClient.createProject(projectData);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании проекта');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Требуется авторизация</h2>
            <p className="text-secondary-600 mb-4">Войдите в систему, чтобы опубликовать проект</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-3 text-secondary-600 hover:text-secondary-900 transition-colors p-3 rounded-xl hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Назад к проектам</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8">
                      <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl">📝</span>
              </div>
              <h1 className="text-4xl font-bold text-secondary-900 mb-2">Опубликовать проект</h1>
              <p className="text-secondary-600 text-lg">Поделитесь своим проектом с сообществом</p>
            </div>

          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Название проекта */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-secondary-700 mb-2">
                Название проекта *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Введите название вашего проекта"
                required
              />
            </div>

            {/* Краткое описание */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-secondary-700 mb-2">
                Краткое описание *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
                rows={3}
                placeholder="Краткое описание проекта (отображается в карточке)"
                required
              />
            </div>

            {/* Полное описание */}
            <div>
              <label htmlFor="full_description" className="block text-sm font-semibold text-secondary-700 mb-2">
                Полное описание *
              </label>
              <textarea
                id="full_description"
                value={formData.full_description}
                onChange={(e) => handleInputChange('full_description', e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
                rows={6}
                placeholder="Подробное описание проекта, его особенности и преимущества"
                required
              />
            </div>

            {/* Создатели */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Создатели проекта
              </label>
              <div className="space-y-2">
                {formData.creators.map((creator, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={creator}
                      onChange={(e) => handleCreatorChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Имя создателя"
                    />
                    {formData.creators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCreator(index)}
                        className="px-4 py-3 text-error-600 hover:text-error-800 hover:bg-error-50 rounded-xl transition-all duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCreator}
                  className="flex items-center space-x-2 text-accent-600 hover:text-accent-700 transition-colors p-2 rounded-xl hover:bg-accent-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>Добавить создателя</span>
                </button>
              </div>
            </div>

            {/* Изображения */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Изображения проекта
              </label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.value;
                        handleInputChange('images', newImages);
                      }}
                      className="flex-1 px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="URL изображения"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-4 py-3 text-error-600 hover:text-error-800 hover:bg-error-50 rounded-xl transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center space-x-2 text-accent-600 hover:text-accent-700 transition-colors p-2 rounded-xl hover:bg-accent-50"
                >
                  <Upload className="w-5 h-5" />
                  <span>Добавить изображение</span>
                </button>
              </div>
            </div>

            {/* Контакты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telegram_contact" className="block text-sm font-semibold text-secondary-700 mb-2">
                  Telegram контакт
                </label>
                <input
                  type="text"
                  id="telegram_contact"
                  value={formData.telegram_contact}
                  onChange={(e) => handleInputChange('telegram_contact', e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="@username"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-secondary-700 mb-2">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-4 pt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white py-4 px-8 rounded-xl hover:from-accent-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                {loading ? 'Публикация...' : 'Опубликовать проект'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-8 py-4 border-2 border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-all duration-200 font-semibold text-lg"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
