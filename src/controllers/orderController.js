const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Crear un pedido (público, sin descuento de stock)
const createOrder = async (req, res) => {
  const { customerName, customerEmail, customerPhone, customerAddress, items } =
    req.body;

  if (!customerName || !customerEmail || !items || !items.length) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
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

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        total,
        status: "Pendiente",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el pedido" });
  }
};

// Obtener todos los pedidos (admin)
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: { include: { category: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// Obtener pedido por ID (admin)
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el pedido" });
  }
};

// Actualizar estado del pedido (admin) – sin FIFO, stock simple
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
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    // Confirmar pedido: descontar stock
    if (status === "Confirmado" && order.status !== "Confirmado") {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para producto ID ${item.productId}`,
            );
          }
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
    }
    // Cancelar pedido confirmado: restituir stock
    else if (status === "Cancelado" && order.status === "Confirmado") {
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
    }
    // Otros cambios de estado (Pendiente->Enviado, etc.) no afectan inventario
    else {
      await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } },
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || "Error al actualizar estado" });
  }
};

// Editar pedido completo (solo Pendiente)
const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { customerName, customerEmail, customerPhone, customerAddress, items } =
    req.body;
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    if (!existingOrder)
      return res.status(404).json({ error: "Pedido no encontrado" });
    if (existingOrder.status !== "Pendiente") {
      return res
        .status(400)
        .json({ error: "Solo se pueden editar pedidos pendientes" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: parseInt(id) },
        data: { customerName, customerEmail, customerPhone, customerAddress },
      });
      await tx.orderItem.deleteMany({ where: { orderId: parseInt(id) } });
      let total = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product)
          throw new Error(`Producto ${item.productId} no encontrado`);
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }
        total += product.price * item.quantity;
        await tx.orderItem.create({
          data: {
            orderId: parseInt(id),
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        });
      }
      await tx.order.update({ where: { id: parseInt(id) }, data: { total } });
    });
    res.json({ message: "Pedido actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.message || "Error al actualizar pedido" });
  }
};

// Eliminar pedido (admin)
const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    if (order.status === "Confirmado") {
      // Restituir stock antes de eliminar
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
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
};
