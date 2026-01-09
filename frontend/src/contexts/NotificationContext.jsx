import React, { createContext, useContext } from 'react';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/NotificationContainer';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { notifications, showNotification, removeNotification } = useNotification();

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};