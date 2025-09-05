import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MessageCircle } from 'lucide-react';
import { Project } from '../types';
import { VotingButtons } from './VotingButtons';
import { Avatar } from './Avatar';

interface ProjectCardProps {
  project: Project;
  rank: number;
  onVoteSuccess?: (projectId: string, upvotes: number) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, rank, onVoteSuccess }) => {
  const handleVoteSuccess = () => {
    if (onVoteSuccess) {
      onVoteSuccess(project.id, project.upvotes);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-8 hover:shadow-xl transition-all duration-300 hover:border-primary-300 group">
      <div className="flex items-start space-x-6">
        {/* Logo or Rank Badge */}
        <div className="flex-shrink-0">
          {project.logo && project.logo.trim() !== '' ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-xl font-bold text-white">#{rank}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Project Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Link 
                  to={`/project/${project.id}`}
                  className="text-2xl font-bold text-secondary-900 hover:text-primary-600 transition-colors group-hover:text-primary-600"
                >
                  {project.name}
                </Link>
                {project.logo && project.logo.trim() !== '' && (
                  <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    #{rank}
                  </div>
                )}
              </div>
              <p className="text-secondary-600 text-lg line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>


          {/* Creators and Links */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {project.creators.slice(0, 3).map((creator, index) => (
                  <div
                    key={index}
                    className={`${index > 0 ? '-ml-2' : ''}`}
                    title={creator}
                  >
                    <Avatar
                      alt={creator}
                      size="sm"
                      className="border-2 border-white shadow-md"
                    />
                  </div>
                ))}
                {project.creators.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-secondary-300 border-2 border-white -ml-2 flex items-center justify-center shadow-md">
                    <span className="text-sm font-semibold text-white">+{project.creators.length - 3}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {project.website && (
                  <a 
                    href={project.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary-100 rounded-lg hover:bg-primary-100 hover:text-primary-600 transition-all duration-200"
                    title="Веб-сайт"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {project.telegram_contact && (
                  <a 
                    href={`https://t.me/${project.telegram_contact.replace('@', '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200"
                    title={`Telegram: ${project.telegram_contact}`}
                  >
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c-.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Voting Section */}
            <div className="flex items-center space-x-4">
              <VotingButtons
                projectId={project.id}
                upvotes={project.upvotes}
                onVoteSuccess={handleVoteSuccess}
              />
              
              <Link 
                to={`/project/${project.id}`}
                className="p-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                title="Открыть проект"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};