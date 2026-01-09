import React from 'react';

const Badge = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  pill = false,
  ...props 
}) => {
  const badgeClasses = [
    'badge',
    `bg-${variant}`,
    pill ? 'rounded-pill' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;