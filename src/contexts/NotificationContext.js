import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

// Create the notification context
const NotificationContext = createContext();

// Transition component for slide animation
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

// Notification Provider Component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const showNotification = useCallback((message, severity = 'info', options = {}) => {
    const id = Date.now() + Math.random(); // Simple unique ID
    const notification = {
      id,
      message,
      severity,
      autoHideDuration: options.autoHideDuration || 6000,
      persist: options.persist || false,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-hide if not persistent
    if (!notification.persist) {
      setTimeout(() => {
        hideNotification(id);
      }, notification.autoHideDuration);
    }

    return id;
  }, []);

  // Remove a specific notification
  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different types
  const showSuccess = useCallback((message, options) => {
    return showNotification(message, 'success', options);
  }, [showNotification]);

  const showError = useCallback((message, options) => {
    return showNotification(message, 'error', { 
      autoHideDuration: 8000, // Errors stay longer
      ...options 
    });
  }, [showNotification]);

  const showWarning = useCallback((message, options) => {
    return showNotification(message, 'warning', options);
  }, [showNotification]);

  const showInfo = useCallback((message, options) => {
    return showNotification(message, 'info', options);
  }, [showNotification]);

  const value = {
    notifications,
    showNotification,
    hideNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.persist ? null : notification.autoHideDuration}
          onClose={(event, reason) => {
            // Don't auto-hide on clickaway for errors
            if (reason === 'clickaway' && notification.severity === 'error') {
              return;
            }
            hideNotification(notification.id);
          }}
          anchorOrigin={{ 
            vertical: 'top', 
            horizontal: 'right' 
          }}
          TransitionComponent={SlideTransition}
          sx={{
            // Stack notifications by adjusting top position
            mt: index * 7, // 7 = ~56px (snackbar height) + gap
          }}
        >
          <Alert
            onClose={() => hideNotification(notification.id)}
            severity={notification.severity}
            variant={notification.variant || 'filled'}
            sx={{ 
              width: '100%',
              minWidth: '300px',
              maxWidth: '500px'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
}

export default NotificationContext;