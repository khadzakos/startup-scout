import React from 'react';
import { CheckCircle } from 'lucide-react';

interface BenefitItemProps {
  text: string;
  delay?: number;
}

export const BenefitItem: React.FC<BenefitItemProps> = ({ text, delay = 0 }) => {
  return (
    <div 
      className="flex items-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" />
      <span className="text-secondary-700 font-medium">{text}</span>
    </div>
  );
};
