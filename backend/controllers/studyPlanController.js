const prisma = require("../config/prismaClient");

// @desc    Create a new study plan
// @route   POST /api/studyplans
// @access  Private
const createStudyPlan = async (req, res) => {
  try {
    const { title, date, startTime, endTime, note } = req.body;
    const userId = req.user.id;
    const plan = await prisma.studyPlan.create({
      data: {
        title,
        date: new Date(date),
        startTime: startTime || "09:00",
        endTime: endTime || "10:00",
        note: note || "",
        userId,
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all study plans for a user
// @route   GET /api/studyplans
// @access  Private
const getStudyPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    let whereClause = { userId };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Lấy plans với xử lý backward compatibility
    const plans = await prisma.studyPlan.findMany({
      where: whereClause,
      orderBy: [{ date: "asc" }],
    });

    // Xử lý dữ liệu để đảm bảo có startTime và endTime
    const processedPlans = plans.map((plan) => {
      // Nếu có startTime và endTime thì dùng
      if (plan.startTime && plan.endTime) {
        return plan;
      }

      // Nếu có time cũ thì chuyển đổi
      if (plan.time) {
        const oldTime = plan.time;
        let startTime = "09:00";
        let endTime = "10:00";

        if (oldTime.includes(":")) {
          const [hours, minutes] = oldTime.split(":");
          let startHour = parseInt(hours) || 9;
          let startMinute = parseInt(minutes) || 0;

          // Validate and fix invalid time values
          if (startHour >= 24) startHour = 9;
          if (startMinute >= 60) startMinute = 0;

          // Round minutes to nearest 5-minute interval
          startMinute = Math.round(startMinute / 5) * 5;
          if (startMinute >= 60) {
            startMinute = 0;
            startHour += 1;
          }

          // Tạo endTime bằng cách cộng thêm 1 giờ
          let endHour = startHour + 1;
          let endMinute = startMinute;

          if (endHour >= 24) endHour = 23;

          startTime = `${startHour.toString().padStart(2, "0")}:${startMinute
            .toString()
            .padStart(2, "0")}`;
          endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
            .toString()
            .padStart(2, "0")}`;
        }

        return {
          ...plan,
          startTime,
          endTime,
        };
      }

      // Fallback
      return {
        ...plan,
        startTime: "09:00",
        endTime: "10:00",
      };
    });

    // Sắp xếp theo startTime
    processedPlans.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`);
      const timeB = new Date(`2000-01-01T${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    });

    res.json(processedPlans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single study plan
// @route   GET /api/studyplans/:id
// @access  Private
const getStudyPlanById = async (req, res) => {
  try {
    const plan = await prisma.studyPlan.findUnique({
      where: { id: req.params.id },
    });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    if (plan.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all study plans (admin only)
// @route   GET /api/studyplans/all
// @access  Private/Admin
const getAllStudyPlansAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    const plans = await prisma.studyPlan.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: { user: { select: { name: true, email: true } } },
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sửa updateStudyPlan để cho phép admin update mọi plan
const updateStudyPlan = async (req, res) => {
  try {
    const { title, date, startTime, endTime, note, completed } = req.body;
    const plan = await prisma.studyPlan.findUnique({
      where: { id: req.params.id },
    });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    if (plan.userId !== req.user.id && req.user.role !== "admin")
      return res.status(401).json({ message: "Not authorized" });

    const data = {};
    if (title !== undefined) data.title = title;
    if (date && !isNaN(Date.parse(date))) data.date = new Date(date);
    if (startTime !== undefined) data.startTime = startTime;
    if (endTime !== undefined) data.endTime = endTime;
    if (note !== undefined) data.note = note;
    if (completed !== undefined) data.completed = completed;

    const updatedPlan = await prisma.studyPlan.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sửa deleteStudyPlan để cho phép admin xóa mọi plan
const deleteStudyPlan = async (req, res) => {
  try {
    const plan = await prisma.studyPlan.findUnique({
      where: { id: req.params.id },
    });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    if (plan.userId !== req.user.id && req.user.role !== "admin")
      return res.status(401).json({ message: "Not authorized" });
    await prisma.studyPlan.delete({ where: { id: req.params.id } });
    res.json({ message: "Study plan removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get study plans by date range
// @route   GET /api/studyplans/range
// @access  Private
const getStudyPlansByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const plans = await prisma.studyPlan.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    res.json(plans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle study plan completion
// @route   PATCH /api/studyplans/:id/toggle
// @access  Private
const toggleStudyPlanCompletion = async (req, res) => {
  try {
    const plan = await prisma.studyPlan.findUnique({
      where: { id: req.params.id },
    });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });
    if (plan.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const updatedPlan = await prisma.studyPlan.update({
      where: { id: req.params.id },
      data: { completed: !plan.completed },
    });
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get study plan statistics
// @route   GET /api/studyplans/stats
// @access  Private
const getStudyPlanStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const whereClause = { userId };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const totalPlans = await prisma.studyPlan.count({ where: whereClause });
    const completedPlans = await prisma.studyPlan.count({
      where: { ...whereClause, completed: true },
    });
    const upcomingPlans = await prisma.studyPlan.count({
      where: {
        ...whereClause,
        date: { gte: new Date() },
        completed: false,
      },
    });

    res.json({
      total: totalPlans,
      completed: completedPlans,
      upcoming: upcomingPlans,
      completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  getAllStudyPlansAdmin,
  updateStudyPlan,
  deleteStudyPlan,
  getStudyPlansByRange,
  toggleStudyPlanCompletion,
  getStudyPlanStats,
};
