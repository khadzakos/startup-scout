import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoting } from '../hooks/useVoting';
import { useAuth } from '../hooks/useAuth';

interface VotingButtonsProps {
  projectId: string; // UUID
  upvotes: number;
  onVoteSuccess?: (projectId: string, upvotes: number) => void;
  className?: string;
}

export const VotingButtons: React.FC<VotingButtonsProps> = ({
  projectId,
  upvotes: initialUpvotes,
  onVoteSuccess,
  className = '',
}) => {
  const { user } = useAuth();
  const { vote, userVote, loading, loadingVote, removeVote, error, clearError } = useVoting(projectId);
  
  // Локальное состояние для отображения актуальных данных
  const [upvotes, setUpvotes] = useState(initialUpvotes);

  // Обновляем локальное состояние при изменении пропсов
  useEffect(() => {
    setUpvotes(initialUpvotes);
  }, [initialUpvotes]);

  const handleVote = async () => {
    if (!user || loading) return;
    
    console.log('Voting:', { projectId, currentUserVote: userVote });
    
    // Если пользователь уже поставил лайк, убираем его
    if (userVote === true) {
      console.log('Removing like');
      
      // Оптимистично обновляем UI
      setUpvotes(prev => prev - 1);
      
      const success = await removeVote(projectId);
      if (success) {
        console.log('Like removed successfully');
        handleVoteSuccess();
      } else {
        // Откатываем изменения при ошибке
        setUpvotes(prev => prev + 1);
      }
      return;
    }
    
    // Ставим новый лайк
    console.log('Adding new like');
    
    // Оптимистично обновляем UI
    setUpvotes(prev => prev + 1);
    
    const success = await vote(projectId);
    if (success) {
      console.log('Like added successfully');
      handleVoteSuccess();
    } else {
      // Откатываем изменения при ошибке
      setUpvotes(prev => prev - 1);
    }
  };

  const handleVoteSuccess = () => {
    if (onVoteSuccess) {
      onVoteSuccess(projectId, upvotes);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'p-3 rounded-lg transition-all duration-200 flex items-center justify-center';
    
    if (!user || loading) {
      return `${baseClasses} text-gray-400 cursor-not-allowed`;
    }
    
    if (userVote === true) {
      return `${baseClasses} bg-red-100 text-red-600 hover:bg-red-200`;
    }
    
    return `${baseClasses} text-gray-600 hover:bg-red-100 hover:text-red-600 hover:scale-110`;
  };

  const getButtonTitle = () => {
    if (!user) return 'Войдите, чтобы поставить лайк';
    if (loading) return 'Голосование...';
    
    if (userVote === true) {
      return 'Убрать лайк';
    }
    
    return 'Поставить лайк';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center justify-between">
          <div className="flex-1">
            <span>{error}</span>
            {error.includes('Please log in') && (
              <Link 
                to="/login" 
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Log in now
              </Link>
            )}
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 ml-2"
            title="Закрыть"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-2 border border-gray-200 shadow-sm">
        {/* Кнопка лайка */}
        <button
          onClick={handleVote}
          disabled={!user || loading}
          className={getButtonClasses()}
          title={getButtonTitle()}
        >
          {loading && userVote === true ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : userVote === true ? (
            <Heart className="w-5 h-5 fill-current" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
        </button>
        
        {/* Счетчик лайков */}
        <div className="px-4 text-lg font-bold text-gray-900 min-w-[3rem] text-center">
          {loadingVote ? (
            <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
          ) : (
            upvotes
          )}
        </div>
        
        {/* Текст */}
        <div className="ml-2 text-sm text-gray-600">
          {upvotes === 1 ? 'лайк' : upvotes < 5 ? 'лайка' : 'лайков'}
        </div>
      </div>
    </div>
  );
};
