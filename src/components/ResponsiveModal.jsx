// src/components/ResponsiveModal.jsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ResponsiveModal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'default', // 'small', 'default', 'large', 'full'
  showCloseButton = true 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-0 sm:p-4">
        <div
          className={`
            relative w-full ${sizeClasses[size]}
            bg-white 
            sm:rounded-2xl sm:shadow-2xl
            max-h-screen sm:max-h-[90vh]
            flex flex-col
            animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0
            duration-200
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
