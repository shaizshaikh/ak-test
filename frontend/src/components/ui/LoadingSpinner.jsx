import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  centered = true,
  fullScreen = false 
}) => {
  const spinnerSizes = {
    sm: { width: '1.5rem', height: '1.5rem' },
    md: { width: '3rem', height: '3rem' },
    lg: { width: '4rem', height: '4rem' }
  };

  const containerClass = fullScreen 
    ? 'min-vh-100 d-flex align-items-center justify-content-center bg-light'
    : centered 
    ? 'text-center py-5'
    : '';

  return (
    <div className={containerClass}>
      <div>
        <div 
          className="spinner-border text-primary mb-3" 
          role="status"
          style={spinnerSizes[size]}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {text && (
          <div className="text-muted">
            <h6>{text}</h6>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;