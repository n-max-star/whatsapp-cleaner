import { useState, useRef } from "react";
import { Image, Video, Music, FileText, ChevronRight, Plus } from "lucide-react";
import { useAppState } from "@/context/AppState";
import type { FileItem } from "@/context/AppState";

type Category = "all" | "images" | "videos" | "audio" | "docs";

const categoryTabs: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: FileText },
  { id: "images", label: "Images", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
  { id: "docs", label: "Docs", icon: FileText },
];

const typeColors: Record<string, string> = {
  images: "text-emerald-400",
  videos: "text-blue-400",
  audio: "text-purple-400",
  docs: "text-orange-400",
};

const typeIcons: Record<string, React.ElementType> = {
  images: Image,
  videos: Video,
  audio: Music,
  docs: FileText,
};

function getTypeFromFile(file: File): FileItem["type"] {
  const t = file.type;
  if (t.startsWith("image/")) return "images";
  if (t.startsWith("video/")) return "videos";
  if (t.startsWith("audio/")) return "audio";
  return "docs";
}

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
  return `${bytes} B`;
}

const FileManager = () => {
  const [active, setActive] = useState<Category>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, addFiles } = useAppState();

  const filtered = active === "all" ? files : files.filter((f) => f.type === active);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    const newItems: FileItem[] = [];
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      newItems.push({
        id: 0,
        name: file.name,
        type: getTypeFromFile(file),
        size: formatSize(file.size),
        sizeBytes: file.size,
        date,
      });
    }
    addFiles(newItems);
    e.target.value = "";
  };

  return (
    <div className="p-5 space-y-5">
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse WhatsApp media</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Add files to manager"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          <Plus size={16} />
          Add files
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* File List */}
      <div className="space-y-2">
        {filtered.map((file) => {
          const Icon = typeIcons[file.type];
          return (
            <div
              key={file.id}
              className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon size={18} className={typeColors[file.type]} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.size} · {file.date}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No files in this category. Use “Add files” to add some.
        </div>
      )}
    </div>
  );
};

export default FileManager;
