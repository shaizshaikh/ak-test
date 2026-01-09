import React from 'react';
import { Alert } from 'react-bootstrap';

const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  const getVariant = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px'
      }}
    >
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          variant={getVariant(notification.type)}
          dismissible
          onClose={() => onRemove(notification.id)}
          className="mb-2"
          style={{
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          {notification.message}
        </Alert>
      ))}
    </div>
  );
};

export default NotificationContainer;