import React from 'react';

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export const IconCard: React.FC<IconCardProps> = ({ 
  icon, 
  title, 
  description, 
  delay = 0 
}) => {
  return (
    <div 
      className="p-6 bg-white rounded-2xl shadow-lg animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-8 h-8 text-primary-500 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-secondary-900 mb-2">{title}</h3>
      <p className="text-sm text-secondary-600">{description}</p>
    </div>
  );
};
