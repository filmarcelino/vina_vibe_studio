"use client";

import { useState, useEffect } from "react";
import { Monaco } from "@/components/monaco-editor";
import { ChatPanel } from "@/components/chat-panel";
import { PreviewPanel } from "@/components/preview-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { locateComponentByDomPath, type Located } from "@vina/overlay-mapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PlaygroundPage() {
  const [code, setCode] = useState(`import React from 'react';

function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hello World!</h1>
      <p className="text-gray-600">Welcome to Vina.dev Playground</p>
    </div>
  );
}

export default App;`);

  const [selectedElement, setSelectedElement] = useState<Located | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === 'preview:elementClick') {
        const { domPath } = event.data;
        console.log('Received domPath from preview:', domPath);
        
        // Call locateComponentByDomPath to get component info
        const located = locateComponentByDomPath(domPath);
        setSelectedElement(located);
        
        console.log('Located component:', located);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Topbar */}
      <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            Vina.dev — Vibe Creation Studio
          </h1>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* Left Column - Chat */}
        <div className="w-80 border-r bg-slate-50">
          <ChatPanel />
        </div>

        {/* Center Column - Monaco Editor */}
        <div className="flex-1 flex flex-col">
          <div className="border-b px-4 py-2 bg-white">
            <span className="text-sm text-slate-600">src/App.tsx</span>
          </div>
          <div className="flex-1">
            <Monaco
              value={code}
              onChange={(value) => setCode(value || "")}
              language="typescript"
            />
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="w-96 border-l flex flex-col">
          <div className="flex-1">
            <PreviewPanel />
          </div>
          
          {/* Selection Panel */}
          {selectedElement && (
            <div className="border-t bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Selection</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">File:</span>
                  <span className="ml-2 font-mono text-slate-900">{selectedElement.file}</span>
                </div>
                <div>
                  <span className="text-slate-500">Line:</span>
                  <span className="ml-2 font-mono text-slate-900">{selectedElement.line}</span>
                </div>
                <div>
                  <span className="text-slate-500">Column:</span>
                  <span className="ml-2 font-mono text-slate-900">{selectedElement.col}</span>
                </div>
                <div>
                  <span className="text-slate-500">Component:</span>
                  <span className="ml-2 font-mono text-slate-900">{selectedElement.componentName}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setNewText("");
                        setIsEditModalOpen(true);
                      }}
                    >
                      Editar Texto (AST)
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Texto do Componente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="component-info">Componente Selecionado:</Label>
                        <div className="text-sm text-slate-600 mt-1">
                          <div><strong>Arquivo:</strong> {selectedElement.file}</div>
                          <div><strong>Componente:</strong> {selectedElement.componentName}</div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="new-text">Novo Texto:</Label>
                        <Input
                          id="new-text"
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          placeholder="Digite o novo texto..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            if (!newText.trim()) {
                              toast.error("Por favor, digite um texto");
                              return;
                            }
                            
                            try {
                              const response = await fetch('/api/patch', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  file: selectedElement.file,
                                  componentName: selectedElement.componentName,
                                  newText: newText.trim()
                                })
                              });
                              
                              const result = await response.json();
                              
                              if (result.ok) {
                                toast.success("Texto atualizado com sucesso!");
                                setIsEditModalOpen(false);
                                setNewText("");
                              } else {
                                toast.error(`Erro: ${result.error}`);
                              }
                            } catch (error) {
                              console.error('Patch error:', error);
                              toast.error("Erro ao atualizar o texto");
                            }
                          }}
                          className="flex-1"
                        >
                          Aplicar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditModalOpen(false);
                            setNewText("");
                          }}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full" 
                  disabled
                >
                  Trocar Imagem (AST)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}