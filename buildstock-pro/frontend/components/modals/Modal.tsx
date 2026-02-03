'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable Modal/Dialog Component
 * Used for Quick Quote, Contact Merchant, Bulk Order Cart, and more
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
}: ModalProps) {
  // Handle ESC key press
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [closeOnEscape, isOpen, onClose]
  );

  // Add/remove event listener for ESC key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Don't render if not open
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full bg-white rounded-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn('p-6', contentClassName)}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Modal Header Component (for custom layouts)
export interface ModalHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function ModalHeader({ title, description, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-6 border-b', className)}>
      <div className="flex-1">
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p id="modal-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Modal Body Component (for custom layouts)
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

// Modal Footer Component (for custom layouts)
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

export function ModalFooter({ children, className, align = 'right' }: ModalFooterProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    'space-between': 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-6 border-t bg-gray-50 dark:bg-gray-900/50 rounded-b-lg',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

// Confirm Modal (specialized for confirmations)
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const variantClasses = {
    danger: 'bg-destructive text-white hover:bg-destructive/90',
    warning: 'bg-orange-500 text-white hover:bg-orange-600',
    info: 'bg-primary text-white hover:bg-primary/90',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50',
              variantClasses[variant]
            )}
          >
            {isLoading ? 'Loading...' : confirmText}
          </button>
        </>
      }
    >
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </Modal>
  );
}

// Export all components
export default {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
};
