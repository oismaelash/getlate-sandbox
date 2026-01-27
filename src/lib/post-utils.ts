export interface MediaItem {
  type: "image" | "video";
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export type ContentType = "post" | "reel" | "carousel";

/**
 * Infere o contentType baseado nos mediaItems
 * - 1 imagem → post
 * - 1 vídeo → reel
 * - 2+ imagens → carousel
 */
export function inferContentType(mediaItems: MediaItem[]): ContentType {
  if (mediaItems.length === 0) {
    throw new Error("Post precisa de pelo menos um item de mídia");
  }

  if (mediaItems.length === 1) {
    const item = mediaItems[0];
    if (item.type === "video") {
      return "reel";
    }
    if (item.type === "image") {
      return "post";
    }
    throw new Error(`Tipo de mídia não suportado: ${item.type}`);
  }

  // 2+ items
  const allImages = mediaItems.every((item) => item.type === "image");
  if (allImages) {
    return "carousel";
  }

  throw new Error("Carousel só aceita imagens. Não é possível misturar imagens e vídeos.");
}

