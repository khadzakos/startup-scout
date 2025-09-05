import React from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showDefault?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const defaultAvatars = [
  'https://api.dicebear.com/9.x/dylan/svg?seed=Michael',
  'https://api.dicebear.com/9.x/dylan/svg?seed=Ann',
  'https://api.dicebear.com/9.x/dylan/svg?seed=Tom',
  'https://api.dicebear.com/9.x/dylan/svg?seed=John',
  'https://api.dicebear.com/9.x/dylan/svg?seed=James',
  'https://api.dicebear.com/9.x/dylan/svg?seed=Nick',
  'https://api.dicebear.com/9.x/dylan/svg?seed=Alex',
  'https://api.dicebear.com/9.x/dylan/svg?seed=Daniel',
  'https://api.dicebear.com/9.x/dylan/svg?seed=Ryan',
];
  

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  showDefault = true
}) => {
  const sizeClass = sizeClasses[size];
  
  // Если нет аватарки и включены дефолтные, генерируем дефолтную на основе имени
  const getDefaultAvatar = () => {
    if (!showDefault) return null;
    
    // Генерируем индекс на основе имени для консистентности
    const seed = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = seed % defaultAvatars.length;
    return defaultAvatars[avatarIndex];
  };

  const avatarSrc = src || getDefaultAvatar();

  if (!avatarSrc) {
    // Fallback - инициалы
    const initials = alt
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold ${className}`}
        title={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={`${sizeClass} rounded-full object-cover ${className}`}
      onError={(e) => {
        // Если изображение не загрузилось, показываем инициалы
        const target = e.target as HTMLImageElement;
        const parent = target.parentElement;
        if (parent) {
          const initials = alt
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          parent.innerHTML = `
            <div class="${sizeClass} rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold" title="${alt}">
              ${initials}
            </div>
          `;
        }
      }}
    />
  );
};
