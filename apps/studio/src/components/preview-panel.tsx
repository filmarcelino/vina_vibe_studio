"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

interface PreviewStatus {
  status: "online" | "offline" | "loading";
  message: string;
  url?: string;
}

interface PreviewPanelProps {
  width?: string;
  showOverlay?: boolean;
}

export function PreviewPanel({ width = "100%", showOverlay = false }: PreviewPanelProps) {
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>({
    status: "loading",
    message: "Checking runner status...",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const checkRunnerStatus = async () => {
    try {
      setPreviewStatus({ status: "loading", message: "Checking runner status..." });
      
      const response = await fetch("/api/preview");
      const data = await response.json();

      if (response.ok && data.status === "online") {
        setPreviewStatus({
          status: "online",
          message: data.message,
          url: data.url,
        });
      } else {
        setPreviewStatus({
          status: "offline",
          message: data.message || "Runner offline",
        });
      }
    } catch (error) {
      setPreviewStatus({
        status: "offline",
        message: "Failed to connect to runner",
      });
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    checkRunnerStatus();
  };

  const openInNewTab = () => {
    if (previewStatus.url) {
      window.open(previewStatus.url, "_blank");
    }
  };

  useEffect(() => {
    checkRunnerStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkRunnerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Preview</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} size="sm" variant="ghost">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {previewStatus.status === "online" && (
              <Button onClick={openInNewTab} size="sm" variant="ghost">
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              previewStatus.status === "online"
                ? "bg-green-500"
                : previewStatus.status === "loading"
                ? "bg-yellow-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-600">{previewStatus.message}</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        {previewStatus.status === "online" && previewStatus.url ? (
          <div 
            className="relative bg-white shadow-lg"
            style={{ width, maxWidth: '100%', height: '100%' }}
          >
            <iframe
              key={refreshKey}
              src={previewStatus.url}
              className="w-full h-full border-0 rounded"
              title="Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
            {showOverlay && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-blue-500 opacity-50 rounded"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {previewStatus.status === "loading" ? "Loading..." : "Runner Offline"}
              </h3>
              <p className="text-gray-600 mb-4">{previewStatus.message}</p>
              {previewStatus.status === "offline" && (
                <div className="text-sm text-gray-500">
                  <p>Para iniciar o preview runner:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded mt-2 block">
                    pnpm dev:runner
                  </code>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}