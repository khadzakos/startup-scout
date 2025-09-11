import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CTAButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CTAButton: React.FC<CTAButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'md',
  className = ''
}) => {
  const baseClasses = "group font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-white text-primary-600 hover:bg-white/90",
    secondary: "border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
  };
  
  const sizeClasses = {
    sm: "px-6 py-3 text-sm rounded-lg",
    md: "px-8 py-4 text-base rounded-xl",
    lg: "px-10 py-5 text-lg rounded-2xl"
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};
