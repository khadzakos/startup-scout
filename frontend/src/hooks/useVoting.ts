import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './useAuth';

export const useVoting = (projectId?: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [loadingVote, setLoadingVote] = useState(false);

  // Загружаем лайк пользователя при изменении projectId
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!projectId || !user) {
        // Если нет projectId или пользователь не авторизован, сбрасываем голос
        setUserVote(false);
        return;
      }
      
      try {
        setLoadingVote(true);
        const votes = await apiClient.getUserVotes();
        
        // Проверяем, что votes и votes.votes существуют
        if (votes && votes.votes && Array.isArray(votes.votes)) {
          const projectVote = votes.votes.find(vote => vote.project_id === projectId);
          setUserVote(projectVote ? true : false);
        } else {
          // Если нет голосов или структура неверная, считаем что голоса нет
          setUserVote(false);
        }
      } catch (err) {
        console.error('Failed to fetch user vote:', err);
        // При ошибке (например, 401 для неавторизованных пользователей) 
        // считаем что голоса нет
        setUserVote(false);
      } finally {
        setLoadingVote(false);
      }
    };

    fetchUserVote();
  }, [projectId, user]);

  const vote = async (projectId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending vote request:', { projectId });
      
      await apiClient.vote(projectId);
      
      console.log('Vote successful');
      
      // Обновляем локальное состояние лайка
      setUserVote(true);
      
      return true;
    } catch (err) {
      console.error('Vote error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Authentication expired') || errorMessage.includes('401')) {
        setError('Please log in to vote for projects');
      } else {
        setError(errorMessage);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeVote = async (projectId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Sending remove vote request:', { projectId });
      
      await apiClient.removeVote(projectId);
      
      console.log('Remove vote successful');
      
      // Убираем локальное состояние лайка
      setUserVote(false);
      
      return true;
    } catch (err) {
      console.error('Remove vote error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove vote';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Authentication expired') || errorMessage.includes('401')) {
        setError('Please log in to manage your votes');
      } else {
        setError(errorMessage);
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    vote,
    removeVote,
    userVote,
    loading,
    loadingVote,
    error,
    clearError,
  };
}; 