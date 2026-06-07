import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithGithub,
  emailSignIn,
  emailSignUp,
  firebaseSignOut,
  type User,
} from '../lib/firebase'

/* ── User Role ────────────────────────────────────────── */
export type UserRole = 'student' | 'customer'

/* ── User Profile Shape ───────────────────────────────── */
export interface UserProfile {
  fullName: string
  email: string
  college: string
  role: UserRole
  bio: string
  phone: string
  upiId: string
  bankAccount: string
  notifyOrders: boolean
  notifyMessages: boolean
  notifyPromotions: boolean
  notifyWeeklyDigest: boolean
  photoURL: string
  provider: 'email' | 'google' | 'github' | 'local'
}

interface UserContextValue {
  user: UserProfile | null
  isLoggedIn: boolean
  isStudent: boolean
  isCustomer: boolean
  loading: boolean
  login: (profile: Partial<UserProfile>) => void
  signup: (profile: Partial<UserProfile>) => void
  loginWithEmail: (email: string, password: string) => Promise<void>
  signupWithEmail: (email: string, password: string, extra: Partial<UserProfile>) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => void
  logout: () => Promise<void>
  getInitials: () => string
}

const STORAGE_KEY = 'campus_hustlers_user'

const defaultProfile: UserProfile = {
  fullName: '',
  email: '',
  college: '',
  role: 'customer',
  bio: '',
  phone: '',
  upiId: '',
  bankAccount: '',
  notifyOrders: true,
  notifyMessages: true,
  notifyPromotions: false,
  notifyWeeklyDigest: true,
  photoURL: '',
  provider: 'local',
}

/* ── Helpers ─────────────────────────────────────────── */
function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

function saveUser(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
}

function firebaseUserToProfile(firebaseUser: User, provider: 'google' | 'github' | 'email'): Partial<UserProfile> {
  return {
    fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    provider,
  }
}

/* ── Context ─────────────────────────────────────────── */
const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => loadUser())
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If we already have a stored profile for this email, merge
        const existing = loadUser()
        if (existing && existing.email === firebaseUser.email) {
          // Already in sync
          setUser(existing)
        }
        // Otherwise the login/signup methods handle setting the user
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      saveUser(user)
    }
  }, [user])

  /* ── Legacy local auth (kept for backward compat) ─── */
  const signup = (profile: Partial<UserProfile>) => {
    const newUser: UserProfile = { ...defaultProfile, ...profile }
    setUser(newUser)
    saveUser(newUser)
  }

  const login = (profile: Partial<UserProfile>) => {
    const existing = loadUser()
    const merged: UserProfile = { ...defaultProfile, ...existing, ...profile }
    setUser(merged)
    saveUser(merged)
  }

  /* ── Firebase email/password auth ─────────────────── */
  const loginWithEmail = async (email: string, password: string) => {
    const cred = await emailSignIn(email, password)
    const profile = firebaseUserToProfile(cred.user, 'email')
    const existing = loadUser()
    const merged: UserProfile = { ...defaultProfile, ...existing, ...profile }
    setUser(merged)
    saveUser(merged)
  }

  const signupWithEmail = async (email: string, password: string, extra: Partial<UserProfile>) => {
    const cred = await emailSignUp(email, password)
    const profile = firebaseUserToProfile(cred.user, 'email')
    const newUser: UserProfile = { ...defaultProfile, ...profile, ...extra, provider: 'email' }
    setUser(newUser)
    saveUser(newUser)
  }

  /* ── Social auth ──────────────────────────────────── */
  const loginWithGoogle = async () => {
    const result = await signInWithGoogle()
    const profile = firebaseUserToProfile(result.user, 'google')
    const existing = loadUser()
    const merged: UserProfile = { ...defaultProfile, ...existing, ...profile, provider: 'google' }
    setUser(merged)
    saveUser(merged)
  }

  const loginWithGithub = async () => {
    const result = await signInWithGithub()
    const profile = firebaseUserToProfile(result.user, 'github')
    const existing = loadUser()
    const merged: UserProfile = { ...defaultProfile, ...existing, ...profile, provider: 'github' }
    setUser(merged)
    saveUser(merged)
  }

  /* ── Profile management ───────────────────────────── */
  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      saveUser(updated)
      return updated
    })
  }

  const logout = async () => {
    try {
      await firebaseSignOut()
    } catch {
      // Firebase might not have an active session (local-only user)
    }
    setUser(null)
    clearUser()
  }

  const getInitials = (): string => {
    if (!user || !user.fullName) return '?'
    const parts = user.fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const isStudent = !!user && user.role === 'student'
  const isCustomer = !!user && user.role === 'customer'

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isStudent,
        isCustomer,
        loading,
        login,
        signup,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginWithGithub,
        updateProfile,
        logout,
        getInitials,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return ctx
}
