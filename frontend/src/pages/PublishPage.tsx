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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 mb-4">Войдите в систему, чтобы опубликовать проект</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к проектам</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Опубликовать проект</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Название проекта */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Название проекта *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Введите название вашего проекта"
              required
            />
          </div>

          {/* Краткое описание */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Краткое описание *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Краткое описание проекта (отображается в карточке)"
              required
            />
          </div>

          {/* Полное описание */}
          <div>
            <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-2">
              Полное описание *
            </label>
            <textarea
              id="full_description"
              value={formData.full_description}
              onChange={(e) => handleInputChange('full_description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="Подробное описание проекта, его особенности и преимущества"
              required
            />
          </div>

          {/* Создатели */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Создатели проекта
            </label>
            <div className="space-y-2">
              {formData.creators.map((creator, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => handleCreatorChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Имя создателя"
                  />
                  {formData.creators.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCreator(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCreator}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить создателя</span>
              </button>
            </div>
          </div>

          {/* Изображения */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="URL изображения"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Добавить изображение</span>
              </button>
            </div>
          </div>

          {/* Контакты */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telegram_contact" className="block text-sm font-medium text-gray-700 mb-2">
                Telegram контакт
              </label>
              <input
                type="text"
                id="telegram_contact"
                value={formData.telegram_contact}
                onChange={(e) => handleInputChange('telegram_contact', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Веб-сайт
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Публикация...' : 'Опубликовать проект'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
