import React, { ReactNode } from 'react';
import { AlertCircle, Inbox, RefreshCw, X } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
    <div className="p-3 bg-white rounded-full border border-slate-200 text-slate-400 mb-3">
      {icon || <Inbox className="w-6 h-6" />}
    </div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>}
    {actionText && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-3" />
    <span className="text-xs font-medium text-slate-600">{message}</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50 border border-rose-200 rounded-lg">
    <AlertCircle className="w-6 h-6 text-rose-600 mb-2" />
    <h3 className="text-sm font-semibold text-rose-900">Data error</h3>
    <p className="mt-1 text-xs text-rose-700 max-w-md">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-rose-700 rounded hover:bg-rose-800"
      >
        Retry
      </button>
    )}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 id="modal-headline" className="text-base font-semibold text-slate-900">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto text-sm text-slate-700">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-3.5 bg-slate-50 border-t border-slate-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
