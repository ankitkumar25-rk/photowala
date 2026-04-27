export default function PaginationControls({
  page,
  total,
  limit = 20,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  if (totalPages <= 1) return null;

  const maxVisible = 7;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className={'p-4 border-t border-gray-100 flex items-center justify-end gap-2 ' + className}>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-secondary"
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-secondary"
          >
            1
          </button>
          {start > 2 && <span className="text-xs text-gray-400 px-1">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={
            'w-8 h-8 rounded-lg text-xs font-semibold ' +
            (page === p
              ? 'bg-brand-primary text-white'
              : 'border border-gray-200 text-gray-600 hover:border-brand-secondary')
          }
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-xs text-gray-400 px-1">...</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-brand-secondary"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-secondary"
      >
        Next
      </button>
    </div>
  );
}
