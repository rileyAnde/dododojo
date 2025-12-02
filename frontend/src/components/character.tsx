/*
Functions:
- Character --> displays a dodo sprite based on elemental type and size, with optional horizontal flip

Inputs:
- type --> chooses which dodo image to display (fire, air, water, earth, ice, default, jay)
- size --> determines rendered sprite size (small, medium, large)
- flipped --> flips sprite horizontally when set to 'y'
- className --> allows custom styling overrides

Outputs:
- Renders a styled <img> element displaying the appropriate dodo character sprite

Outside sources:
- None

Authors:
- Riley Anderson, Colin Treanor

Creation Date:
- 11/2/2025
*/

import React from 'react';

interface DodoCharacterProps {
  type?: string; // 'fire' | 'air' | 'water' | 'earth' | 'ice' | 'default' | 'jay';
  size?: 'small' | 'medium' | 'large';
  flipped?: 'y' | 'n';
  className?: string;
}

const Character: React.FC<DodoCharacterProps> = ({ 
  size = 'medium',
  type = 'default',
  flipped = 'n',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-33% h-33%',
    medium: 'w-67% h-67%',
    large: 'w-100% h-100%'
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
      className={`${sizeClasses[size]} object-contain drop-shadow-2xl ${flipped=='y' ? 'flipped' : ''} ${className}`}
    />
  );
};

export default Character;