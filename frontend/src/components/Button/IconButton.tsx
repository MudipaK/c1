import React, { ReactNode } from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xs';
  color?: 'primary' | 'secondary' | 'danger' | 'info';
  className?: string;
  icon?: ReactNode; // Add this line to accept an icon
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = 'button',
  disabled = false,
  size = 'md',
  color = 'primary',
  className = '',
  icon, // Add icon parameter
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  // Color classes
  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    info: 'bg-sky-600 hover:bg-sky-700 text-white',
  };

  return (
    <button
      type={type}
      className={`rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center ${
        sizeClasses[size]
      } ${colorClasses[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Render the icon if provided */}
      {icon && <span className="mr-1.5">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;