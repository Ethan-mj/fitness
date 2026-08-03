export type MemberOption = { id: number; nickname: string; avatarUrl?: string; remainingLessons: number }
export type Coach = { id: number; name: string; specialty: string; introduction: string; avatarUrl?: string; active: boolean }
export type Slot = { id: number; coachId: number; coachName: string; startTime: string; endTime: string }
export type Booking = {
  id: number; coachName: string; specialty: string; startTime: string; endTime: string
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED'; userName?: string; userId?: number
}
export type Member = { id: number; nickname: string; phone?: string; avatarUrl?: string; remainingLessons: number; createdAt: string }
export type Dashboard = { users: number; coaches: number; activeBookings: number; lessonsRemaining: number }
export type AuthResponse = { token: string; role: 'USER' | 'ADMIN'; userId: number; nickname: string }
