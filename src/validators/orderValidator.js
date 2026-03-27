// src/validators/orderValidator.js
const { body, validationResult } = require("express-validator");

const validateOrder = [
  body("customerName")
    .notEmpty()
    .withMessage("Nombre del cliente es obligatorio"),
  body("customerEmail").isEmail().withMessage("Email inválido"),
  body("customerPhone").notEmpty().withMessage("Teléfono es obligatorio"),
  body("customerAddress").notEmpty().withMessage("Dirección es obligatoria"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Debe incluir al menos un producto"),
  body("items.*.productId")
    .isInt({ min: 1 })
    .withMessage("ID de producto inválido"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Cantidad debe ser mayor a 0"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateOrder };
