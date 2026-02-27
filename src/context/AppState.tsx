import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type DuplicateGroup = {
  id: number;
  type: "image" | "video" | "audio" | "doc";
  name: string;
  count: number;
  size: string;
  sizeBytes: number;
  selected: boolean;
};

export type FileItem = {
  id: number;
  name: string;
  type: "images" | "videos" | "audio" | "docs";
  size: string;
  sizeBytes: number;
  date: string;
};

export type DeletedFile = {
  id: number;
  name: string;
  type: "image" | "video" | "audio" | "doc";
  size: string;
  deletedAt: string;
  selected: boolean;
};

const STORAGE_KEY = "wa-cleaner-state";

const defaultDuplicates: DuplicateGroup[] = [
  { id: 1, type: "image", name: "IMG_20240115_*.jpg", count: 12, size: "48 MB", sizeBytes: 48 * 1024 * 1024, selected: false },
  { id: 2, type: "image", name: "WhatsApp Image 2024-*", count: 34, size: "156 MB", sizeBytes: 156 * 1024 * 1024, selected: false },
  { id: 3, type: "video", name: "VID_20240201_*.mp4", count: 5, size: "820 MB", sizeBytes: 820 * 1024 * 1024, selected: false },
  { id: 4, type: "audio", name: "AUD-2024*.opus", count: 28, size: "94 MB", sizeBytes: 94 * 1024 * 1024, selected: false },
  { id: 5, type: "image", name: "Screenshot_2024_*", count: 18, size: "72 MB", sizeBytes: 72 * 1024 * 1024, selected: false },
  { id: 6, type: "doc", name: "Document_*.pdf", count: 8, size: "34 MB", sizeBytes: 34 * 1024 * 1024, selected: false },
  { id: 7, type: "video", name: "WhatsApp Video 2024-*", count: 3, size: "1.2 GB", sizeBytes: 1288 * 1024 * 1024, selected: false },
  { id: 8, type: "image", name: "IMG-WA*.jpg", count: 45, size: "210 MB", sizeBytes: 210 * 1024 * 1024, selected: false },
];

const defaultFiles: FileItem[] = [
  { id: 1, name: "vacation_photo.jpg", type: "images", size: "3.2 MB", sizeBytes: 3.35e6, date: "Jan 15" },
  { id: 2, name: "birthday_video.mp4", type: "videos", size: "128 MB", sizeBytes: 134e6, date: "Jan 12" },
  { id: 3, name: "voice_note_034.opus", type: "audio", size: "1.4 MB", sizeBytes: 1.47e6, date: "Jan 10" },
  { id: 4, name: "invoice_2024.pdf", type: "docs", size: "420 KB", sizeBytes: 430e3, date: "Jan 8" },
  { id: 5, name: "family_dinner.jpg", type: "images", size: "4.1 MB", sizeBytes: 4.3e6, date: "Jan 7" },
  { id: 6, name: "meeting_rec.mp4", type: "videos", size: "95 MB", sizeBytes: 99.6e6, date: "Jan 5" },
  { id: 7, name: "song_share.mp3", type: "audio", size: "5.8 MB", sizeBytes: 6.08e6, date: "Jan 3" },
  { id: 8, name: "screenshot_041.png", type: "images", size: "890 KB", sizeBytes: 911e3, date: "Jan 2" },
  { id: 9, name: "contract.pdf", type: "docs", size: "1.2 MB", sizeBytes: 1.26e6, date: "Dec 28" },
  { id: 10, name: "sunset_timelapse.mp4", type: "videos", size: "210 MB", sizeBytes: 220e6, date: "Dec 25" },
];

const defaultDeleted: DeletedFile[] = [
  { id: 101, name: "group_photo.jpg", type: "image", size: "3.4 MB", deletedAt: "2 hours ago", selected: false },
  { id: 102, name: "presentation.pdf", type: "doc", size: "1.8 MB", deletedAt: "5 hours ago", selected: false },
  { id: 103, name: "funny_clip.mp4", type: "video", size: "42 MB", deletedAt: "Yesterday", selected: false },
  { id: 104, name: "voice_msg.opus", type: "audio", size: "0.8 MB", deletedAt: "Yesterday", selected: false },
  { id: 105, name: "receipt_scan.jpg", type: "image", size: "1.2 MB", deletedAt: "2 days ago", selected: false },
  { id: 106, name: "meeting_notes.pdf", type: "doc", size: "450 KB", deletedAt: "3 days ago", selected: false },
];

