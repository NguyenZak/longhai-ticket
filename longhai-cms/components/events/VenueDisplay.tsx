'use client';
import { useState } from 'react';

interface VenueDisplayProps {
  venue: string;
  className?: string;
}

const VenueDisplay: React.FC<VenueDisplayProps> = ({ venue, className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!venue) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm">Chưa có địa điểm</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="max-w-xs truncate text-sm text-gray-900 dark:text-white">
          {venue}
        </span>
      </div>
      
      {showTooltip && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-0 transform -translate-y-full max-w-xs">
          <div className="relative">
            {venue}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueDisplay; 