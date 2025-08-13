import { useState } from 'react';
import { apiClient } from '../api/client';
import { VoteType, VoteRequest } from '../types';

export const useVoting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = async (projectId: number, voteType: VoteType): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const voteData: VoteRequest = { vote_type: voteType };
      await apiClient.vote(projectId, voteData);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
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
    loading,
    error,
    clearError,
  };
}; 