import { FiAlertCircle } from 'react-icons/fi';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
      <p className="text-red-700 mb-3">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-red-600 hover:text-red-800 font-medium">
          Try Again
        </button>
      )}
    </div>
  );
}