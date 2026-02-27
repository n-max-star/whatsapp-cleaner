import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dashboard from "@/components/Dashboard";
import Scanner from "@/components/Scanner";
import FileManager from "@/components/FileManager";
import RestoreFiles from "@/components/RestoreFiles";
import BackupScreen from "@/components/BackupScreen";
import BottomNav from "@/components/BottomNav";

export type TabType = "home" | "scan" | "files" | "restore" | "backup";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard onNavigate={setActiveTab} />;
      case "scan":
        return <Scanner />;
      case "files":
        return <FileManager />;
      case "restore":
        return <RestoreFiles />;
      case "backup":
        return <BackupScreen />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto pb-24"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
