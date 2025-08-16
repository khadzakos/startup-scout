import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  MessageCircle,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { useProject } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useVoting } from '../hooks/useVoting';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { VoteType } from '../types';
import { Loader2 } from 'lucide-react';
import { Comments } from '../components/Comments';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id ? parseInt(id, 10) : 0;
  const { project, loading, error, fetchProject } = useProject(projectId);
  const { user } = useAuth();
  const { vote, loading: votingLoading } = useVoting();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Проект не найден</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            ← Вернуться к проектам
          </Link>
        </div>
      </div>
    );
  }

  const handleVote = async (type: VoteType) => {
    if (!user) return;
    
    const success = await vote(project.id, type);
    if (success) {
      fetchProject(); // Обновляем данные проекта после голосования
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        to="/"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Назад к проектам</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              </div>
              
              <p className="text-lg text-gray-600 mb-4">
                {project.description}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Запущен {format(new Date(project.created_at), 'd MMM yyyy', { locale: ru })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user || votingLoading}
                  className={`p-2 rounded-md transition-colors ${
                    user && !votingLoading
                      ? 'hover:bg-green-100 hover:text-green-600 text-gray-600' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  title={user ? 'Проголосовать за' : 'Войдите, чтобы голосовать'}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                
                <span className="px-2 text-sm font-semibold text-gray-900 min-w-[2rem] text-center">
                  {project.rating}
                </span>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user || votingLoading}
                  className={`p-2 rounded-md transition-colors ${
                    user && !votingLoading
                      ? 'hover:bg-red-100 hover:text-red-600 text-gray-600' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  title={user ? 'Проголосовать против' : 'Войдите, чтобы голосовать'}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">О проекте</h3>
            <p className="text-gray-700 leading-relaxed">
              {project.full_description}
            </p>
          </div>

          {/* Creators */}
          {project.creators.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Создатели</h3>
              <div className="flex flex-wrap gap-2">
                {project.creators.map((creator, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                  >
                    {creator}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ссылки</h3>
            <div className="flex flex-wrap gap-3">
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Веб-сайт</span>
                </a>
              )}
              {project.telegram_contact && (
                <a
                  href={`https://t.me/${project.telegram_contact.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
              )}
            </div>
          </div>

          {/* Images */}
          {project.images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Галерея</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${project.name} - изображение ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <Comments projectId={project.id} />
        </div>
      </div>
    </div>
  );
};