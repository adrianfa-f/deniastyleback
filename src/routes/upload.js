const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Ruta protegida: solo administradores pueden subir imágenes
router.post("/", authMiddleware, uploadImage);

module.exports = router;
