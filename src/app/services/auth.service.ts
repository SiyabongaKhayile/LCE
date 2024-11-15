import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  async login(email: string, password: string) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        localStorage.setItem('userID', userCredential.user.uid);
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'No user found with the provided credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  async register(userData: any) {
    console.log('Registering user with email:', userData.email);
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );
      if (userCredential.user) {
        await this.firestore
          .collection('users')
          .doc(userCredential.user.uid)
          .set({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            userID: userCredential.user.uid,
          });
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: 'Failed to create user' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  async resetPassword(email: string) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  async getUserData(userID: string) {
    try {
      const doc = await this.firestore.collection('users').doc(userID).get().toPromise();
      if (doc && doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, message: 'User data not found' };
      }
    } catch (error) {
      console.error('Get user data error:', error);
      return { success: false, message: 'Failed to fetch user data' };
    }
  }

  async updateUserDetails(userID: string, updatedData: any) {
    try {
      await this.firestore.collection('users').doc(userID).update(updatedData);
      return { success: true, message: 'User details updated' };
    } catch (error) {
      console.error('Update user details error:', error);
      return { success: false, message: 'Update failed' };
    }
  }

  async getPostByID(postID: string) {
    try {
      const doc = await this.firestore.collection('news').doc(postID).get().toPromise();
      if (doc && doc.exists) {
        return doc.data();
      } else {
        return { error: 'Post not found' };
      }
    } catch (error) {
      console.error('Get post error:', error);
      return { error: 'Database error' };
    }
  }

  async addPost(postData: any) {
    try {
      const postRef = this.firestore.collection('news').doc();
      await postRef.set(postData);
      return { success: true, message: 'Post added successfully' };
    } catch (error) {
      console.error('Add post error:', error);
      return { success: false, message: 'Failed to add post' };
    }
  }

  private getErrorMessage(error: any): string {
    console.log('Error code:', error.code);
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      default:
        return `An unexpected error occurred: ${error.message}`;
    }
  }
}