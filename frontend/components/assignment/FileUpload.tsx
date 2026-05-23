'use client';

import { useCallback, useState } from 'react';

interface Props { value?: File | null; onChange: (f: File | null) => void; }

export default function FileUpload({ value, onChange }: Props) {
  const [drag, setDrag] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0]; if (f) onChange(f);
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          drag ? 'border-gray-400 bg-gray-50' : value ? 'border-green-300 bg-green-50/30' : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        {value ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[13px] font-medium text-gray-900 truncate max-w-[180px]">{value.name}</p>
              <p className="text-[11px] text-gray-500">{(value.size/1024/1024).toFixed(2)} MB</p>
            </div>
            <button type="button" onClick={() => onChange(null)} className="ml-2 p-1.5 hover:bg-red-100 rounded-lg transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <div>
              <p className="text-[13px] font-medium text-gray-700">Choose a file or drag & drop it here</p>
              <p className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG, upto 10MB</p>
            </div>
            <label className="cursor-pointer">
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
              <span className="inline-flex items-center px-4 py-1.5 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
                Browse Files
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
