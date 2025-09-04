'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, FileImage, ArrowLeft, Target, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSelection, selectionUtils } from '@/stores/selection-store';

interface Asset {
  url: string;
  kind: 'image' | 'svg';
  filename?: string;
  timestamp?: number;
}

interface AssetResult {
  url: string;
  kind: 'image' | 'svg';
  width?: number;
  height?: number;
  alt?: string;
  viewBox?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');

  // Carregar assets existentes
  const loadAssets = useCallback(async () => {
    try {
      const response = await fetch('/api/assets/list');
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Erro ao carregar assets:', error);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Upload de arquivo
  const handleUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (altText.trim()) {
      formData.append('alt', altText.trim());
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.ok) {
        toast.success(`Asset ${file.name} enviado com sucesso!`);
        setSelectedFile(null);
        setAltText('');
        await loadAssets(); // Recarregar lista
      } else {
        toast.error(result.error || 'Erro no upload');
      }
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Hook do SelectionStore
  const { selection, hasSelection, toggleSelectionMode, isSelectionMode } = useSelection();

  // Aplicar asset no preview
  const handleApplyAsset = async (asset: Asset) => {
    if (!hasSelection) {
      toast.error('Selecione um elemento no preview primeiro');
      return;
    }

    if (!selectionUtils.isValidForAssets(selection)) {
      toast.error('O elemento selecionado não é adequado para aplicar imagens');
      return;
    }

    try {
      const response = await fetch('/api/assets/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: selection!.file,
          componentName: selection!.componentName,
          targetAttr: selection!.targetAttr,
          asset: {
            url: asset.url,
            kind: asset.kind
          },
          alt: altText || `Imagem ${asset.filename || 'importada'}`
        })
      });

      const result = await response.json();
      if (result.ok) {
        toast.success('Asset aplicado com sucesso no preview!');
      } else {
        toast.error(result.error || 'Erro ao aplicar asset');
      }
    } catch (error) {
      toast.error('Erro ao aplicar asset');
      console.error('Apply asset error:', error);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => 
      file.type.startsWith('image/') || file.type === 'image/svg+xml'
    );

    if (imageFile) {
      setSelectedFile(imageFile);
    } else {
      toast.error('Por favor, selecione um arquivo de imagem válido');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Assets Manager
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        {/* Selection Status */}
        {hasSelection && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Elemento selecionado:</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                {selectionUtils.formatSelectionInfo(selection)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Selection Mode Toggle */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Modo de Seleção</span>
              </div>
              <Button
                variant={isSelectionMode ? "default" : "outline"}
                size="sm"
                onClick={toggleSelectionMode}
              >
                {isSelectionMode ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isSelectionMode 
                ? 'Clique em elementos no preview para selecioná-los'
                : 'Ative o modo de seleção para escolher elementos no preview'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Assets
            </CardTitle>
            <CardDescription>
              Faça upload de imagens (PNG, JPG, WEBP) ou SVGs para usar em seus projetos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileImage className="w-12 h-12 mx-auto text-green-600" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-600">
                    Arraste e solte uma imagem aqui, ou clique para selecionar
                  </p>
                </div>
              )}
            </div>

            {/* File Input */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="file-upload">Selecionar Arquivo</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="alt-text">Texto Alternativo (opcional)</Label>
                <Input
                  id="alt-text"
                  type="text"
                  placeholder="Descrição da imagem..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button 
              onClick={() => selectedFile && handleUpload(selectedFile)}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? 'Enviando...' : 'Fazer Upload'}
            </Button>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Assets Disponíveis</CardTitle>
            <CardDescription>
              {assets.length} asset{assets.length !== 1 ? 's' : ''} encontrado{assets.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum asset encontrado</p>
                <p className="text-sm">Faça upload de imagens para começar</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {assets.map((asset, index) => (
                  <Card key={`${asset.url}-${index}`} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-100 flex items-center justify-center">
                      {asset.kind === 'svg' ? (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <Image 
                            src={asset.url} 
                            alt={asset.filename || 'SVG'}
                            width={200}
                            height={200}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <Image 
                          src={asset.url} 
                          alt={asset.filename || 'Image'}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs text-slate-600 truncate mb-2">
                        {asset.filename || asset.url.split('/').pop()}
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => handleApplyAsset(asset)}
                        disabled={!hasSelection}
                        variant={hasSelection ? "default" : "outline"}
                      >
                        {hasSelection ? 'Aplicar no Preview' : 'Selecione Elemento'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}