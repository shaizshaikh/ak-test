import React, { useEffect, useRef } from 'react';

const Modal = ({ 
  show, 
  onHide, 
  title, 
  children, 
  size = 'md',
  centered = true,
  backdrop = true,
  keyboard = true 
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus management with proper timing
      const focusModal = () => {
        if (modalRef.current) {
          // Find the first focusable element in the modal
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 0) {
            // Focus the first focusable element (usually the close button or first button)
            focusableElements[0].focus();
            firstFocusableRef.current = focusableElements[0];
          } else {
            // Fallback to modal itself
            modalRef.current.focus();
          }
        }
      };
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(focusModal, 50);
      });
      
      // Handle escape key
      const handleEscape = (e) => {
        if (keyboard && e.key === 'Escape') {
          onHide();
        }
      };
      
      // Handle tab key for focus trapping
      const handleTab = (e) => {
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTab);
        document.body.style.overflow = 'unset';
        
        // Restore focus to the previously focused element
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          try {
            previousFocusRef.current.focus();
          } catch (e) {
            // Fallback if focus fails
            console.warn('Could not restore focus:', e);
          }
        }
      };
    }
  }, [show, keyboard, onHide]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (backdrop && e.target === e.currentTarget) {
      onHide();
    }
  };

  return (
    <div 
      className="modal show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`modal-dialog ${centered ? 'modal-dialog-centered' : ''} ${size !== 'md' ? `modal-${size}` : ''}`}
        role="document"
      >
        <div 
          className="modal-content"
          ref={modalRef}
          tabIndex="-1"
        >
          <div className="modal-header">
            <h5 className="modal-title" id="modal-title">{title}</h5>
            <button 
              type="button" 
              className="btn-close" 
              aria-label="Close"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false 
}) => {
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (show) {
      // Focus the dangerous action button (confirm) to make user aware
      const focusConfirmButton = () => {
        if (confirmButtonRef.current) {
          confirmButtonRef.current.focus();
        }
      };
      
      // Use multiple timing strategies to ensure focus works
      requestAnimationFrame(() => {
        setTimeout(focusConfirmButton, 100);
      });
      
      // Backup focus attempt
      setTimeout(focusConfirmButton, 200);
    }
  }, [show]);

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  const handleKeyDown = (e) => {
    // Handle Enter key on the modal
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal show={show} onHide={onHide} title={title}>
      <div onKeyDown={handleKeyDown}>
        <p className="mb-3">{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <button 
            ref={cancelButtonRef}
            type="button" 
            className="btn btn-secondary" 
            onClick={onHide}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            ref={confirmButtonRef}
            type="button" 
            className={`btn btn-${confirmVariant}`} 
            onClick={handleConfirm}
            disabled={loading}
            autoFocus
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </span>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

Modal.Confirm = ConfirmModal;

export default Modal;