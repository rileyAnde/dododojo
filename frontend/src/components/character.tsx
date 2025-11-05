import React from 'react';

interface DodoCharacterProps {
  color: string;
  type?: string; // 'fire' | 'air' | 'water' | 'earth' | 'ice' | 'default' | 'jay';
  size?: 'small' | 'medium' | 'large';
  flipped?: 'y' | 'n';
  className?: string;
}

const Character: React.FC<DodoCharacterProps> = ({ 
  color, 
  size = 'medium',
  type = 'default',
  flipped = 'n',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-64 h-64',
    large: 'w-96 h-96'
  };

  // Map colors to image files
  const dodoImages: { [key: string]: string } = {
    // '#FF6B6B': '/dodo.png'
    'fire': '/fire.png',
    'air': '/air.png',
    'water': '/water.png',
    'earth' : '/earth.png',
    'ice': '/ice.png',
    'default' : '/default.png',
    'jay' : '/jh1.png'
  };

  return (
    <img
      src={dodoImages[type] || 'dodo.png'} 
      alt="Dodo character"
      className={`${sizeClasses[size]} bg-${color} object-contain drop-shadow-2xl ${flipped=='y' ? 'flipped' : ''} ${className}`}
    />
  );
};

export default Character;