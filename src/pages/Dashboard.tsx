import { useUser } from '../context/UserContext'
import StudentDashboard from './StudentDashboard'
import CustomerDashboard from './CustomerDashboard'

export default function Dashboard() {
  const { user, isStudent } = useUser()

  if (!user) return null

  return isStudent ? <StudentDashboard /> : <CustomerDashboard />
}
