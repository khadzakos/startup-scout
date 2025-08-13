import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, ExternalLink, MessageCircle } from 'lucide-react';
import { Project, VoteType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useVoting } from '../hooks/useVoting';

interface ProjectCardProps {
  project: Project;
  rank: number;
  onVoteSuccess?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, rank, onVoteSuccess }) => {
  const { user } = useAuth();
  const { vote, loading: votingLoading } = useVoting();

  const handleVote = async (type: VoteType) => {
    if (!user) return;
    
    const success = await vote(project.id, type);
    if (success && onVoteSuccess) {
      onVoteSuccess();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-primary-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-lg font-bold text-white">#{rank}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Link 
              to={`/project/${project.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {project.name}
            </Link>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {project.creators.slice(0, 3).map((creator, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full bg-secondary-500 border-2 border-white flex items-center justify-center shadow-sm ${
                      index > 0 ? '-ml-2' : ''
                    }`}
                    title={creator}
                  >
                    <span className="text-xs font-medium text-white">
                      {creator.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {project.creators.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-secondary-400 border-2 border-white -ml-2 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-medium text-white">+{project.creators.length - 3}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 text-gray-500">
                {project.website && (
                  <a 
                    href={project.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {project.telegram_contact && (
                  <a 
                    href={`https://t.me/${project.telegram_contact.replace('@', '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary-600 transition-colors"
                    title={`Telegram: ${project.telegram_contact}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
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
              
              <Link 
                to={`/project/${project.id}`}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                title="Открыть проект"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};