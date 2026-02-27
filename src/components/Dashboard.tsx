import { Image, Video, Music, FileText, Trash2, HardDrive } from "lucide-react";
import type { TabType } from "@/pages/Index";
import { useAppState } from "@/context/AppState";

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  Images: Image,
  Videos: Video,
  Audio: Music,
  Documents: FileText,
};

const categoryColors: Record<string, string> = {
  Images: "text-emerald-400",
  Videos: "text-blue-400",
  Audio: "text-purple-400",
  Documents: "text-orange-400",
};

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const {
    storageTotalGb,
    storageUsedGb,
    storageWhatsAppGb,
    storageDuplicatesGb,
    categories,
  } = useAppState();

  const usedPercent = (storageUsedGb / storageTotalGb) * 100;
  const dupPercent = (storageDuplicatesGb / storageTotalGb) * 100;

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold">WA Cleaner</h1>
        <p className="text-sm text-muted-foreground mt-1">Free up space, keep what matters</p>
      </div>

      {/* Storage Ring */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={`${usedPercent * 2.64} ${264 - usedPercent * 2.64}`}
                strokeLinecap="round"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="hsl(var(--destructive))"
                strokeWidth="8"
                strokeDasharray={`${dupPercent * 2.64} ${264 - dupPercent * 2.64}`}
                strokeDashoffset={`${-usedPercent * 2.64}`}
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold">{storageUsedGb.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">/ {storageTotalGb} GB</span>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">WhatsApp</span>
              <span className="text-xs font-semibold ml-auto">{storageWhatsAppGb.toFixed(1)} GB</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Duplicates</span>
              <span className="text-xs font-semibold ml-auto">{storageDuplicatesGb.toFixed(1)} GB</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground">Free</span>
              <span className="text-xs font-semibold ml-auto">{(storageTotalGb - storageUsedGb).toFixed(1)} GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("scan")}
          className="gradient-primary rounded-2xl p-4 text-left text-primary-foreground"
        >
          <Trash2 size={24} className="mb-2" />
          <p className="font-semibold text-sm">Clean Duplicates</p>
          <p className="text-xs opacity-80 mt-0.5">Save ~{storageDuplicatesGb.toFixed(1)} GB</p>
        </button>
        <button
          onClick={() => onNavigate("backup")}
          className="bg-card border border-border rounded-2xl p-4 text-left"
        >
          <HardDrive size={24} className="mb-2 text-primary" />
          <p className="font-semibold text-sm">Backup to Drive</p>
          <p className="text-xs text-muted-foreground mt-0.5">Stay safe</p>
        </button>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Categories</h2>
        <div className="space-y-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name];
            const color = categoryColors[cat.name];
            return (
              <button
                key={cat.name}
                onClick={() => onNavigate("files")}
                className="w-full bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {Icon && <Icon size={18} className={color} />}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.count} files</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{cat.size}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
