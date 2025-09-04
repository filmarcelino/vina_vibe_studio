import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';
import type { AssetResult } from '@vina/asset-pipelines';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ApplyAssetRequest {
  file: string;
  componentName?: string;
  targetAttr?: string;
  asset: AssetResult;
}

export async function POST(request: NextRequest) {
  try {
    const body: ApplyAssetRequest = await request.json();
    const { file, targetAttr, asset } = body;

    if (!file || !asset) {
      return NextResponse.json(
        { ok: false, error: 'Campos obrigatórios: file, asset' },
        { status: 400 }
      );
    }

    // Ler variáveis de ambiente
    const runnerProjectRoot = process.env.RUNNER_PROJECT_ROOT;

    if (!runnerProjectRoot) {
      return NextResponse.json(
        { ok: false, error: 'RUNNER_PROJECT_ROOT não configurado no .env' },
        { status: 500 }
      );
    }

    // Resolver caminho absoluto do projeto do runner
    const studioRoot = process.cwd();
    const runnerRoot = path.resolve(studioRoot, runnerProjectRoot);
    const fullFilePath = path.join(runnerRoot, file);

    // Verificar se o arquivo existe
    if (!fs.existsSync(fullFilePath)) {
      return NextResponse.json(
        { ok: false, error: `Arquivo não encontrado: ${file}` },
        { status: 404 }
      );
    }

    try {
      // Ler o conteúdo do arquivo
      let content = fs.readFileSync(fullFilePath, 'utf-8');

      // Replace simples usando regex
      const targetAttribute = targetAttr || 'src';
      
      // Substituir o primeiro atributo encontrado (src, image, etc.)
      const attrRegex = new RegExp(`${targetAttribute}=["']([^"']*)["']`, 'i');
      
      if (attrRegex.test(content)) {
        // Substituir o valor do atributo existente
        content = content.replace(attrRegex, `${targetAttribute}="${asset.url}"`);
      } else {
        // Se não encontrou o atributo, tentar adicionar src como fallback
        const srcRegex = /src=["']([^"']*)["']/i;
        if (srcRegex.test(content)) {
          content = content.replace(srcRegex, `src="${asset.url}"`);
        }
      }

      // Se o asset tem alt, atualizar ou inserir o atributo alt
      if (asset.alt) {
        const altRegex = /alt=["']([^"']*)["']/i;
        
        if (altRegex.test(content)) {
          // Substituir alt existente
          content = content.replace(altRegex, `alt="${asset.alt}"`);
        } else {
          // Inserir alt antes do fechamento da tag
          // Procura por tags que podem ter alt (img, Image, etc.)
          const tagRegex = /(<(?:img|Image)[^>]*)(>)/i;
          if (tagRegex.test(content)) {
            content = content.replace(tagRegex, `$1 alt="${asset.alt}"$2`);
          }
        }
      }

      // Fazer POST no runner para disparar HMR
      const runnerUrl = 'http://localhost:5173/api/update';
      
      const hmrResponse = await fetch(runnerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: file,
          content: content
        })
      });

      if (!hmrResponse.ok) {
        const errorText = await hmrResponse.text();
        throw new Error(`Erro no HMR: ${hmrResponse.status} - ${errorText}`);
      }

      return NextResponse.json({
        ok: true,
        message: 'Asset aplicado com sucesso',
        asset: {
          url: asset.url,
          kind: asset.kind
        }
      });

    } catch (fileError) {
      console.error('Erro no processamento do arquivo:', fileError);
      return NextResponse.json(
        { 
          ok: false, 
          error: `Erro ao processar arquivo: ${fileError instanceof Error ? fileError.message : 'Erro desconhecido'}` 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Erro na aplicação de asset:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}