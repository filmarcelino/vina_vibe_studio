import * as fs from 'fs/promises';
import * as path from 'path';

export type AssetResult = {
  url: string;
  kind: 'image' | 'svg';
  width?: number;
  height?: number;
  alt?: string;
  viewBox?: string;
};

/**
 * Otimiza uma imagem usando Sharp (se disponível) ou fallback para Jimp/cópia simples
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  destAbsDir: string,
  fileName: string,
  alt?: string
): Promise<AssetResult> {
  const fileBase = path.parse(fileName).name;
  
  // Garantir que o diretório de destino existe
  await fs.mkdir(destAbsDir, { recursive: true });

  // Fallback: copiar arquivo original (evitando Sharp/Jimp por enquanto)
  const outputPath = path.join(destAbsDir, fileName);
  await fs.writeFile(outputPath, inputBuffer);
  
  return {
    url: `/assets/${fileName}`,
    kind: 'image',
    alt
  };
}

/**
 * Salva um SVG sem otimização (SVGO removido conforme especificação)
 */
export async function optimizeSvg(
  inputPathOrBuffer: string | Buffer,
  destAbsDir: string,
  fileBase: string
): Promise<AssetResult> {
  // Garantir que o diretório de destino existe
  await fs.mkdir(destAbsDir, { recursive: true });

  let svgContent: string;

  if (typeof inputPathOrBuffer === 'string') {
    svgContent = await fs.readFile(inputPathOrBuffer, 'utf-8');
  } else {
    svgContent = inputPathOrBuffer.toString('utf-8');
  }

  // Salvar SVG original (sem otimização)
  const outputPath = path.join(destAbsDir, `${fileBase}.svg`);
  await fs.writeFile(outputPath, svgContent, 'utf-8');
  
  // Tentar extrair viewBox
  let viewBox: string | undefined;
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
  if (viewBoxMatch) {
    viewBox = viewBoxMatch[1];
  }
  
  return {
    url: `/assets/${fileBase}.svg`,
    kind: 'svg',
    viewBox
  };
}

/**
 * Utilitário para gerar nome de arquivo único
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${base}-${timestamp}-${random}`;
}

/**
 * Detecta o tipo de asset baseado na extensão
 */
export function detectAssetKind(fileName: string): 'image' | 'svg' | 'unknown' {
  const ext = path.extname(fileName).toLowerCase();
  
  if (ext === '.svg') {
    return 'svg';
  }
  
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].includes(ext)) {
    return 'image';
  }
  
  return 'unknown';
}