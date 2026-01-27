import type { MediaItem } from "./post-utils";

/**
 * Limites de caracteres por plataforma
 */
export const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  pinterest: 500,
  reddit: 40000,
  bluesky: 300,
  threads: 500,
  googlebusiness: 1500,
};

/**
 * Plataformas que suportam PDF
 */
export const PDF_SUPPORTED_PLATFORMS = ["linkedin", "facebook"];

/**
 * Obtém o limite de caracteres para uma plataforma
 * @param platform - Nome da plataforma (case-insensitive)
 * @returns Limite de caracteres ou null se não encontrado
 */
export function getPlatformCharLimit(platform: string): number | null {
  const normalized = platform.toLowerCase();
  return PLATFORM_CHAR_LIMITS[normalized] ?? null;
}

/**
 * Valida se o conteúdo está dentro do limite de caracteres da plataforma
 * @param content - Conteúdo do post
 * @param platform - Nome da plataforma
 * @returns Objeto com resultado da validação
 */
export function validateCharLimit(
  content: string,
  platform: string
): {
  valid: boolean;
  limit: number | null;
  actual: number;
  over: number;
} {
  const limit = getPlatformCharLimit(platform);
  const actual = content.length;

  if (limit === null) {
    // Se não há limite definido, considera válido
    return {
      valid: true,
      limit: null,
      actual,
      over: 0,
    };
  }

  return {
    valid: actual <= limit,
    limit,
    actual,
    over: Math.max(0, actual - limit),
  };
}

/**
 * Verifica se uma plataforma suporta PDF
 * @param platform - Nome da plataforma (case-insensitive)
 * @returns true se a plataforma suporta PDF
 */
export function supportsPdf(platform: string): boolean {
  const normalized = platform.toLowerCase();
  return PDF_SUPPORTED_PLATFORMS.includes(normalized);
}

/**
 * Verifica se há PDFs nos mediaItems
 * @param mediaItems - Array de itens de mídia
 * @returns true se há pelo menos um PDF
 */
export function hasPdf(mediaItems: MediaItem[]): boolean {
  return mediaItems.some(
    (item) =>
      item.type === "document" ||
      item.mimeType === "application/pdf" ||
      (item.filename && item.filename.toLowerCase().endsWith(".pdf"))
  );
}

/**
 * Valida suporte a PDF para as plataformas fornecidas
 * @param mediaItems - Array de itens de mídia
 * @param platforms - Array de nomes de plataformas
 * @returns Objeto com resultado da validação
 */
export function validatePdfSupport(
  mediaItems: MediaItem[],
  platforms: string[]
): {
  valid: boolean;
  unsupported: string[];
} {
  if (!hasPdf(mediaItems)) {
    // Se não há PDFs, todas as plataformas são válidas
    return {
      valid: true,
      unsupported: [],
    };
  }

  const unsupported = platforms.filter(
    (platform) => !supportsPdf(platform)
  );

  return {
    valid: unsupported.length === 0,
    unsupported,
  };
}
