// components/ConfirmationModal.tsx
"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
      icon: "🔴",
    },
    warning: {
      confirmButton: "bg-orange-600 hover:bg-orange-700 text-white",
      icon: "🟠",
    },
    info: {
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "🔵",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg max-w-sm w-full">
        <div className="flex items-start space-x-3">
          <span className="text-xl">{currentVariant.icon}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-3 py-2 rounded transition-colors disabled:opacity-50 text-sm flex-1 ${currentVariant.confirmButton}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
