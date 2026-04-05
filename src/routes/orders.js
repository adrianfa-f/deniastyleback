// src/routes/orders.js
const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Público: crear pedido
router.post("/", createOrder);

// Rutas protegidas (admin)
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.put("/:id", authMiddleware, updateOrder);
router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;
