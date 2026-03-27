// src/validators/productValidator.js
const { body, validationResult } = require("express-validator");

const validateProduct = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("slug").notEmpty().withMessage("El slug es obligatorio"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número positivo"),
  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("La categoría debe ser un número entero positivo"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El stock debe ser un número entero no negativo"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Las imágenes deben ser un array"),
  body("attributes")
    .optional()
    .isArray()
    .withMessage("Los atributos deben ser un array"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateProduct };
