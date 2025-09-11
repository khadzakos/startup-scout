import React from 'react';

interface AnimatedIconProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  children, 
  className = "",
  delay = 0 
}) => {
  return (
    <div 
      className={`w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform duration-300 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
