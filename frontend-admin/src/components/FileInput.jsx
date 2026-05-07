import { useRef } from 'react';
import { Upload } from 'lucide-react';

export default function FileInput({
  accept = '*',
  multiple = false,
  onChange,
  disabled = false,
  selectedFileCount = 0,
  className = '',
  ...props
}) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
        {...props}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Choose file</span>
        </div>
      </button>
      <p className={`text-xs ${selectedFileCount > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
        {selectedFileCount > 0 ? `${selectedFileCount} file(s) selected` : 'no file chosen'}
      </p>
    </div>
  );
}
