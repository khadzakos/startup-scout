import React from 'react';

interface StatCardProps {
  number: string;
  label: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ number, label, delay = 0 }) => {
  return (
    <div 
      className="text-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
        {number}
      </div>
      <div className="text-secondary-600 font-medium">
        {label}
      </div>
    </div>
  );
};
