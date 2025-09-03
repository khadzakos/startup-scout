import { useState, useEffect } from 'react';
import { Comment } from '../types';
import { apiClient } from '../api/client';

export const useComments = (projectId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getProjectComments(projectId);
      setComments(response.comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      const newComment = await apiClient.createComment(projectId, content);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      await apiClient.updateComment(commentId, content);
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, content, updated_at: new Date().toISOString() }
            : comment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await apiClient.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchComments();
    }
  }, [projectId]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments,
  };
};
