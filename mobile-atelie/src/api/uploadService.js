import client from './client';

/**
 * upload de imagens para a API.
 *
 * O backend recebe via Multer no campo "image" e devolve a URL pública
 * já montada, nome gerado com hash + timestamp pra não ter conflito
 */
export const uploadService = {
  /**
   * @param {{uri: string, fileName?: string, type?: string}} asset
   * @returns {Promise<{imageUrl: string, filename: string, size: number}>}
   */
  async uploadImage(asset) {
    const formData = new FormData();

    // o corpo do multipart vem desse objeto;
    formData.append('image', {
      uri: asset.uri,
      name: asset.fileName || `foto-${Date.now()}.jpg`,
      type: asset.type || 'image/jpeg',
    });

    const { data } = await client.post('/upload/imagem', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // tempo mais longo pois imagem é mais pesado que JSON
      // 1000ms = 1s
      timeout: 60000,
    });

    return data;
  },

  /**
   * usado quando a imagem é alterada sem salvar, o que deixaria ela 
   * ocupando espaço e inutilizada
   */
  async deleteImage(filename) {
    if (!filename) return;
    await client.delete(`/upload/imagem/${filename}`);
  },
};

/** pega o nome do arquivo a partir da URL devolvida pela API. */
export const filenameFromUrl = url => {
  if (!url) return null;
  const parts = String(url).split('/');
  return parts[parts.length - 1] || null;
};