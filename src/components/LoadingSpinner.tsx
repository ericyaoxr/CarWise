import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps): React.ReactElement {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingContainerProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
}

export function LoadingContainer({
  children,
  text = '加载中...',
  className = '',
}: LoadingContainerProps): React.ReactElement {
  return (
    <div className={`loading-container ${className}`}>
      <LoadingSpinner size="large" />
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
