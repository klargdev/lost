import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-4'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} rounded-full border-funeral-accent border-t-transparent animate-spin ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner; 