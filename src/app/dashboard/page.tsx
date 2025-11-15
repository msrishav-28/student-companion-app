'use client'

import { useQuery } from '@tanstack/react-query'
import { firebaseClient, where } from '@/lib/firebase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import Card from '@/components/ui/card'
import { TrendingUp, Calendar, Award, Zap, Target, Flame, BookOpen, Clock } from 'lucide-react'
import { calculateAttendancePercentage } from '@/lib/utils/calculations'
import { gamificationService } from '@/lib/services/gamification'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null
      return await firebaseClient.getDocument('students', user.uid)
    },
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null
      
      const attendance = await firebaseClient.queryDocuments<any>(
        'attendance',
        [where('student_id', '==', user.uid)]
      )
      
      const present = attendance?.filter((r: any) => r.status === 'present').length || 0
      const total = attendance?.filter((r: any) => r.status === 'present' || r.status === 'absent').length || 0
      const attendancePercentage = calculateAttendancePercentage(present, total)
      
      const streaks = await firebaseClient.queryDocuments<any>(
        'streaks',
        [
          where('student_id', '==', user.uid),
          where('streak_type', '==', 'attendance')
        ]
      )
      
      const totalXP = await gamificationService.getTotalXP(user.uid)
      const level = gamificationService.calculateLevel(totalXP)
      
      return {
        attendance: attendancePercentage,
        streak: streaks[0]?.current_streak || 0,
        xp: totalXP,
        level,
      }
    },
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass-card p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{profile?.name || 'Student'}</span>! 👋
          </h1>
          <p className="text-text-secondary text-lg">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard/attendance">
          <Card variant="glass" className="hover:scale-105 transition-transform cursor-pointer">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              (stats?.attendance || 0) >= 85 ? 'bg-status-success/20' :
              (stats?.attendance || 0) >= 75 ? 'bg-status-warning/20' : 'bg-status-danger/20'
            }`}>
              <Calendar className={`w-6 h-6 ${
                (stats?.attendance || 0) >= 85 ? 'text-status-success' :
                (stats?.attendance || 0) >= 75 ? 'text-status-warning' : 'text-status-danger'
              }`} />
            </div>
            <p className="text-text-secondary text-sm mb-1">Attendance</p>
            <p className="text-3xl font-bold">{stats?.attendance.toFixed(1)}%</p>
          </Card>
        </Link>

        <Link href="/dashboard/achievements">
          <Card variant="glass" className="hover:scale-105 transition-transform cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-neon-purple" />
            </div>
            <p className="text-text-secondary text-sm mb-1">Level</p>
            <p className="text-3xl font-bold text-neon-purple">{stats?.level || 1}</p>
          </Card>
        </Link>

        <Card variant="glass">
          <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-neon-blue" />
          </div>
          <p className="text-text-secondary text-sm mb-1">Total XP</p>
          <p className="text-3xl font-bold text-neon-blue">{stats?.xp || 0}</p>
        </Card>

        <Card variant="glass">
          <div className="w-12 h-12 rounded-full bg-neon-pink/20 flex items-center justify-center mb-4">
            <Flame className="w-6 h-6 text-neon-pink" />
          </div>
          <p className="text-text-secondary text-sm mb-1">Streak</p>
          <p className="text-3xl font-bold text-neon-pink">{stats?.streak || 0} days</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="glass">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-neon-purple" />
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/attendance/mark">
            <button className="w-full btn-primary text-center py-4 text-lg">
              📅 Mark Attendance
            </button>
          </Link>
          <Link href="/dashboard/grades/entry">
            <button className="w-full btn-neon text-center py-4 text-lg">
              📊 Enter Grades
            </button>
          </Link>
          <Link href="/dashboard/ai-buddy">
            <button className="w-full btn-secondary text-center py-4 text-lg">
              🤖 Ask AI Buddy
            </button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
