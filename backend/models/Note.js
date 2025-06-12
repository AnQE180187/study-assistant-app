const { getFirestore } = require('firebase/firestore');

class Note {
  constructor(noteData) {
    this.id = noteData.id;
    this.userId = noteData.userId;
    this.title = noteData.title;
    this.content = noteData.content;
    this.category = noteData.category;
    this.tags = noteData.tags || [];
    this.createdAt = noteData.createdAt || new Date();
    this.updatedAt = noteData.updatedAt || new Date();
  }

  static async create(noteData) {
    try {
      const db = getFirestore();
      const noteRef = await db.collection('notes').add({
        userId: noteData.userId,
        title: noteData.title,
        content: noteData.content,
        category: noteData.category,
        tags: noteData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return new Note({
        id: noteRef.id,
        ...noteData
      });
    } catch (error) {
      throw new Error('Error creating note: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      const db = getFirestore();
      const noteDoc = await db.collection('notes').doc(id).get();

      if (!noteDoc.exists) {
        return null;
      }

      return new Note({
        id: noteDoc.id,
        ...noteDoc.data()
      });
    } catch (error) {
      throw new Error('Error finding note: ' + error.message);
    }
  }

  static async findByUserId(userId) {
    try {
      const db = getFirestore();
      const notesRef = db.collection('notes');
      const snapshot = await notesRef.where('userId', '==', userId).get();

      return snapshot.docs.map(doc => new Note({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error finding user notes: ' + error.message);
    }
  }

  static async update(id, updateData) {
    try {
      const db = getFirestore();
      const noteRef = db.collection('notes').doc(id);
      
      updateData.updatedAt = new Date();
      await noteRef.update(updateData);
      
      return true;
    } catch (error) {
      throw new Error('Error updating note: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const db = getFirestore();
      await db.collection('notes').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting note: ' + error.message);
    }
  }

  static async searchByTags(userId, tags) {
    try {
      const db = getFirestore();
      const notesRef = db.collection('notes');
      const snapshot = await notesRef
        .where('userId', '==', userId)
        .where('tags', 'array-contains-any', tags)
        .get();

      return snapshot.docs.map(doc => new Note({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error searching notes by tags: ' + error.message);
    }
  }

  static async searchByCategory(userId, category) {
    try {
      const db = getFirestore();
      const notesRef = db.collection('notes');
      const snapshot = await notesRef
        .where('userId', '==', userId)
        .where('category', '==', category)
        .get();

      return snapshot.docs.map(doc => new Note({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error searching notes by category: ' + error.message);
    }
  }
}

module.exports = Note; 