type PersistedState = {
  duplicateGroups: DuplicateGroup[];
  files: FileItem[];
  deletedFiles: DeletedFile[];
  backupComplete: boolean;
  lastBackupSizeGb: number;
  lastScannedAt: number | null;
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultPersisted();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      duplicateGroups: parsed.duplicateGroups ?? defaultDuplicates,
      files: parsed.files ?? defaultFiles,
      deletedFiles: parsed.deletedFiles ?? defaultDeleted,
      backupComplete: parsed.backupComplete ?? false,
      lastBackupSizeGb: parsed.lastBackupSizeGb ?? 14.2,
      lastScannedAt: parsed.lastScannedAt ?? null,
    };
  } catch {
    return getDefaultPersisted();
  }
}

function getDefaultPersisted(): PersistedState {
  return {
    duplicateGroups: defaultDuplicates.map((d) => ({ ...d, selected: false })),
    files: defaultFiles,
    deletedFiles: defaultDeleted.map((f) => ({ ...f, selected: false })),
    backupComplete: false,
    lastBackupSizeGb: 14.2,
    lastScannedAt: null,
  };
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
  return `${bytes} B`;
}

type AppStateContextValue = {
  // Computed storage (for dashboard)
  storageTotalGb: number;
  storageUsedGb: number;
  storageWhatsAppGb: number;
  storageDuplicatesGb: number;
  categories: { name: string; count: number; size: string; sizeBytes: number }[];

  duplicateGroups: DuplicateGroup[];
  setDuplicateGroups: React.Dispatch<React.SetStateAction<DuplicateGroup[]>>;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  deletedFiles: DeletedFile[];
  setDeletedFiles: React.Dispatch<React.SetStateAction<DeletedFile[]>>;
  backupComplete: boolean;
  lastBackupSizeGb: number;
  lastScannedAt: number | null;

  runScan: () => void;
  deleteSelectedDuplicates: () => number;
  toggleDuplicateSelection: (id: number) => void;
  selectAllDuplicates: (selected: boolean) => void;
  restoreSelectedFiles: () => number;
  toggleDeletedSelection: (id: number) => void;
  completeBackup: (sizeGb: number) => void;
  resetBackup: () => void;
  addFiles: (newFiles: FileItem[]) => void;
  deleteFile: (id: number) => void;
  moveToDeleted: (file: FileItem) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const duplicateGroups = state.duplicateGroups;
  const files = state.files;
  const deletedFiles = state.deletedFiles;

  const setDuplicateGroups = useCallback((updater: React.SetStateAction<DuplicateGroup[]>) => {
    setState((s) => ({ ...s, duplicateGroups: typeof updater === "function" ? updater(s.duplicateGroups) : updater }));
  }, []);

  const setFiles = useCallback((updater: React.SetStateAction<FileItem[]>) => {
    setState((s) => ({ ...s, files: typeof updater === "function" ? updater(s.files) : updater }));
  }, []);

  const setDeletedFiles = useCallback((updater: React.SetStateAction<DeletedFile[]>) => {
    setState((s) => ({ ...s, deletedFiles: typeof updater === "function" ? updater(s.deletedFiles) : updater }));
  }, []);

  const runScan = useCallback(() => {
    setState((s) => ({
      ...s,
      duplicateGroups: defaultDuplicates.map((d) => ({ ...d, selected: false })),
      lastScannedAt: Date.now(),
    }));
  }, []);

  const deleteSelectedDuplicates = useCallback((): number => {
    let freedBytes = 0;
    setState((s) => {
      const toRemove = s.duplicateGroups.filter((d) => d.selected);
      freedBytes = toRemove.reduce((sum, d) => sum + d.sizeBytes * d.count, 0);
      return {
        ...s,
        duplicateGroups: s.duplicateGroups.filter((d) => !d.selected),
      };
    });
    return freedBytes;
  }, []);

  const toggleDuplicateSelection = useCallback((id: number) => {
    setState((s) => ({
      ...s,
      duplicateGroups: s.duplicateGroups.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)),
    }));
  }, []);

  const selectAllDuplicates = useCallback((selected: boolean) => {
    setState((s) => ({
      ...s,
      duplicateGroups: s.duplicateGroups.map((d) => ({ ...d, selected })),
    }));
  }, []);

  const restoreSelectedFiles = useCallback((): number => {
    let count = 0;
    setState((s) => {
      const toRestore = s.deletedFiles.filter((f) => f.selected);
      count = toRestore.length;
      const maxId = Math.max(0, ...s.files.map((f) => f.id));
      const restored: FileItem[] = toRestore.map((f, i) => ({
        id: maxId + i + 1,
        name: f.name,
        type: f.type === "image" ? "images" : f.type === "video" ? "videos" : f.type === "audio" ? "audio" : "docs",
        size: f.size,
        sizeBytes: parseSizeToBytes(f.size),
        date: "Just now",
      }));
      return {
        ...s,
        deletedFiles: s.deletedFiles.filter((f) => !f.selected),
        files: [...s.files, ...restored],
      };
    });
    return count;
  }, []);

  const toggleDeletedSelection = useCallback((id: number) => {
    setState((s) => ({
      ...s,
      deletedFiles: s.deletedFiles.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)),
    }));
  }, []);

  const completeBackup = useCallback((sizeGb: number) => {
    setState((s) => ({ ...s, backupComplete: true, lastBackupSizeGb: sizeGb }));
  }, []);

  const resetBackup = useCallback(() => {
    setState((s) => ({ ...s, backupComplete: false }));
  }, []);

  const addFiles = useCallback((newFiles: FileItem[]) => {
    setState((s) => {
      const maxId = Math.max(0, ...s.files.map((f) => f.id));
      const withIds = newFiles.map((f, i) => ({ ...f, id: maxId + i + 1 }));
      return { ...s, files: [...s.files, ...withIds] };
    });
  }, []);

  const deleteFile = useCallback((id: number) => {
    setState((s) => ({ ...s, files: s.files.filter((f) => f.id !== id) }));
  }, []);

  const moveToDeleted = useCallback((file: FileItem) => {
    const deleted: DeletedFile = {
      id: 1000 + file.id,
      name: file.name,
      type: file.type === "images" ? "image" : file.type === "videos" ? "video" : file.type === "audio" ? "audio" : "doc",
      size: file.size,
      deletedAt: "Just now",
      selected: false,
    };
    setState((s) => ({
      ...s,
      files: s.files.filter((f) => f.id !== file.id),
      deletedFiles: [deleted, ...s.deletedFiles],
    }));
  }, []);

  const storageTotalGb = 32;
  const filesBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const duplicatesBytes = duplicateGroups.reduce((sum, d) => sum + d.sizeBytes * d.count, 0);
  const storageWhatsAppGb = (filesBytes + duplicatesBytes) / 1e9;
  const storageDuplicatesGb = duplicatesBytes / 1e9;
  const storageUsedGb = Math.min(storageTotalGb, (filesBytes + duplicatesBytes) / 1e9);

  const categories = useMemo(() => {
    const byType = { images: 0, videos: 0, audio: 0, docs: 0 };
    const bytesByType = { images: 0, videos: 0, audio: 0, docs: 0 };
    files.forEach((f) => {
      byType[f.type]++;
      bytesByType[f.type] += f.sizeBytes;
    });
    return [
      { name: "Images", count: byType.images, size: formatBytes(bytesByType.images), sizeBytes: bytesByType.images },
      { name: "Videos", count: byType.videos, size: formatBytes(bytesByType.videos), sizeBytes: bytesByType.videos },
      { name: "Audio", count: byType.audio, size: formatBytes(bytesByType.audio), sizeBytes: bytesByType.audio },
      { name: "Documents", count: byType.docs, size: formatBytes(bytesByType.docs), sizeBytes: bytesByType.docs },
    ];
  }, [files]);

  const value: AppStateContextValue = useMemo(
    () => ({
      storageTotalGb,
      storageUsedGb,
      storageWhatsAppGb,
      storageDuplicatesGb,
      categories,
      duplicateGroups,
      setDuplicateGroups,
      files,
      setFiles,
      deletedFiles,
      setDeletedFiles,
      backupComplete: state.backupComplete,
      lastBackupSizeGb: state.lastBackupSizeGb,
      lastScannedAt: state.lastScannedAt,
      runScan,
      deleteSelectedDuplicates,
      toggleDuplicateSelection,
      selectAllDuplicates,
      restoreSelectedFiles,
      toggleDeletedSelection,
      completeBackup,
      resetBackup,
      addFiles,
      deleteFile,
      moveToDeleted,
    }),
    [
      state.backupComplete,
      state.lastBackupSizeGb,
      state.lastScannedAt,
      storageTotalGb,
      storageUsedGb,
      storageWhatsAppGb,
      storageDuplicatesGb,
      categories,
      duplicateGroups,
      files,
      deletedFiles,
      setDuplicateGroups,
      setFiles,
      setDeletedFiles,
      runScan,
      deleteSelectedDuplicates,
      toggleDuplicateSelection,
      selectAllDuplicates,
      restoreSelectedFiles,
      toggleDeletedSelection,
      completeBackup,
      resetBackup,
      addFiles,
      deleteFile,
      moveToDeleted,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

function parseSizeToBytes(sizeStr: string): number {
  const n = parseFloat(sizeStr);
  if (sizeStr.includes("GB")) return n * 1e9;
  if (sizeStr.includes("MB")) return n * 1e6;
  if (sizeStr.includes("KB")) return n * 1e3;
  return n;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
