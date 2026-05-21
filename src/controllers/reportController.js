const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Reporte de ventas totales en un período (sin costos)
const getSalesReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["Confirmado", "Entregado"] },
        createdAt: { gte: start, lte: end },
      },
      include: { items: true },
    });

    let totalSales = 0;
    let totalItems = 0;
    for (const order of orders) {
      totalSales += order.total;
      totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    res.json({
      startDate: start,
      endDate: end,
      totalSales,
      totalItems,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar reporte de ventas" });
  }
};

// Productos más vendidos (top 5)
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const result = topProducts.map((tp) => ({
      productId: tp.productId,
      name: products.find((p) => p.id === tp.productId)?.name || "Desconocido",
      totalQuantity: tp._sum.quantity,
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos más vendidos" });
  }
};

// Distribución de pedidos por estado (para gráfico)
const getOrdersByStatus = async (req, res) => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const result = statusCounts.map((sc) => ({
      status: sc.status,
      count: sc._count.id,
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener distribución de estados" });
  }
};

module.exports = { getSalesReport, getTopProducts, getOrdersByStatus };
