/**
 * Datasets page — manage and upload datasets.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store";
import { datasetsApi } from "@/lib/api";
import { DatasetCard } from "@/components/DatasetCard";
import { UploadDropzone } from "@/features/upload/UploadDropzone";
import { MetricCard } from "@/components/MetricCard";
import { formatNumber } from "@/lib/utils";

export default function DatasetsPage() {
  const router = useRouter();
  const { datasets, setDatasets, setActiveDataset } = useAppStore();

  const refresh = async () => {
    const list = await datasetsApi.list();
    setDatasets(list);
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    await datasetsApi.delete(id);
    toast.success("Dataset deleted.");
    refresh();
  };

  const handleAnalyze = async (id: string) => {
    const profile = await datasetsApi.get(id);
    setActiveDataset(profile);
    router.push("/app");
  };

  const totalRows = datasets.reduce((s, d) => s + d.row_count, 0);
  const avgQuality =
    datasets.length > 0
      ? datasets.reduce((s, d) => s + d.quality_score, 0) / datasets.length
      : 0;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-[#e2e8f0]">Datasets</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Upload and manage your CSV datasets
          </p>
        </div>
      </div>

      {/* Stats */}
      {datasets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            label="Datasets"
            value={datasets.length}
            accent="blue"
            icon={Database}
          />
          <MetricCard
            label="Total Rows"
            value={formatNumber(totalRows)}
            accent="cyan"
          />
          <MetricCard
            label="Avg Quality"
            value={`${avgQuality.toFixed(0)}%`}
            accent={avgQuality >= 80 ? "green" : avgQuality >= 60 ? "yellow" : "red"}
          />
        </div>
      )}

      {/* Upload zone */}
      <UploadDropzone onSuccess={refresh} />

      {/* Dataset list */}
      {datasets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Your datasets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {datasets.map((d) => (
              <DatasetCard
                key={d.id}
                dataset={d}
                onClick={() => handleAnalyze(d.id)}
                onDelete={() => handleDelete(d.id)}
              />
            ))}
          </div>
        </div>
      )}

      {datasets.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Database size={40} className="text-text-muted mx-auto" />
          <p className="text-[#e2e8f0] font-semibold">No datasets yet</p>
          <p className="text-text-muted text-sm">Upload your first CSV above to get started.</p>
        </div>
      )}
    </div>
  );
}
