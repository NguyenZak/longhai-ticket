'use client';
import { formatDate, formatDateOnly, formatTimeOnly } from '@/lib/dateUtils';

interface DateDisplayProps {
  date: string;
  showTime?: boolean;
  className?: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ 
  date, 
  showTime = true, 
  className = "" 
}) => {
  if (!date) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm">Chưa có ngày</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-sm text-gray-900 dark:text-white">
        {showTime ? formatDate(date) : formatDateOnly(date)}
      </span>
    </div>
  );
};

export default DateDisplay; 