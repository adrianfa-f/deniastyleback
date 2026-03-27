// src/routes/products.js
const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/auth");
const { validateProduct } = require("../validators/productValidator");

const router = express.Router();

// Rutas públicas
router.get("/", getProducts);
router.get("/:id", getProductById);

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, validateProduct, createProduct);
router.put("/:id", authMiddleware, validateProduct, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
