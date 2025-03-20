import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

interface UserData {
  username: string;
  name: string;
  idNumber: string;
  email: string;
  phone: string;
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<UserData>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.usersCollection = this.firestore.collection<UserData>('users');
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      if (userCredential.user) {
        localStorage.setItem('userEmail', userCredential.user.email || '');
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'No user found with the provided credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  async register(userData: UserData & { password: string; confirmPassword: string }) {
    console.log('Registering user with email:', userData.email);
    
    // First validate the ID number
    if (!this.validateIDNumber(userData.idNumber)) {
      return { success: false, message: 'Invalid ID number format' };
    }

    try {
      // Check if email already exists in users collection
      const emailQuery = await this.usersCollection.ref
        .where('email', '==', userData.email)
        .get();

      if (!emailQuery.empty) {
        return { success: false, message: 'This email is already registered' };
      }

      // Create authentication user
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );

      if (userCredential.user) {
        // Store user data using email as document ID
        const userDataToStore: UserData = {
          username: userData.username,
          name: userData.name,
          idNumber: userData.idNumber,
          email: userData.email,
          phone: userData.phone,
          address: userData.address
        };

        await this.usersCollection.doc(userData.email).set(userDataToStore);

        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: 'Failed to create user' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  private validateIDNumber(idNumber: string): boolean {
    if (!idNumber) return false;
    
    // Check if ID Number is exactly 13 digits and contains only numbers
    const idRegex = /^\d{13}$/;
    return idRegex.test(idNumber.toString());
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

  async getUserData(email: string): Promise<{ success: boolean; data?: UserData; message?: string }> {
    try {
      const doc = await this.usersCollection.doc(email).get().toPromise();
      if (doc && doc.exists) {
        return { success: true, data: doc.data() as UserData };
      } else {
        return { success: false, message: 'User data not found' };
      }
    } catch (error) {
      console.error('Get user data error:', error);
      return { success: false, message: 'Failed to fetch user data' };
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