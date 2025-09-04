"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Monaco } from "@/components/monaco-editor";
import { ChatPanel } from "@/components/chat-panel";
import { PreviewPanel } from "@/components/preview-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { locateComponentByDomPath, type Located } from "@vina/overlay-mapper";
import { 
  Edit, 
  MessageCircle, 
  Image as ImageIcon, 
  Monitor, 
  Smartphone, 
  RotateCcw, 
  ExternalLink,
  Search
} from "lucide-react";

export default function PlaygroundPage() {
  const [selectedElement, setSelectedElement] = useState<Located | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isAssetsDrawerOpen, setIsAssetsDrawerOpen] = useState(false);
  const [ragQuery, setRagQuery] = useState("");
  const [ragResults, setRagResults] = useState<string[]>([]);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Handle preview element clicks
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.type === 'preview:elementClick') {
        const { domPath } = event.data;
        console.log('Received domPath from preview:', domPath);
        
        // Call locateComponentByDomPath to get component info (stub)
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

  // RAG search function
  const handleRagSearch = async () => {
    if (!ragQuery.trim()) return;
    
    setIsRagLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: ragQuery })
      });
      
      const result = await response.json();
      
      if (result.ok && result.answers) {
        setRagResults(result.answers.slice(0, 3)); // Primeiras 3 respostas
      } else {
        toast.error('Erro ao buscar no RAG');
      }
    } catch (error) {
      console.error('RAG error:', error);
      toast.error('Erro ao conectar com RAG');
    } finally {
      setIsRagLoading(false);
    }
  };

  // Load assets
  const loadAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const response = await fetch('/api/assets/list');
      const result = await response.json();
      
      if (result.ok) {
        setAssets(result.assets || []);
      } else {
        toast.error('Erro ao carregar assets');
      }
    } catch (error) {
      console.error('Assets error:', error);
      toast.error('Erro ao carregar assets');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Apply asset to selected element
  const applyAsset = async (asset: any) => {
    if (!selectedElement) {
      toast.error('Nenhum elemento selecionado');
      return;
    }

    try {
      const response = await fetch('/api/assets/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: selectedElement.file,
          componentName: selectedElement.componentName,
          asset: asset
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        toast.success('Asset aplicado com sucesso!');
        setIsAssetsDrawerOpen(false);
      } else {
        toast.error(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Apply asset error:', error);
      toast.error('Erro ao aplicar asset');
    }
  };

  // Reload preview
  const reloadPreview = () => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Layout - 3 columns */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Chat & RAG */}
        <div className="w-80 border-r bg-white flex flex-col">
          <Tabs defaultValue="plan" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="plan">Plan</TabsTrigger>
              <TabsTrigger value="quick">Quick changes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plan" className="flex-1 flex flex-col m-0">
              <div className="flex-1">
                <ChatPanel />
              </div>
            </TabsContent>
            
            <TabsContent value="quick" className="flex-1 flex flex-col m-0 p-4">
              <div className="text-sm text-gray-600 mb-4">
                Quick changes and modifications
              </div>
              <div className="text-xs text-gray-400">
                Coming soon...
              </div>
            </TabsContent>
          </Tabs>
          
          {/* RAG Search */}
          <div className="border-t p-4">
            <Label className="text-sm font-medium mb-2 block">Perguntar ao RAG</Label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Digite sua pergunta..."
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRagSearch()}
                className="flex-1"
              />
              <Button 
                size="sm" 
                onClick={handleRagSearch}
                disabled={isRagLoading}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            {ragResults.length > 0 && (
              <div className="space-y-2">
                {ragResults.map((answer, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                    {answer}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Preview Panel */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1">
            <PreviewPanel 
              width={deviceMode === 'mobile' ? '390px' : '100%'}
              showOverlay={isEditMode}
            />
          </div>
        </div>

        {/* Right Inspector */}
        <div className="w-96 border-l bg-white flex flex-col">
          <Tabs defaultValue="selection" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="selection">Selection</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="selection" className="flex-1 m-0 p-4">
              {selectedElement ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Element Selected</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">File:</span>
                        <span className="ml-2 font-mono">{selectedElement.file}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Component:</span>
                        <span className="ml-2 font-mono">{selectedElement.componentName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Line:</span>
                        <span className="ml-2 font-mono">{selectedElement.line}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Column:</span>
                        <span className="ml-2 font-mono">{selectedElement.col}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled
                      onClick={() => toast.info('AST em breve')}
                    >
                      Editar Texto
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsAssetsDrawerOpen(true);
                        loadAssets();
                      }}
                    >
                      Trocar Imagem
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center mt-8">
                  Clique em um elemento no preview para selecioná-lo
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="editor" className="flex-1 m-0">
              {selectedElement ? (
                <div className="h-full flex flex-col">
                  <div className="border-b px-4 py-2 bg-gray-50">
                    <span className="text-sm text-gray-600">{selectedElement.file}</span>
                  </div>
                  <div className="flex-1">
                    <Monaco
                      value={`// Read-only preview of ${selectedElement.file}\n// Full editor coming soon...`}
                      language="typescript"
                      options={{ readOnly: true }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center mt-8 p-4">
                  Selecione um elemento para ver o código
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="border-t bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button size="sm" variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setIsAssetsDrawerOpen(true);
              loadAssets();
            }}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Assets
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded">
            <Button 
              size="sm" 
              variant={deviceMode === 'desktop' ? "default" : "ghost"}
              onClick={() => setDeviceMode('desktop')}
              className="rounded-r-none"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant={deviceMode === 'mobile' ? "default" : "ghost"}
              onClick={() => setDeviceMode('mobile')}
              className="rounded-l-none"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={reloadPreview}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reload
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open('http://localhost:5173', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
      </div>

      {/* Assets Drawer */}
      <Dialog open={isAssetsDrawerOpen} onOpenChange={setIsAssetsDrawerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assets</DialogTitle>
          </DialogHeader>
          
          {isLoadingAssets ? (
            <div className="text-center py-8">Carregando assets...</div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {assets.map((asset, index) => (
                <div key={index} className="border rounded p-2 hover:bg-gray-50 cursor-pointer" onClick={() => applyAsset(asset)}>
                  {asset.kind === 'image' ? (
                    <Image src={asset.url} alt={asset.fileName} width={80} height={80} className="w-full h-20 object-cover rounded mb-2" />
                  ) : (
                    <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs">
                      SVG
                    </div>
                  )}
                  <div className="text-xs text-gray-600 truncate">{asset.fileName}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}