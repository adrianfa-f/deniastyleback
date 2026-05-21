const { PrismaClient } = require("@prisma/client");
const { deleteImagesFromUrls } = require("../services/cloudinaryCleanup");

const prisma = new PrismaClient();

// Obtener todos los productos (público) con filtros
const getProducts = async (req, res) => {
  try {
    const { categoryId, search, minPrice, maxPrice } = req.query;
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice) where.price = { gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// Obtener producto por ID (público)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

// Crear producto (admin)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      stock,
      categoryId,
      images,
      attributes,
      destacado,
    } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        categoryId: parseInt(categoryId),
        images: images || [],
        attributes: attributes || [],
        destacado: destacado || false,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002")
      return res.status(400).json({ error: "Slug ya existe" });
    res.status(500).json({ error: "Error al crear producto" });
  }
};

// Actualizar producto (admin) – con eliminación de imágenes viejas
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const oldProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!oldProduct)
      return res.status(404).json({ error: "Producto no encontrado" });

    // Limpiar imágenes que ya no se usan
    if (data.images && Array.isArray(data.images)) {
      const oldImages = oldProduct.images || [];
      const imagesToDelete = oldImages.filter(
        (img) => !data.images.includes(img),
      );
      if (imagesToDelete.length) {
        await deleteImagesFromUrls(imagesToDelete);
      }
    }

    // Convertir tipos
    if (data.price) data.price = parseFloat(data.price);
    if (data.stock) data.stock = parseInt(data.stock);
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    delete data.id; // evitar modificar ID

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ error: "Producto no encontrado" });
    if (error.code === "P2002")
      return res.status(400).json({ error: "Slug ya existe" });
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// Eliminar producto (admin) – borra imágenes de Cloudinary
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    if (product.images && product.images.length) {
      await deleteImagesFromUrls(product.images);
    }

    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ error: "Producto no encontrado" });
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
