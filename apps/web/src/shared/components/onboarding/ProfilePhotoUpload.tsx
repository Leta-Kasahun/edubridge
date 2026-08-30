import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, Camera } from "lucide-react";
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
  label,
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
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3.5">
        {previewUrl ? (
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-primary/20 bg-primary/10 group shrink-0">
            <Image
              src={previewUrl}
              alt="Profile preview"
              fill
              unoptimized
              sizes="64px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-1 right-1 p-1 rounded-full bg-background/90 text-foreground hover:bg-background transition-colors cursor-pointer shadow-xs"
              aria-label="Remove photo"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-pointer",
              displayError && "border-destructive text-destructive"
            )}
            aria-label="Upload photo"
          >
            <Camera size={18} />
          </button>
        )}

        <div className="text-xs space-y-1">
          <p className="font-medium text-foreground">Edit your profile photo</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Upload size={12} />
              <span>{previewUrl ? "Change photo" : "Choose photo"}</span>
            </button>
            {previewUrl && (
              <>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </>
            )}
          </div>
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
