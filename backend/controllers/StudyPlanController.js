const StudyPlan = require('../models/StudyPlan');

class StudyPlanController {
  static async createStudyPlan(req, res) {
    try {
      const { title, description, goals, startDate, endDate, schedule } = req.body;
      const userId = req.user.id;

      const studyPlan = await StudyPlan.create({
        userId,
        title,
        description,
        goals,
        startDate,
        endDate,
        schedule
      });

      res.status(201).json({
        status: 'success',
        data: {
          studyPlan: {
            id: studyPlan.id,
            title: studyPlan.title,
            description: studyPlan.description,
            goals: studyPlan.goals,
            startDate: studyPlan.startDate,
            endDate: studyPlan.endDate,
            schedule: studyPlan.schedule,
            status: studyPlan.status,
            createdAt: studyPlan.createdAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getStudyPlans(req, res) {
    try {
      const userId = req.user.id;
      const studyPlans = await StudyPlan.findByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: {
          studyPlans: studyPlans.map(plan => ({
            id: plan.id,
            title: plan.title,
            description: plan.description,
            goals: plan.goals,
            startDate: plan.startDate,
            endDate: plan.endDate,
            schedule: plan.schedule,
            status: plan.status,
            createdAt: plan.createdAt
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getStudyPlan(req, res) {
    try {
      const { id } = req.params;
      const studyPlan = await StudyPlan.findById(id);

      if (!studyPlan) {
        return res.status(404).json({
          status: 'error',
          message: 'Study plan not found'
        });
      }

      // Check if user owns the study plan
      if (studyPlan.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this study plan'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          studyPlan: {
            id: studyPlan.id,
            title: studyPlan.title,
            description: studyPlan.description,
            goals: studyPlan.goals,
            startDate: studyPlan.startDate,
            endDate: studyPlan.endDate,
            schedule: studyPlan.schedule,
            status: studyPlan.status,
            createdAt: studyPlan.createdAt,
            updatedAt: studyPlan.updatedAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async updateStudyPlan(req, res) {
    try {
      const { id } = req.params;
      const { title, description, goals, startDate, endDate, schedule, status } = req.body;

      const studyPlan = await StudyPlan.findById(id);
      if (!studyPlan) {
        return res.status(404).json({
          status: 'error',
          message: 'Study plan not found'
        });
      }

      // Check if user owns the study plan
      if (studyPlan.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this study plan'
        });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (goals) updateData.goals = goals;
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      if (schedule) updateData.schedule = schedule;
      if (status) updateData.status = status;

      await StudyPlan.update(id, updateData);

      res.status(200).json({
        status: 'success',
        message: 'Study plan updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async deleteStudyPlan(req, res) {
    try {
      const { id } = req.params;

      const studyPlan = await StudyPlan.findById(id);
      if (!studyPlan) {
        return res.status(404).json({
          status: 'error',
          message: 'Study plan not found'
        });
      }

      // Check if user owns the study plan
      if (studyPlan.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete this study plan'
        });
      }

      await StudyPlan.delete(id);

      res.status(200).json({
        status: 'success',
        message: 'Study plan deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getActiveStudyPlans(req, res) {
    try {
      const userId = req.user.id;
      const studyPlans = await StudyPlan.getActivePlans(userId);

      res.status(200).json({
        status: 'success',
        data: {
          studyPlans: studyPlans.map(plan => ({
            id: plan.id,
            title: plan.title,
            description: plan.description,
            goals: plan.goals,
            startDate: plan.startDate,
            endDate: plan.endDate,
            schedule: plan.schedule,
            status: plan.status
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async addScheduleItem(req, res) {
    try {
      const { id } = req.params;
      const { scheduleItem } = req.body;

      const studyPlan = await StudyPlan.findById(id);
      if (!studyPlan) {
        return res.status(404).json({
          status: 'error',
          message: 'Study plan not found'
        });
      }

      // Check if user owns the study plan
      if (studyPlan.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this study plan'
        });
      }

      await StudyPlan.addScheduleItem(id, scheduleItem);

      res.status(200).json({
        status: 'success',
        message: 'Schedule item added successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async updateGoalProgress(req, res) {
    try {
      const { id } = req.params;
      const { goalId, progress } = req.body;

      const studyPlan = await StudyPlan.findById(id);
      if (!studyPlan) {
        return res.status(404).json({
          status: 'error',
          message: 'Study plan not found'
        });
      }

      // Check if user owns the study plan
      if (studyPlan.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this study plan'
        });
      }

      await StudyPlan.updateGoalProgress(id, goalId, progress);

      res.status(200).json({
        status: 'success',
        message: 'Goal progress updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = StudyPlanController; 