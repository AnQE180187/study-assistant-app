const prisma = require("../config/prismaClient");

// Lưu log AI khi user sử dụng AI
const createAiLog = async (userId, prompt, response) => {
  return prisma.aiLog.create({
    data: { userId, prompt, response },
  });
};

// Lấy toàn bộ log AI (chỉ admin)
const getAiLogs = async (req, res) => {
  try {
    // Check admin role
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const { userId, search, date, page = 1, limit = 20 } = req.query;
    const where = {};

    // Build search conditions
    if (userId) where.userId = userId;
    if (search) {
      where.OR = [
        { prompt: { contains: search, mode: "insensitive" } },
        { response: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.aiLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.aiLog.count({ where }),
    ]);

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa log AI (admin)
const deleteAiLog = async (req, res) => {
  try {
    // Check admin role
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    await prisma.aiLog.delete({ where: { id: req.params.id } });
    res.json({ message: "AI log deleted" });
  } catch (error) {
    console.error("Error deleting AI log:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAiLog, getAiLogs, deleteAiLog };
