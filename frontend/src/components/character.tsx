import React from 'react';

interface DodoCharacterProps {
  color: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Character: React.FC<DodoCharacterProps> = ({ 
  color, 
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-64 h-64',
    large: 'w-96 h-96'
  };

  // Map colors to image files
  const dodoImages: { [key: string]: string } = {
    '#FF6B6B': '/dodo.png'
  };

  return (
    <img 
      src={dodoImages[color] || 'dodo.png'} 
      alt="Dodo character"
      className={`${sizeClasses[size]} object-contain drop-shadow-2xl ${className}`}
    />
  );
};

export default Character;