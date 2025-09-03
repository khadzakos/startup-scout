import React, { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';
import { Comment, Project } from '../types';
import { VotingButtons } from './VotingButtons';

interface CommentsProps {
  projectId: string;
  project?: Project; // Добавляем опциональный проект для отображения голосования
}

const Comments: React.FC<CommentsProps> = ({ projectId, project }) => {
  const { comments, loading, error, addComment, deleteComment } = useComments(projectId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // Проверяем, принадлежит ли комментарий текущему пользователю
  const canEditComment = (comment: Comment): boolean => {
    return Boolean(user && comment.user_id === user.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Комментарии</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Комментарии ({comments.length})</h3>
      
      {/* Voting Section - показываем только если есть данные проекта */}
      {project && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Лайкнуть проект</h4>
          <VotingButtons
            projectId={project.id}
            upvotes={project.upvotes}
            className="w-fit"
          />
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Написать комментарий..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              Отправить
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Пока нет комментариев. Будьте первым!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {comment.user_id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">Пользователь {comment.user_id.slice(0, 8)}...</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                  {comment.updated_at !== comment.created_at && ' (изменено)'}
                </span>
              </div>
              
              <div>
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                
                {/* Comment actions - показываем только если пользователь может редактировать */}
                {canEditComment(comment) && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { Comments };