import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'

/* ══════════════════════════════════════════════════════
   Firestore Collections & CRUD Helpers
   ══════════════════════════════════════════════════════ */

/* ── Types ───────────────────────────────────────────── */

export interface FirestoreUser {
  uid: string
  fullName: string
  email: string
  college: string
  role: 'student' | 'customer'
  bio: string
  phone: string
  upiId: string
  bankAccount: string
  photoURL: string
  provider: 'email' | 'google' | 'github' | 'local'
  notifyOrders: boolean
  notifyMessages: boolean
  notifyPromotions: boolean
  notifyWeeklyDigest: boolean
  createdAt: Timestamp
}

export interface FirestoreService {
  id?: string
  title: string
  category: string
  price: number
  description: string
  studentId: string
  studentName: string
  studentCollege: string
  active: boolean
  rating: number
  reviews: number
  deliveryDays: number
  createdAt: Timestamp
}

export interface FirestoreBooking {
  id?: string
  serviceId: string
  serviceTitle: string
  serviceCategory: string
  studentId: string
  studentName: string
  customerId: string
  customerName: string
  customerEmail: string
  amount: number
  platformFee: number
  total: number
  status: 'completed' | 'progress' | 'new' | 'pending' | 'cancelled'
  paymentId: string
  orderId: string
  receiptNumber: string
  message: string
  createdAt: Timestamp
}

/* ── Users ───────────────────────────────────────────── */

export async function saveUserProfile(uid: string, data: Partial<FirestoreUser>) {
  const ref = doc(db, 'users', uid)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, data)
  } else {
    await setDoc(ref, { ...data, createdAt: Timestamp.now() })
  }
}

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { uid, ...snap.data() } as FirestoreUser
}

/* ── Services ────────────────────────────────────────── */

export async function addService(service: Omit<FirestoreService, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'services'), {
    ...service,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export async function updateService(id: string, data: Partial<FirestoreService>) {
  await updateDoc(doc(db, 'services', id), data)
}

export async function deleteService(id: string) {
  await deleteDoc(doc(db, 'services', id))
}

export async function getStudentServices(studentId: string): Promise<FirestoreService[]> {
  const q = query(
    collection(db, 'services'),
    where('studentId', '==', studentId)
  )
  const snap = await getDocs(q)
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService))
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export async function getAllActiveServices(): Promise<FirestoreService[]> {
  const q = query(
    collection(db, 'services'),
    where('active', '==', true)
  )
  const snap = await getDocs(q)
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreService))
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

/* ── Bookings ────────────────────────────────────────── */

export async function createBooking(booking: Omit<FirestoreBooking, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'bookings'), {
    ...booking,
    createdAt: Timestamp.now(),
  })
  return ref.id
}

export async function getCustomerBookings(customerId: string): Promise<FirestoreBooking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('customerId', '==', customerId)
  )
  const snap = await getDocs(q)
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking))
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export async function getStudentOrders(studentId: string): Promise<FirestoreBooking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('studentId', '==', studentId)
  )
  const snap = await getDocs(q)
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreBooking))
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

/* ── Aggregation Helpers ─────────────────────────────── */

export function calculateEarnings(bookings: FirestoreBooking[]) {
  const completed = bookings.filter((b) => b.status === 'completed')
  const totalEarnings = completed.reduce((sum, b) => sum + b.amount, 0)

  // Monthly breakdown
  const monthlyMap: Record<string, number> = {}
  completed.forEach((b) => {
    const date = b.createdAt?.toDate?.() || new Date()
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] || 0) + b.amount
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  const monthlyEarnings = months.map((month, i) => ({
    month,
    amount: monthlyMap[`${currentYear}-${String(i + 1).padStart(2, '0')}`] || 0,
  }))

  // This month
  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonth = monthlyMap[thisMonthKey] || 0

  return { totalEarnings, thisMonth, monthlyEarnings }
}

/* ── Hackathons (Live Data) ──────────────────────────── */

export interface FirestoreHackathon {
  id?: string
  title: string
  organizer: string
  description: string
  startDate: string
  endDate: string
  registrationDeadline: string
  mode: 'Online' | 'Offline' | 'Hybrid'
  category: string
  prize: string
  teamSize: string
  location: string
  website: string
  tags: string[]
  featured: boolean
  source: string
  image: string
  fetchedAt?: Timestamp
}

export async function getLiveHackathons(): Promise<FirestoreHackathon[]> {
  try {
    const snap = await getDocs(collection(db, 'hackathons'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreHackathon))
  } catch (err) {
    console.warn('getLiveHackathons failed:', err)
    return []
  }
}

export async function getHackathonsMeta(): Promise<{ lastFetchedAt: Date | null; totalCount: number } | null> {
  try {
    const ref = doc(db, 'metadata', 'hackathons')
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const data = snap.data()
    return {
      lastFetchedAt: data.lastFetchedAt?.toDate?.() || null,
      totalCount: data.totalCount || 0,
    }
  } catch (err) {
    console.warn('getHackathonsMeta failed:', err)
    return null
  }
}
