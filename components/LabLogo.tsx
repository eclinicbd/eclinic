import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface LabLogoProps {
  name: string;
  logo: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  accentColor?: string;
}

const SIZE_MAP = {
  xs: 'w-7 h-7 text-[10px] rounded-lg',
  sm: 'w-10 h-10 text-xs rounded-xl',
  md: 'w-14 h-14 text-sm rounded-2xl',
  lg: 'w-16 h-16 text-base rounded-2xl',
  xl: 'w-20 h-20 text-lg rounded-2xl'
};

const ICON_SIZE_MAP = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 28,
  xl: 36
};

export const LabLogo: React.FC<LabLogoProps> = ({
  name,
  logo,
  size = 'md',
  className = '',
  accentColor
}) => {
  const [hasError, setHasError] = useState(false);

  // Extract initials (e.g., "Popular Diagnostic" -> "PD")
  const getInitials = (str: string) => {
    if (!str) return 'LB';
    const words = str.replace(/[^\w\s\u0980-\u09FF]/gi, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return (words[0] ? words[0].slice(0, 2) : 'LB').toUpperCase();
  };

  const initials = getInitials(name);
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const iconSize = ICON_SIZE_MAP[size] || 24;

  if (hasError || !logo) {
    return (
      <div 
        className={`flex items-center justify-center font-extrabold text-white shadow-xs select-none flex-shrink-0 ${sizeClasses} ${className}`}
        style={{
          background: accentColor 
            ? `linear-gradient(135deg, ${accentColor}, #0284c7)`
            : 'linear-gradient(135deg, #0284c7, #0f766e)'
        }}
        title={name}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden bg-white flex items-center justify-center border border-slate-200/80 shadow-xs flex-shrink-0 p-1 group-hover:border-primary/40 transition-colors ${sizeClasses} ${className}`}
      title={name}
    >
      <img
        src={logo}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain rounded-inherit"
        loading="lazy"
      />
    </div>
  );
};
