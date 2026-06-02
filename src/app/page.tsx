"use client";

import { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useQueryStore } from "@/store/query-store";
import { Header } from "@/components/ui/header";
// import { Play } from "lucide-react";
import { SchemaPanel } from "@/components/query-builder/schema-panel";
import { QueryWorkspace } from "@/components/query-builder/query-workspace";
import { ResultsPanel } from "@/components/query-builder/results-panel";
import { HistoryPanel } from "@/components/query-builder/history-panel";

export default function Home() {
  const { currentQuery, initializeQuery, isDarkMode, toggleDarkMode } =
    useQueryStore();

  const hydrated = useQueryStore((state) => state.hydrated);

  const hydrateFromStorage = useQueryStore((state) => state.hydrateFromStorage);

  const historyMode = useQueryStore((state) => state.historyMode);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!currentQuery) {
      initializeQuery();
    }
  }, [currentQuery, initializeQuery]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (!hydrated) {
    return <div className="h-screen bg-app" />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {/* <main className="flex flex-1 flex-col lg:flex-row overflow-hidden"> */}
      <PanelGroup direction="horizontal" className="flex flex-1 h-full">
        {/* Left Panel - Schema Explorer */}
        <Panel defaultSize={25} minSize={18} maxSize={30}>
          {/* Left Panel - Schema Explorer */}
          <div className="h-full flex flex-col overflow-hidden bg-panel border-r border-border-secondary">
            <SchemaPanel />
          </div>
        </Panel>

        <ResizeHandle />

        {/* Center Panel - Query Builder */}
        <Panel defaultSize={45} minSize={35}>
          <div className="flex-1 flex flex-col overflow-hidden">
            {historyMode ? <HistoryPanel /> : <QueryWorkspace />}
          </div>
        </Panel>

        <ResizeHandle />

        {/* Right Panel - Results */}
        <Panel defaultSize={30} minSize={30} maxSize={40}>
          <div className="h-full flex flex-col overflow-hidden bg-panel border-l border-border-secondary">
            <ResultsPanel />
          </div>
        </Panel>
      </PanelGroup>
      {/* </main> */}
    </div>
  );
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-[4px] bg-border-secondary hover:bg-accent active:bg-accent transition-colors duration-150 cursor-col-resize" />
  );
}
