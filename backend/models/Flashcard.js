const { getFirestore } = require('firebase/firestore');

class Flashcard {
  constructor(flashcardData) {
    this.id = flashcardData.id;
    this.noteId = flashcardData.noteId;
    this.userId = flashcardData.userId;
    this.question = flashcardData.question;
    this.answer = flashcardData.answer;
    this.difficulty = flashcardData.difficulty || 'medium';
    this.lastReviewed = flashcardData.lastReviewed || null;
    this.nextReview = flashcardData.nextReview || null;
    this.createdAt = flashcardData.createdAt || new Date();
    this.updatedAt = flashcardData.updatedAt || new Date();
  }

  static async create(flashcardData) {
    try {
      const db = getFirestore();
      const flashcardRef = await db.collection('flashcards').add({
        noteId: flashcardData.noteId,
        userId: flashcardData.userId,
        question: flashcardData.question,
        answer: flashcardData.answer,
        difficulty: flashcardData.difficulty || 'medium',
        lastReviewed: null,
        nextReview: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return new Flashcard({
        id: flashcardRef.id,
        ...flashcardData
      });
    } catch (error) {
      throw new Error('Error creating flashcard: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      const db = getFirestore();
      const flashcardDoc = await db.collection('flashcards').doc(id).get();

      if (!flashcardDoc.exists) {
        return null;
      }

      return new Flashcard({
        id: flashcardDoc.id,
        ...flashcardDoc.data()
      });
    } catch (error) {
      throw new Error('Error finding flashcard: ' + error.message);
    }
  }

  static async findByUserId(userId) {
    try {
      const db = getFirestore();
      const flashcardsRef = db.collection('flashcards');
      const snapshot = await flashcardsRef.where('userId', '==', userId).get();

      return snapshot.docs.map(doc => new Flashcard({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error finding user flashcards: ' + error.message);
    }
  }

  static async findByNoteId(noteId) {
    try {
      const db = getFirestore();
      const flashcardsRef = db.collection('flashcards');
      const snapshot = await flashcardsRef.where('noteId', '==', noteId).get();

      return snapshot.docs.map(doc => new Flashcard({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error finding note flashcards: ' + error.message);
    }
  }

  static async update(id, updateData) {
    try {
      const db = getFirestore();
      const flashcardRef = db.collection('flashcards').doc(id);
      
      updateData.updatedAt = new Date();
      await flashcardRef.update(updateData);
      
      return true;
    } catch (error) {
      throw new Error('Error updating flashcard: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const db = getFirestore();
      await db.collection('flashcards').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting flashcard: ' + error.message);
    }
  }

  static async getDueCards(userId) {
    try {
      const db = getFirestore();
      const now = new Date();
      const flashcardsRef = db.collection('flashcards');
      const snapshot = await flashcardsRef
        .where('userId', '==', userId)
        .where('nextReview', '<=', now)
        .get();

      return snapshot.docs.map(doc => new Flashcard({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error getting due flashcards: ' + error.message);
    }
  }

  static async updateReviewStatus(id, difficulty) {
    try {
      const db = getFirestore();
      const flashcardRef = db.collection('flashcards').doc(id);
      const now = new Date();
      
      // Calculate next review date based on difficulty
      let nextReviewDays = 1;
      if (difficulty === 'easy') {
        nextReviewDays = 7;
      } else if (difficulty === 'medium') {
        nextReviewDays = 3;
      }

      const nextReview = new Date(now.getTime() + (nextReviewDays * 24 * 60 * 60 * 1000));
      
      await flashcardRef.update({
        lastReviewed: now,
        nextReview: nextReview,
        difficulty: difficulty,
        updatedAt: now
      });
      
      return true;
    } catch (error) {
      throw new Error('Error updating flashcard review status: ' + error.message);
    }
  }
}

module.exports = Flashcard; 