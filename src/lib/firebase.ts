import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCmtbtoksT8JjixkJVXUNyTymN03-UwSGc',
  authDomain: 'campus-hustlers.firebaseapp.com',
  projectId: 'campus-hustlers',
  storageBucket: 'campus-hustlers.firebasestorage.app',
  messagingSenderId: '798085745231',
  appId: '1:798085745231:web:3db69df015c256c3ebf83a',
  measurementId: 'G-CP1H0L8DXZ',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

/* ── Providers ────────────────────────────────────────── */
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export const githubProvider = new GithubAuthProvider()

/* ── Auth helpers ─────────────────────────────────────── */
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signInWithGithub = () => signInWithPopup(auth, githubProvider)

export const emailSignIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const emailSignUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const firebaseSignOut = () => signOut(auth)

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email)

export { onAuthStateChanged, type User }
