import { FC } from 'react';

interface IconImageProps {
  className?: string;
}

const IconImage: FC<IconImageProps> = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 17L16.5 12.5C15.6716 11.6716 14.3284 11.6716 13.5 12.5L7 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default IconImage; 