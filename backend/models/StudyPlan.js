const { getFirestore } = require('firebase/firestore');

class StudyPlan {
  constructor(planData) {
    this.id = planData.id;
    this.userId = planData.userId;
    this.title = planData.title;
    this.description = planData.description;
    this.goals = planData.goals || [];
    this.startDate = planData.startDate;
    this.endDate = planData.endDate;
    this.schedule = planData.schedule || [];
    this.status = planData.status || 'active';
    this.createdAt = planData.createdAt || new Date();
    this.updatedAt = planData.updatedAt || new Date();
  }

  static async create(planData) {
    try {
      const db = getFirestore();
      const planRef = await db.collection('studyPlans').add({
        userId: planData.userId,
        title: planData.title,
        description: planData.description,
        goals: planData.goals || [],
        startDate: planData.startDate,
        endDate: planData.endDate,
        schedule: planData.schedule || [],
        status: planData.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return new StudyPlan({
        id: planRef.id,
        ...planData
      });
    } catch (error) {
      throw new Error('Error creating study plan: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      const db = getFirestore();
      const planDoc = await db.collection('studyPlans').doc(id).get();

      if (!planDoc.exists) {
        return null;
      }

      return new StudyPlan({
        id: planDoc.id,
        ...planDoc.data()
      });
    } catch (error) {
      throw new Error('Error finding study plan: ' + error.message);
    }
  }

  static async findByUserId(userId) {
    try {
      const db = getFirestore();
      const plansRef = db.collection('studyPlans');
      const snapshot = await plansRef.where('userId', '==', userId).get();

      return snapshot.docs.map(doc => new StudyPlan({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error finding user study plans: ' + error.message);
    }
  }

  static async update(id, updateData) {
    try {
      const db = getFirestore();
      const planRef = db.collection('studyPlans').doc(id);
      
      updateData.updatedAt = new Date();
      await planRef.update(updateData);
      
      return true;
    } catch (error) {
      throw new Error('Error updating study plan: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const db = getFirestore();
      await db.collection('studyPlans').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting study plan: ' + error.message);
    }
  }

  static async getActivePlans(userId) {
    try {
      const db = getFirestore();
      const now = new Date();
      const plansRef = db.collection('studyPlans');
      const snapshot = await plansRef
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .where('endDate', '>=', now)
        .get();

      return snapshot.docs.map(doc => new StudyPlan({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error getting active study plans: ' + error.message);
    }
  }

  static async addScheduleItem(id, scheduleItem) {
    try {
      const db = getFirestore();
      const planRef = db.collection('studyPlans').doc(id);
      
      await planRef.update({
        schedule: firebase.firestore.FieldValue.arrayUnion(scheduleItem),
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      throw new Error('Error adding schedule item: ' + error.message);
    }
  }

  static async updateGoalProgress(id, goalId, progress) {
    try {
      const db = getFirestore();
      const planRef = db.collection('studyPlans').doc(id);
      const plan = await planRef.get();
      
      if (!plan.exists) {
        throw new Error('Study plan not found');
      }

      const goals = plan.data().goals;
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, progress };
        }
        return goal;
      });

      await planRef.update({
        goals: updatedGoals,
        updatedAt: new Date()
      });
      
      return true;
    } catch (error) {
      throw new Error('Error updating goal progress: ' + error.message);
    }
  }
}

module.exports = StudyPlan; 