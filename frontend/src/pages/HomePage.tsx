import React from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { useProjects } from '../hooks/useProjects';
import { Loader2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { projects, loading, error, fetchProjects } = useProjects();

  // Сортируем проекты по рейтингу
  const sortedProjects = [...projects].sort((a, b) => b.rating - a.rating);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-red-400 text-lg mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Проекты этой недели
        </h1>
        <p className="text-gray-600">
          Откройте для себя лучшие новые продукты, запущенные сегодня
        </p>
      </div>

      <div className="space-y-4">
        {sortedProjects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            rank={index + 1}
            onVoteSuccess={fetchProjects}
          />
        ))}
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Пока нет проектов
          </h3>
          <p className="text-gray-600">
            Станьте первым, кто запустит проект на этой неделе!
          </p>
        </div>
      )}
    </div>
  );
};