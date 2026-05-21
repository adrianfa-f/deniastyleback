const express = require("express");
const {
  getSalesReport,
  getTopProducts,
  getOrdersByStatus,
} = require("../controllers/reportController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/sales", authMiddleware, getSalesReport);
router.get("/top-products", authMiddleware, getTopProducts);
router.get("/orders-by-status", authMiddleware, getOrdersByStatus);

module.exports = router;
