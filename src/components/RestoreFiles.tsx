import { motion } from "framer-motion";
import { RotateCcw, Image, Video, Music, FileText, CheckCircle2, Circle } from "lucide-react";
import { useAppState } from "@/context/AppState";
import { toast } from "sonner";

const typeIcons = { image: Image, video: Video, audio: Music, doc: FileText };
const typeColors = { image: "text-emerald-400", video: "text-blue-400", audio: "text-purple-400", doc: "text-orange-400" };

const RestoreFiles = () => {
  const { deletedFiles: files, toggleDeletedSelection, restoreSelectedFiles } = useAppState();

  const toggle = (id: number) => toggleDeletedSelection(id);

  const selectedCount = files.filter((f) => f.selected).length;

  const handleRestore = () => {
    const count = restoreSelectedFiles();
    toast.success("Files restored", { description: `${count} file${count !== 1 ? "s" : ""} restored to File Manager` });
  };

  return (
    <div className="p-5 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Restore Files</h1>
        <p className="text-sm text-muted-foreground mt-1">Recover recently deleted files</p>
      </div>

      <div className="bg-accent/50 border border-primary/20 rounded-xl p-3.5">
        <p className="text-xs text-accent-foreground">
          💡 Files are kept for 30 days before permanent deletion. Select files to restore them.
        </p>
      </div>

      <div className="space-y-2">
        {files.map((file) => {
          const Icon = typeIcons[file.type];
          return (
            <motion.button
              key={file.id}
              layout
              onClick={() => toggle(file.id)}
              className={`w-full bg-card border rounded-xl p-3.5 flex items-center gap-3 transition-colors ${
                file.selected ? "border-primary/50 bg-accent/30" : "border-border"
              }`}
            >
              {file.selected ? (
                <CheckCircle2 size={20} className="text-primary shrink-0" />
              ) : (
                <Circle size={20} className="text-muted-foreground shrink-0" />
              )}
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Icon size={16} className={typeColors[file.type]} />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.size} · {file.deletedAt}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <RotateCcw size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No deleted files to restore</p>
        </div>
      )}

      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[calc(28rem-2.5rem)]"
        >
          <button
            onClick={handleRestore}
            className="w-full gradient-primary py-3.5 rounded-xl font-semibold text-primary-foreground flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Restore {selectedCount} file{selectedCount > 1 ? "s" : ""}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default RestoreFiles;
