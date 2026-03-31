/**
 * UploadDropzone — drag-and-drop CSV upload.
 */
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { datasetsApi } from "@/lib/api";
import { useAppStore } from "@/lib/store";

interface Props {
  onSuccess?: () => void;
  compact?: boolean;
}

export function UploadDropzone({ onSuccess, compact }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const { setDatasets } = useAppStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      try {
        await datasetsApi.upload(file);
        const datasets = await datasetsApi.list();
        setDatasets(datasets);
        toast.success(`${file.name} uploaded successfully!`);
        onSuccess?.();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast.error(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [onSuccess, setDatasets]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm",
          isDragActive
            ? "border-primary bg-primary/10 text-primary-glow"
            : "border-dashed border-[#1e2d45] text-text-muted hover:text-[#e2e8f0] hover:border-primary/40"
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {isUploading ? "Uploading..." : "Upload CSV"}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-4",
        "cursor-pointer transition-all text-center",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-[#1e2d45] hover:border-primary/40 hover:bg-surface-subtle",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} />

      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20
        flex items-center justify-center">
        {isUploading ? (
          <Loader2 size={24} className="text-primary-glow animate-spin" />
        ) : isDragActive ? (
          <FileText size={24} className="text-primary-glow" />
        ) : (
          <Upload size={24} className="text-primary-glow" />
        )}
      </div>

      <div>
        <p className="font-semibold text-[#e2e8f0]">
          {isUploading
            ? "Uploading & profiling..."
            : isDragActive
            ? "Drop your CSV here"
            : "Upload your CSV"}
        </p>
        <p className="text-text-muted text-sm mt-1">
          {isUploading
            ? "Analyzing columns and data quality..."
            : "Drag & drop or click to browse. Max 50 MB."}
        </p>
      </div>

      {!isUploading && (
        <span className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20
          text-primary-glow">
          .CSV files only
        </span>
      )}
    </div>
  );
}
