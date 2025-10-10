import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  show: boolean;
  onConfirm?: (response: boolean) => void;
  isExitConfirmation?: boolean;
}

export const Notification = ({
  message,
  type,
  onClose,
  show,
  onConfirm,
  isExitConfirmation = false,
}: NotificationProps) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50
        transition-opacity duration-300 ease-in-out
        ${show ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div
        className={`
          bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4
          transform transition-all duration-300 ease-in-out
          ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-4 flex-1">
            <p className="text-lg font-medium text-gray-900">
              {isExitConfirmation ? 'Confirmation Required' : 'Notification'}
            </p>
            <p className="text-sm text-gray-600 mt-1">{message}</p>

            {isExitConfirmation && onConfirm && (
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    onConfirm(true);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Confirm Exit
                </button>
                <button
                  onClick={() => {
                    onConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Deny
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
