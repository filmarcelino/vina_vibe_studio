import { NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    // Verificar se o diretório existe
    try {
      await fs.access(assetsDir);
    } catch {
      // Diretório não existe, retornar lista vazia
      return NextResponse.json({
        ok: true,
        assets: []
      });
    }

    // Listar arquivos no diretório
    const files = await fs.readdir(assetsDir);
    
    // Importar detectAssetKind dinamicamente
    const { detectAssetKind } = await import('@vina/asset-pipelines');
    
    const assets = files
      .filter(file => {
        // Filtrar apenas arquivos de asset válidos
        const kind = detectAssetKind(file);
        return kind === 'image' || kind === 'svg';
      })
      .map(file => {
        const kind = detectAssetKind(file);
        const url = `/assets/${file}`;
        
        return {
          url,
          kind,
          fileName: file,
          // Adicionar timestamp baseado no nome do arquivo se disponível
          createdAt: extractTimestampFromFileName(file)
        };
      })
      .sort((a, b) => {
        // Ordenar por data de criação (mais recente primeiro)
        if (a.createdAt && b.createdAt) {
          return b.createdAt - a.createdAt;
        }
        return a.fileName.localeCompare(b.fileName);
      });

    return NextResponse.json({
      ok: true,
      assets
    });

  } catch (error) {
    console.error('Erro ao listar assets:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Extrai timestamp do nome do arquivo gerado pela função generateUniqueFileName
 */
function extractTimestampFromFileName(fileName: string): number | null {
  // Padrão: nome-timestamp-random.ext
  const match = fileName.match(/-([0-9]{13})-[a-z0-9]{6}\./i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}