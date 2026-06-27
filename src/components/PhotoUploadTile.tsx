import { useRef, useState } from 'react';
import { Camera, X, ShieldCheck } from 'lucide-react';
import { fileToStrippedDataUrl } from '../lib/photo';

interface PhotoUploadTileProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}

export default function PhotoUploadTile({ value, onChange, label = 'Add a photo' }: PhotoUploadTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToStrippedDataUrl(file);
      onChange(dataUrl);
    } catch {
      onChange(undefined);
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative w-full max-w-xs">
          <img
            src={value}
            alt="Your photo preview"
            className="w-full rounded-md border border-line object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Remove photo"
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-pill bg-paper-raised border border-line shadow-elevation-1 text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
          <ShieldCheck size={14} aria-hidden="true" />
          Location and identity are removed from this photo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex flex-col items-center justify-center gap-2 w-full min-h-[120px] rounded-md border-2 border-dashed border-line bg-paper-raised text-ink-soft hover:border-ink-faint transition-colors disabled:opacity-50"
      >
        <Camera size={28} aria-hidden="true" />
        <span className="text-sm font-medium">{busy ? 'Adding…' : label}</span>
      </button>
      <p className="text-xs text-ink-faint">Photos are stripped of location and identity.</p>
    </div>
  );
}
