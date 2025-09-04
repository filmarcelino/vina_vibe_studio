import * as path from 'path';
import * as fs from 'fs';

export interface ReplaceTextParams {
  projectRoot: string;          // caminho do projeto que o runner serve
  filePath: string;             // ex.: 'src/App.tsx'
  componentName: string;        // ex.: 'App' ou 'Hero'
  newText: string;
}

export interface ReplaceTextResult {
  updatedContent: string;
}

export async function replaceTextInComponent(params: ReplaceTextParams): Promise<ReplaceTextResult> {
  throw new Error('AST disabled');
}

export interface ReplaceImageSourceParams {
  projectRoot: string;
  filePath: string;             // relativo ao root
  componentName: string;        // alvo (p.ex. 'Hero' ou 'App')
  newSrc: string;               // p.ex. '/assets/hero.webp'
  alt?: string;
  candidateProps?: string[];    // default: ['src','image','imageSrc','icon','logo']
}

export interface ReplaceImageSourceResult {
  updatedContent: string;
}

export async function replaceImageSourceInComponent(params: ReplaceImageSourceParams): Promise<ReplaceImageSourceResult> {
  throw new Error('AST disabled');
}