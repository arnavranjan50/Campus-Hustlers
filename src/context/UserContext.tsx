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
import { saveUserProfile, getUserProfile } from '../lib/firestore'

/* ── User Role ────────────────────────────────────────── */
export type UserRole = 'student' | 'customer'

/* ── User Profile Shape ───────────────────────────────── */
export interface UserProfile {
  uid: string
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
  loginWithEmail: (email: string, password: string, role?: UserRole) => Promise<void>
  signupWithEmail: (email: string, password: string, extra: Partial<UserProfile>) => Promise<void>
  loginWithGoogle: (role?: UserRole) => Promise<void>
  loginWithGithub: (role?: UserRole) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => void
  logout: () => Promise<void>
  getInitials: () => string
}

const STORAGE_KEY = 'campus_hustlers_user'

const defaultProfile: UserProfile = {
  uid: '',
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

function firebaseUserToProfile(
  firebaseUser: User,
  provider: 'google' | 'github' | 'email',
  role: UserRole = 'customer'
): Partial<UserProfile> {
  return {
    uid: firebaseUser.uid,
    fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    provider,
    role,
  }
}

/* ── Context ─────────────────────────────────────────── */
const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => loadUser())
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try loading from Firestore first
        try {
          const firestoreProfile = await getUserProfile(firebaseUser.uid)
          if (firestoreProfile) {
            const profile: UserProfile = {
              ...defaultProfile,
              ...firestoreProfile,
              uid: firebaseUser.uid,
            }
            setUser(profile)
            saveUser(profile)
          } else {
            // Firestore doesn't have this user yet — use local
            const local = loadUser()
            if (local) setUser(local)
          }
        } catch {
          // Firestore unavailable — use local
          const local = loadUser()
          if (local) setUser(local)
        }
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
  const loginWithEmail = async (email: string, password: string, role?: UserRole) => {
    const cred = await emailSignIn(email, password)
    const profile = firebaseUserToProfile(cred.user, 'email', role)

    // Try to get existing Firestore profile
    let firestoreData = await getUserProfile(cred.user.uid)
    let merged: UserProfile

    if (firestoreData) {
      // Existing user — merge, but use Firestore role
      merged = { ...defaultProfile, ...firestoreData, ...profile, role: firestoreData.role }
    } else {
      // New login — save to Firestore
      merged = { ...defaultProfile, ...profile }
      await saveUserProfile(cred.user.uid, merged)
    }

    setUser(merged)
    saveUser(merged)
  }

  const signupWithEmail = async (email: string, password: string, extra: Partial<UserProfile>) => {
    const cred = await emailSignUp(email, password)
    const profile = firebaseUserToProfile(cred.user, 'email', extra.role || 'customer')
    const newUser: UserProfile = { ...defaultProfile, ...profile, ...extra, provider: 'email', uid: cred.user.uid }

    // Save to Firestore
    await saveUserProfile(cred.user.uid, newUser)

    setUser(newUser)
    saveUser(newUser)
  }

  /* ── Social auth ──────────────────────────────────── */
  const loginWithGoogle = async (role?: UserRole) => {
    const result = await signInWithGoogle()
    const profile = firebaseUserToProfile(result.user, 'google', role)

    // Check if user exists in Firestore
    let firestoreData = await getUserProfile(result.user.uid)
    let merged: UserProfile

    if (firestoreData) {
      merged = { ...defaultProfile, ...firestoreData, ...profile, role: firestoreData.role, provider: 'google' }
    } else {
      merged = { ...defaultProfile, ...profile }
      await saveUserProfile(result.user.uid, merged)
    }

    setUser(merged)
    saveUser(merged)
  }

  const loginWithGithub = async (role?: UserRole) => {
    const result = await signInWithGithub()
    const profile = firebaseUserToProfile(result.user, 'github', role)

    let firestoreData = await getUserProfile(result.user.uid)
    let merged: UserProfile

    if (firestoreData) {
      merged = { ...defaultProfile, ...firestoreData, ...profile, role: firestoreData.role, provider: 'github' }
    } else {
      merged = { ...defaultProfile, ...profile }
      await saveUserProfile(result.user.uid, merged)
    }

    setUser(merged)
    saveUser(merged)
  }

  /* ── Profile management ───────────────────────────── */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      saveUser(updated)

      // Also sync to Firestore if we have a uid
      if (updated.uid) {
        saveUserProfile(updated.uid, updates).catch(() => {})
      }

      return updated
    })
  }

  const logout = async () => {
    try {
      await firebaseSignOut()
    } catch {
      // Firebase might not have an active session
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
