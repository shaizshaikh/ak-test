import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  shadow = 'sm',
  border = true,
  ...props 
}) => {
  const cardClasses = [
    'card',
    border ? '' : 'border-0',
    `shadow-${shadow}`,
    hover ? 'hover-card' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header bg-transparent border-0 ${className}`} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h5 className={`card-title ${className}`} {...props}>
    {children}
  </h5>
);

const CardText = ({ children, className = '', ...props }) => (
  <p className={`card-text ${className}`} {...props}>
    {children}
  </p>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Title = CardTitle;
Card.Text = CardText;

export default Card;