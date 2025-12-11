import React from 'react';
import { getGrade } from '../constants';

interface GradeBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ score, showLabel = false, size = 'md' }) => {
  const { grade, color, label } = getGrade(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${color} rounded-full font-bold ${sizeClasses[size]} border border-current bg-opacity-10`}>
      <span>{grade}</span>
      {showLabel && <span className="font-normal opacity-80 border-l border-current pl-2 ml-1">{label}</span>}
    </div>
  );
};
