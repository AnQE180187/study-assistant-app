const prisma = require('../config/prismaClient');

// Lưu log AI khi user sử dụng AI
const createAiLog = async (userId, prompt, response) => {
  return prisma.aiLog.create({
    data: { userId, prompt, response }
  });
};

// Lấy toàn bộ log AI (chỉ admin)
const getAiLogs = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const { userId, keyword, date } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (keyword) where.prompt = { contains: keyword, mode: 'insensitive' };
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      where.createdAt = { gte: start, lte: end };
    }
    const logs = await prisma.aiLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa log AI (admin)
const deleteAiLog = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    await prisma.aiLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'AI log deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createAiLog, getAiLogs, deleteAiLog }; 