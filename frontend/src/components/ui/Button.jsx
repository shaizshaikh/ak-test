import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = '', 
  className = '', 
  loading = false,
  disabled = false,
  icon = null,
  ...props 
}) => {
  const sizeClass = size ? `btn-${size}` : '';
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </span>
      )}
      {icon && <span className="me-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;