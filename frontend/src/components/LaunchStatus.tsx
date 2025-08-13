import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface LaunchStatusProps {
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const LaunchStatus: React.FC<LaunchStatusProps> = ({ startDate, endDate, isActive }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const timeLeft = formatDistanceToNow(end, { locale: ru });
  const progress = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Запуск недели
          </h2>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isActive ? 'Активен' : 'Завершен'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Осталось: {timeLeft}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{format(start, 'd MMM', { locale: ru })}</span>
          <span>{format(end, 'd MMM', { locale: ru })}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Голосование завершится {format(end, 'd MMMM в HH:mm', { locale: ru })}
      </p>
    </div>
  );
};