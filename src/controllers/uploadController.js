const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");

// Configurar Cloudinary con las credenciales de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar multer para almacenar en memoria (para luego subir a Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // límite 5MB

// Middleware para procesar un solo archivo llamado 'image'
const uploadSingle = upload.single("image");

const uploadImage = (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "Error al procesar la imagen: " + err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se ha enviado ninguna imagen" });
    }

    try {
      // Subir a Cloudinary usando el buffer del archivo
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "deniastyle/products", // carpeta opcional en Cloudinary
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });

      // Devolver la URL segura de la imagen
      res.json({ url: result.secure_url });
    } catch (error) {
      console.error("Error al subir a Cloudinary:", error);
      res.status(500).json({ error: "Error al subir la imagen a Cloudinary" });
    }
  });
};

module.exports = { uploadImage };
