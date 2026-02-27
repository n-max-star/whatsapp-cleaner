import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, Circle, Trash2, Image, Video, Music, FileText } from "lucide-react";
import { useAppState } from "@/context/AppState";
import { toast } from "sonner";

const typeIcons = {
  image: Image,
  video: Video,
  audio: Music,
  doc: FileText,
};

const typeColors = {
  image: "text-emerald-400",
  video: "text-blue-400",
  audio: "text-purple-400",
  doc: "text-orange-400",
};

const Scanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const {
    duplicateGroups: duplicates,
    lastScannedAt,
    runScan,
    deleteSelectedDuplicates,
    toggleDuplicateSelection,
    selectAllDuplicates,
  } = useAppState();

  const hasScannedBefore = lastScannedAt != null;
  const showResults = scanned || (hasScannedBefore && duplicates.length > 0);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      runScan();
      setScanning(false);
      setScanned(true);
      toast.success("Scan complete", { description: "Review duplicate groups below" });
    }, 2000);
  };

  const selectedCount = duplicates.filter((d) => d.selected).length;

  const handleDelete = () => {
    const freedBytes = deleteSelectedDuplicates();
    const freedMb = (freedBytes / (1024 * 1024)).toFixed(0);
    toast.success("Duplicates removed", { description: `Freed ~${freedMb} MB` });
  };

  const selectAll = () => {
    const allSelected = duplicates.every((d) => d.selected);
    selectAllDuplicates(!allSelected);
  };

  return (
    <div className="p-5 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Duplicate Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">Find & remove duplicate files</p>
      </div>

      {!showResults ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <motion.div
            animate={scanning ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border-4 border-border flex items-center justify-center"
            style={scanning ? { borderTopColor: "hsl(var(--primary))" } : {}}
          >
            <Search size={40} className={scanning ? "text-primary" : "text-muted-foreground"} />
          </motion.div>
          {scanning ? (
            <p className="text-sm text-muted-foreground animate-pulse">Scanning WhatsApp files...</p>
          ) : (
            <button
              onClick={handleScan}
              className="gradient-primary px-8 py-3 rounded-xl font-semibold text-primary-foreground"
            >
              Start Scan
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found <span className="text-foreground font-semibold">{duplicates.length}</span> groups
            </p>
            <button onClick={selectAll} className="text-xs text-primary font-medium">
              {duplicates.every((d) => d.selected) ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="space-y-2">
            {duplicates.map((dup) => {
              const Icon = typeIcons[dup.type];
              return (
                <motion.button
                  key={dup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => toggleDuplicateSelection(dup.id)}
                  className={`w-full bg-card border rounded-xl p-3.5 flex items-center gap-3 transition-colors ${
                    dup.selected ? "border-primary/50 bg-accent/30" : "border-border"
                  }`}
                >
                  {dup.selected ? (
                    <CheckCircle2 size={20} className="text-primary shrink-0" />
                  ) : (
                    <Circle size={20} className="text-muted-foreground shrink-0" />
                  )}
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={16} className={typeColors[dup.type]} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dup.name}</p>
                    <p className="text-xs text-muted-foreground">{dup.count} duplicates</p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">{dup.size}</span>
                </motion.button>
              );
            })}
          </div>

          {selectedCount > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[calc(28rem-2.5rem)]"
            >
              <button
                onClick={handleDelete}
                className="w-full gradient-danger py-3.5 rounded-xl font-semibold text-primary-foreground flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete {selectedCount} group{selectedCount > 1 ? "s" : ""}
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Scanner;
