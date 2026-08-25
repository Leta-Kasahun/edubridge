import { useState, useRef, ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateImageFile,
  createImagePreviewUrl,
  revokeImagePreviewUrl,
} from "@/shared/utils/image.util";

export interface ProfilePhotoUploadProps {
  readonly initialPhotoUrl?: string | null;
  readonly onPhotoSelect?: (file: File | null) => void;
  readonly error?: string;
  readonly label?: string;
}

export function ProfilePhotoUpload({
  initialPhotoUrl,
  onPhotoSelect,
  error,
  label = "Profile Photo (Optional)",
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid file");
      return;
    }

    setValidationError(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      revokeImagePreviewUrl(previewUrl);
    }

    const newPreview = createImagePreviewUrl(file);
    setPreviewUrl(newPreview);
    onPhotoSelect?.(file);
  };

  const handleRemovePhoto = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      revokeImagePreviewUrl(previewUrl);
    }
    setPreviewUrl(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onPhotoSelect?.(null);
  };

  const displayError = error || validationError;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block">
        {label}
      </label>

      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors cursor-pointer"
              aria-label="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-border hover:border-foreground/40 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer",
              displayError && "border-destructive text-destructive"
            )}
            aria-label="Upload photo"
          >
            <Upload size={18} />
            <span className="text-[10px] mt-1 font-medium">Upload</span>
          </button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Upload your passport-style headshot</p>
          <p className="text-[11px]">Supports JPG, PNG, WEBP up to 5MB.</p>
          {!previewUrl && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-foreground hover:underline cursor-pointer inline-block mt-0.5"
            >
              Browse file
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-label="File input"
        />
      </div>

      {displayError && (
        <p className="text-xs text-destructive font-medium tracking-tight">
          {displayError}
        </p>
      )}
    </div>
  );
}
