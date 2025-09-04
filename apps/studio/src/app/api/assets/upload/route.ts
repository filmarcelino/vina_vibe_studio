import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import type { AssetResult } from '@vina/asset-pipelines';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verificar se é multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { ok: false, error: 'Content-Type deve ser multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'Campo "file" é obrigatório' },
        { status: 400 }
      );
    }

    // Importar funções dinamicamente
    const { optimizeImage, optimizeSvg, generateUniqueFileName, detectAssetKind } = await import('@vina/asset-pipelines');
    
    // Verificar tipo de arquivo
    const assetKind = detectAssetKind(file.name);
    if (assetKind === 'unknown') {
      return NextResponse.json(
        { ok: false, error: 'Tipo de arquivo não suportado. Use imagens (jpg, png, webp, gif) ou SVG.' },
        { status: 400 }
      );
    }

    // Ler variáveis de ambiente
    const runnerProjectRoot = process.env.RUNNER_PROJECT_ROOT;
    const assetsPublicSubdir = process.env.ASSETS_PUBLIC_SUBDIR || 'public/assets';

    if (!runnerProjectRoot) {
      return NextResponse.json(
        { ok: false, error: 'RUNNER_PROJECT_ROOT não configurado no .env' },
        { status: 500 }
      );
    }

    // Resolver caminho absoluto do diretório de assets
    const studioRoot = process.cwd();
    const runnerRoot = path.resolve(studioRoot, runnerProjectRoot);
    const assetsDir = path.join(runnerRoot, assetsPublicSubdir);

    // Gerar nome único para o arquivo
    const uniqueFileName = generateUniqueFileName(file.name);
    
    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let assetResult: AssetResult;

    if (assetKind === 'svg') {
      // Otimizar SVG
      assetResult = await optimizeSvg(buffer, assetsDir, uniqueFileName);
    } else {
      // Otimizar imagem
      assetResult = await optimizeImage(buffer, assetsDir, uniqueFileName, alt || undefined);
    }

    return NextResponse.json({
      ok: true,
      asset: assetResult
    });

  } catch (error) {
    console.error('Erro no upload de asset:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}