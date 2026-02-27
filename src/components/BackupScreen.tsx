import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CheckCircle, Upload, Shield, Clock } from "lucide-react";
import { useAppState } from "@/context/AppState";
import { toast } from "sonner";

const BackupScreen = () => {
  const [backing, setBacking] = useState(false);
  const { storageWhatsAppGb, backupComplete, lastBackupSizeGb, completeBackup, resetBackup } = useAppState();
  const done = backupComplete;

  const handleBackup = () => {
    setBacking(true);
    const sizeGb = Math.round(storageWhatsAppGb * 10) / 10;
    setTimeout(() => {
      setBacking(false);
      completeBackup(sizeGb);
      toast.success("Backup complete", { description: `${sizeGb} GB saved to Google Drive` });
    }, 3000);
  };


  return (
    <div className="p-5 space-y-6">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Backup</h1>
        <p className="text-sm text-muted-foreground mt-1">Save files to Google Drive</p>
      </div>

      {/* Status Card */}
      <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4">
        <motion.div
          animate={backing ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center"
        >
          {done ? (
            <CheckCircle size={36} className="text-primary" />
          ) : (
            <Cloud size={36} className={backing ? "text-primary" : "text-muted-foreground"} />
          )}
        </motion.div>

        {done ? (
          <>
            <h2 className="font-semibold text-lg">Backup Complete!</h2>
            <p className="text-sm text-muted-foreground">{lastBackupSizeGb} GB backed up to Google Drive</p>
          </>
        ) : backing ? (
          <>
            <h2 className="font-semibold text-lg">Backing up...</h2>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full gradient-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Uploading WhatsApp media to Drive</p>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-lg">Ready to Backup</h2>
            <p className="text-sm text-muted-foreground">
              Back up {storageWhatsAppGb.toFixed(1)} GB of WhatsApp data to your Google Drive for safekeeping
            </p>
          </>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3">
        {[
          { icon: Shield, title: "Encrypted Transfer", desc: "Your files stay private and secure" },
          { icon: Upload, title: "Smart Sync", desc: "Only uploads new or changed files" },
          { icon: Clock, title: "Auto Backup", desc: "Schedule daily or weekly backups" },
        ].map((feat) => (
          <div
            key={feat.title}
            className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <feat.icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{feat.title}</p>
              <p className="text-xs text-muted-foreground">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {!done && !backing && (
        <button
          onClick={handleBackup}
          className="w-full gradient-primary py-3.5 rounded-xl font-semibold text-primary-foreground flex items-center justify-center gap-2"
        >
          <Cloud size={18} />
          Start Backup
        </button>
      )}

      {done && (
        <button
          onClick={() => resetBackup()}
          className="w-full bg-secondary py-3.5 rounded-xl font-semibold text-secondary-foreground"
        >
          Back to Settings
        </button>
      )}
    </div>
  );
};

export default BackupScreen;
