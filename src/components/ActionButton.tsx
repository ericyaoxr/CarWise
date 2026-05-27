import type { ReactNode } from 'react';

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: ReactNode;
  type?: 'button' | 'submit';
}

export function ActionButton({ children, onClick, variant = 'secondary', icon, type = 'button' }: ActionButtonProps) {
  return (
    <button className={`action-button ${variant}`} onClick={onClick} type={type}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
