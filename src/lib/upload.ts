import { randomUUID } from "crypto";
import { writeFile, mkdir, rename, readdir, rmdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOADS_DIR = process.env.UPLOADS_DIR || "/app/uploads";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // MOV
  "video/x-msvideo", // AVI
  "video/webm",
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  type: "image" | "video";
}

/**
 * Valida o tipo MIME do arquivo
 */
export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Valida o tamanho do arquivo
 */
export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Determina o tipo de mídia baseado no MIME type
 */
export function getMediaType(mimeType: string): "image" | "video" {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
    return "image";
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimeType.toLowerCase())) {
    return "video";
  }
  throw new Error(`Unsupported MIME type: ${mimeType}`);
}

/**
 * Gera um nome único para o arquivo
 */
export function generateUniqueFilename(originalFilename: string): string {
  const ext = originalFilename.split(".").pop() || "";
  const uuid = randomUUID();
  return `${uuid}.${ext}`;
}

/**
 * Sanitiza o nome do arquivo removendo caracteres perigosos
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Salva um arquivo no sistema de arquivos
 */
export async function saveFile(
  postId: string,
  file: File | Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  // Criar diretório do post se não existir
  const postDir = join(UPLOADS_DIR, postId);
  if (!existsSync(postDir)) {
    await mkdir(postDir, { recursive: true });
  }

  // Caminho completo do arquivo
  const filePath = join(postDir, filename);

  // Converter File para Buffer se necessário
  let buffer: Buffer;
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = file;
  }

  // Salvar arquivo
  await writeFile(filePath, buffer);

  return filePath;
}

/**
 * Gera a URL pública do arquivo
 */
export function getFileUrl(postId: string, filename: string): string {
  return `/api/uploads/${postId}/${filename}`;
}

/**
 * Valida e processa upload de arquivo
 */
export async function processUpload(
  postId: string,
  file: File
): Promise<UploadResult> {
  // Validar tipo
  if (!validateMimeType(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
  }

  // Validar tamanho
  if (!validateFileSize(file.size)) {
    throw new Error(
      `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Gerar nome único
  const filename = generateUniqueFilename(file.name);

  // Salvar arquivo
  await saveFile(postId, file, filename, file.type);

  // Gerar URL
  const url = getFileUrl(postId, filename);

  // Determinar tipo
  const type = getMediaType(file.type);

  return {
    filename,
    url,
    size: file.size,
    mimeType: file.type,
    type,
  };
}

/**
 * Valida se a URL é válida para uso em posts
 * Aceita URLs locais do sandbox ou URLs do Google Cloud Storage
 */
export function validateUploadUrl(url: string): boolean {
  // URLs locais do sandbox: /api/uploads/*
  if (url.startsWith("/api/uploads/")) {
    // Não permitir path traversal
    if (url.includes("..")) {
      return false;
    }
    return true;
  }

  // URLs do Google Cloud Storage: https://storage.googleapis.com/*
  if (url.startsWith("https://storage.googleapis.com/")) {
    // Validar que seja HTTPS (segurança)
    if (!url.startsWith("https://")) {
      return false;
    }
    // Não permitir path traversal
    if (url.includes("..")) {
      return false;
    }
    return true;
  }

  // Rejeitar qualquer outra URL
  return false;
}

/**
 * Extrai postId e filename de uma URL de upload
 */
export function parseUploadUrl(url: string): { postId: string; filename: string } | null {
  if (!validateUploadUrl(url)) {
    return null;
  }

  const match = url.match(/^\/api\/uploads\/([^/]+)\/([^/]+)$/);
  if (!match) {
    return null;
  }

  return {
    postId: match[1],
    filename: match[2],
  };
}

/**
 * Move arquivos de um diretório temporário para o diretório do post
 */
export async function moveFilesToPostDir(
  tempPostId: string,
  finalPostId: string
): Promise<void> {
  const tempDir = join(UPLOADS_DIR, tempPostId);
  const finalDir = join(UPLOADS_DIR, finalPostId);

  // Se o diretório temporário não existe, não há nada para mover
  if (!existsSync(tempDir)) {
    return;
  }

  // Verificar se é realmente um diretório
  try {
    const stats = await stat(tempDir);
    if (!stats.isDirectory()) {
      return;
    }
  } catch {
    return;
  }

  // Criar diretório final se não existir
  if (!existsSync(finalDir)) {
    await mkdir(finalDir, { recursive: true });
  }

  // Listar arquivos no diretório temporário
  const files = await readdir(tempDir);

  // Mover cada arquivo
  for (const file of files) {
    const sourcePath = join(tempDir, file);
    const destPath = join(finalDir, file);

    // Verificar se é um arquivo (não um diretório)
    try {
      const fileStats = await stat(sourcePath);
      if (fileStats.isFile()) {
        await rename(sourcePath, destPath);
      }
    } catch (error) {
      console.error(`Erro ao mover arquivo ${file}:`, error);
      // Continuar com os outros arquivos mesmo se um falhar
    }
  }

  // Tentar remover diretório temporário (só funciona se estiver vazio)
  try {
    const remainingFiles = await readdir(tempDir);
    if (remainingFiles.length === 0) {
      await rmdir(tempDir);
    }
  } catch {
    // Ignorar erros ao remover diretório temporário
  }
}

