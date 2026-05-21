const cloudinary = require("cloudinary").v2;

// Configuración (ya debe estar hecha en otro lado, pero aseguramos)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extrae el public_id de una URL de Cloudinary
 * Ej: https://res.cloudinary.com/demo/image/upload/v123456/deniastyle/products/abc.jpg
 * -> "deniastyle/products/abc"
 */
function extractPublicIdFromUrl(url) {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const pathWithExt = parts[1];
  const pathWithoutExt = pathWithExt.replace(/\.[^/.]+$/, ""); // quitar extensión
  // Eliminar la versión (v123456/) si existe
  return pathWithoutExt.replace(/^v\d+\//, "");
}

/**
 * Elimina una imagen de Cloudinary dada su URL
 * @param {string} url
 */
async function deleteImageByUrl(url) {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) {
    console.warn("No se pudo extraer public_id de:", url);
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Imagen eliminada: ${publicId}`);
  } catch (err) {
    console.error("Error eliminando imagen", publicId, err);
  }
}

/**
 * Elimina múltiples imágenes de Cloudinary a partir de sus URLs
 * @param {string[]} urls
 */
async function deleteImagesFromUrls(urls) {
  for (const url of urls) {
    await deleteImageByUrl(url);
  }
}

module.exports = { deleteImageByUrl, deleteImagesFromUrls };
