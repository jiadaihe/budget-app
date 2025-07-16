import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";

// Sign up with email and password
export async function signup(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Signup successful:", userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error("Signup error:", error);
    throw new Error(getErrorMessage(error.code));
  }
}

// Sign in with email and password
export async function login(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(getErrorMessage(error.code));
  }
}

// Sign out
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
    console.log("Logout successful");
  } catch (error: any) {
    console.error("Logout error:", error);
    throw error;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Listen to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Get ID token for backend communication
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently signed in");
  }
  return await user.getIdToken();
}

// Helper function to convert Firebase error codes to user-friendly messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
} 