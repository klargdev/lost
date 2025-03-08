import React from 'react';

export function FloralPattern({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="floral"
              patternUnits="userSpaceOnUse"
              width="50"
              height="50"
              patternTransform="rotate(45)"
            >
              <path
                d="M25,0 C30,10 40,10 45,0 C50,-10 60,-10 65,0 C70,10 60,20 50,20 C40,20 30,10 25,20 C20,10 10,20 0,20 C-10,20 -20,10 -15,0 C-10,-10 0,-10 5,0 C10,10 20,10 25,0 Z"
                fill="currentColor"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#floral)" />
        </svg>
      </div>
    </div>
  );
}

export default FloralPattern; 