const { getFirestore } = require('firebase/firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || 'student';
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }

  static async create(userData) {
    try {
      const db = getFirestore();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const userRef = await db.collection('users').add({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return new User({
        id: userRef.id,
        ...userData,
        password: hashedPassword
      });
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const db = getFirestore();
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', email).get();

      if (snapshot.empty) {
        return null;
      }

      const userData = snapshot.docs[0].data();
      return new User({
        id: snapshot.docs[0].id,
        ...userData
      });
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  generateAuthToken() {
    return jwt.sign(
      { id: this.id, email: this.email, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  static async update(id, updateData) {
    try {
      const db = getFirestore();
      const userRef = db.collection('users').doc(id);
      
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      updateData.updatedAt = new Date();
      await userRef.update(updateData);
      
      return true;
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      const db = getFirestore();
      await db.collection('users').doc(id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
}

module.exports = User; 