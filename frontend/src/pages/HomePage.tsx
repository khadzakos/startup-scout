import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useStats';
import { Loader2, TrendingUp, Users } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { projects, loading, error, fetchProjects, updateProjectVotes } = useProjects();
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useStats();
  const navigate = useNavigate();

  const handleVoteSuccess = (projectId: string, upvotes: number) => {
    console.log('Vote success:', { projectId, upvotes });
    updateProjectVotes(projectId, upvotes);
  };

  // Сортируем проекты по количеству лайков
  const sortedProjects = [...projects].sort((a, b) => b.upvotes - a.upvotes);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-secondary-600 font-medium">Загружаем проекты...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-error-500 text-2xl">⚠️</div>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-secondary-600 mb-6">{error}</p>
            <button
              onClick={fetchProjects}
              className="px-6 py-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-fire-gradient">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Startup Scout
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Откройте для себя лучшие новые продукты и расскажите о своем!
            </p>
            {user && (
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/publish')}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Опубликовать проект
                </button>
                <button 
                  onClick={() => {
                    const projectsSection = document.getElementById('projects-section');
                    if (projectsSection) {
                      projectsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Просмотреть проекты
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">{sortedProjects.length}</h3>
            <p className="text-secondary-600">Активных проектов</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-2">
              {statsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                stats?.user_count?.toLocaleString() || '0'
              )}
            </h3>
            <p className="text-secondary-600">Участников</p>
          </div>
        </div>

                  {/* Projects Section */}
          <div id="projects-section" className="mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              🚀 Проекты этой недели
            </h2>
            <p className="text-secondary-600 text-lg">
              Голосуйте за лучшие проекты и помогайте им расти
            </p>
          </div>

        <div className="space-y-6">
          {sortedProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              rank={index + 1}
              onVoteSuccess={() => handleVoteSuccess(project.id, project.upvotes)}
            />
          ))}
        </div>

                  {sortedProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-2xl font-semibold text-secondary-900 mb-4">
                Пока нет проектов
              </h3>
              <p className="text-secondary-600 text-lg mb-8">
                Станьте первым, кто запустит проект на этой неделе!
              </p>
                          {user && (
                <button 
                  onClick={() => navigate('/publish')}
                  className="px-8 py-4 bg-accent-500 text-white rounded-xl font-semibold hover:bg-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Опубликовать первый проект
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};