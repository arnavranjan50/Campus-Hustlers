import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

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
}

interface UserContextValue {
  user: UserProfile | null
  isLoggedIn: boolean
  isStudent: boolean
  isCustomer: boolean
  login: (profile: Partial<UserProfile>) => void
  signup: (profile: Partial<UserProfile>) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  logout: () => void
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

/* ── Context ─────────────────────────────────────────── */
const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => loadUser())

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      saveUser(user)
    }
  }, [user])

  const signup = (profile: Partial<UserProfile>) => {
    const newUser: UserProfile = { ...defaultProfile, ...profile }
    setUser(newUser)
    saveUser(newUser)
  }

  const login = (profile: Partial<UserProfile>) => {
    // On login, merge with any existing stored data
    const existing = loadUser()
    const merged: UserProfile = { ...defaultProfile, ...existing, ...profile }
    setUser(merged)
    saveUser(merged)
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      saveUser(updated)
      return updated
    })
  }

  const logout = () => {
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
        login,
        signup,
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
