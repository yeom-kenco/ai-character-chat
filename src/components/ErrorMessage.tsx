interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="border-t border-red-900/50 bg-red-950/50 px-4 py-3"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p className="text-sm text-red-400">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-lg border border-red-800 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-900"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
