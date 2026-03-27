// src/controllers/orderController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear un pedido (sin descuento de stock)
const createOrder = async (req, res) => {
  const { customerName, customerEmail, customerPhone, customerAddress, items } =
    req.body;

  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // Verificar productos, stock y calcular total
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res
          .status(404)
          .json({ error: `Producto con ID ${item.productId} no encontrado` });
      }
      // Verificar stock suficiente
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
        });
      }
      total += product.price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Crear el pedido en estado Pendiente
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        total,
        status: "Pendiente",
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el pedido" });
  }
};

// Obtener todos los pedidos (solo admin)
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// Obtener un pedido por ID (admin)
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pedido" });
  }
};

// Actualizar estado del pedido (admin)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "Pendiente",
    "Confirmado",
    "Enviado",
    "Entregado",
    "Cancelado",
  ];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Lógica de transacción para cambios de estado que afectan stock
    if (status === "Confirmado" && order.status !== "Confirmado") {
      // Confirmar: descontar stock (solo si no estaba confirmado antes)
      // Verificar que haya suficiente stock para cada producto
      for (const item of order.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            error: `Stock insuficiente para ${product?.name || "producto"}. Disponible: ${product?.stock || 0}`,
          });
        }
      }

      // Realizar transacción: descontar stock y actualizar estado
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: parseInt(id) },
          data: { status },
        });
      });
    } else if (status === "Cancelado" && order.status === "Confirmado") {
      // Cancelar un pedido confirmado: restituir stock
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: parseInt(id) },
          data: { status },
        });
      });
    } else {
      // Otros cambios de estado (Pendiente->Enviado, etc.) no afectan stock
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status },
      });
      return res.json(updatedOrder);
    }

    // Devolver el pedido actualizado
    const updatedOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } },
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estado del pedido" });
  }
};

// Eliminar un pedido (admin) – opcional, con manejo de stock si estaba confirmado
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (order.status === "Confirmado") {
      // Si estaba confirmado, debemos restituir stock antes de borrar
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.delete({ where: { id: parseInt(id) } });
      });
    } else {
      await prisma.order.delete({ where: { id: parseInt(id) } });
    }

    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el pedido" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
