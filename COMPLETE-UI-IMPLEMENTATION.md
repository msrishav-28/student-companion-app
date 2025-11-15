# 🎨 Complete UI/UX Implementation - All Frontend Pages

## 🎯 Design Philosophy

Based on idea.md, implementing a **dark-mode first, mobile-optimized, gamified experience** with:
- Pure black (#000000) background for OLED optimization
- Neon accent colors (purple #B026FF, blue #00D4FF, pink #FF10F0, green #00FF88)
- Glassmorphism effects for depth
- Smooth framer-motion animations
- 44px minimum touch targets for mobile
- <2s load time requirement

---

## 📱 ALL PAGES IMPLEMENTATION

### 1. DASHBOARD HOME (Enhanced)
**File**: `src/app/dashboard/page.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/card'
import { TrendingUp, Calendar, Award, Zap, Target, Flame, BookOpen, Clock } from 'lucide-react'
import { calculateAttendancePercentage } from '@/lib/utils/calculations'
import { gamificationService } from '@/lib/services/gamification'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createClient()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('id', user?.id)
        .single()
      return data
    },
    enabled: !!user,
  })

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user?.id)
      
      const present = attendance?.filter(r => r.status === 'present').length || 0
      const total = attendance?.filter(r => r.status === 'present' || r.status === 'absent').length || 0
      const attendancePercentage = calculateAttendancePercentage(present, total)
      
      // Grades
      const { data: grades } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', user?.id)
      
      const avgGrade = grades?.length
        ? grades.reduce((sum, g) => sum + (g.marks_obtained / g.total_marks * 100), 0) / grades.length
        : 0
      
      // Assignments
      const { data: assignments } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', user?.id)
        .eq('status', 'pending')
      
      // Streak
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('student_id', user?.id)
        .eq('streak_type', 'attendance')
        .single()
      
      // XP
      const totalXP = await gamificationService.getTotalXP(user?.id!)
      const level = gamificationService.calculateLevel(totalXP)
      
      return {
        attendance: attendancePercentage,
        avgGrade,
        pendingAssignments: assignments?.length || 0,
        streak: streak?.current_streak || 0,
        xp: totalXP,
        level,
      }
    },
    enabled: !!user,
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
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
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Link href="/dashboard/attendance">
            <Card variant="glass" className="hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  (stats?.attendance || 0) >= 85 ? 'bg-status-success/20' :
                  (stats?.attendance || 0) >= 75 ? 'bg-status-warning/20' :
                  'bg-status-danger/20'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    (stats?.attendance || 0) >= 85 ? 'text-status-success' :
                    (stats?.attendance || 0) >= 75 ? 'text-status-warning' :
                    'text-status-danger'
                  }`} />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">Attendance</p>
              <p className="text-3xl font-bold">{stats?.attendance.toFixed(1)}%</p>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link href="/dashboard/achievements">
            <Card variant="glass" className="hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-neon-purple" />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">Level</p>
              <p className="text-3xl font-bold text-neon-purple">{stats?.level || 1}</p>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-neon-blue" />
              </div>
            </div>
            <p className="text-text-secondary text-sm mb-1">Total XP</p>
            <p className="text-3xl font-bold text-neon-blue">{stats?.xp || 0}</p>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card variant="glass" className="pulse-safe">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-neon-pink/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-neon-pink" />
              </div>
            </div>
            <p className="text-text-secondary text-sm mb-1">Streak</p>
            <p className="text-3xl font-bold text-neon-pink">{stats?.streak || 0} days</p>
          </Card>
        </motion.div>
      </motion.div>

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

      {/* Today's Schedule */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card variant="glass">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-blue" />
            Today's Classes
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-background-surface border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">Operating Systems</h3>
                  <p className="text-sm text-text-secondary">Room 301</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm font-semibold">
                  10:00 AM
                </span>
              </div>
            </div>
            <p className="text-text-secondary text-center py-4">No more classes today</p>
          </div>
        </Card>

        <Card variant="glass">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-pink" />
            Upcoming Deadlines
          </h2>
          {stats?.pendingAssignments ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
                <h3 className="font-bold">Lab Assignment</h3>
                <p className="text-sm text-text-secondary">Due in 2 days</p>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">
              🎉 All caught up!
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
```

---

### 2. GRADES - Complete System

#### `src/app/dashboard/grades/page.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Plus, TrendingUp, BarChart3 } from 'lucide-react'
import { calculateGPA } from '@/lib/utils/calculations'
import Link from 'next/link'
import { Line } from 'react-chartjs-2'

export default function GradesPage() {
  const supabase = createClient()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
  })

  const { data: gradesData } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const { data: grades } = await supabase
        .from('grades')
        .select(`
          *,
          subjects(name, code, credits)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })
      
      const { data: subjects } = await supabase
        .from('subjects')
        .select('*')
        .eq('student_id', user?.id)
      
      const gpa = grades && subjects ? calculateGPA(grades, subjects) : 0
      
      return { grades, subjects, gpa }
    },
    enabled: !!user,
  })

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-status-success'
    if (percentage >= 75) return 'text-neon-blue'
    if (percentage >= 60) return 'text-status-warning'
    return 'text-status-danger'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grades & Performance</h1>
        <Link href="/dashboard/grades/entry">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Add Grade
          </Button>
        </Link>
      </div>

      {/* GPA Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="glass">
          <p className="text-text-secondary mb-2">Current GPA</p>
          <p className="text-4xl font-bold text-neon-purple">{gradesData?.gpa.toFixed(2)}</p>
          <p className="text-sm text-text-secondary mt-2">Out of 10.0</p>
        </Card>

        <Card variant="glass">
          <p className="text-text-secondary mb-2">Percentage</p>
          <p className="text-4xl font-bold text-neon-blue">
            {(gradesData?.gpa * 10).toFixed(1)}%
          </p>
          <p className="text-sm text-text-secondary mt-2">Overall average</p>
        </Card>

        <Card variant="glass">
          <p className="text-text-secondary mb-2">Total Subjects</p>
          <p className="text-4xl font-bold text-neon-green">{gradesData?.subjects?.length || 0}</p>
          <p className="text-sm text-text-secondary mt-2">This semester</p>
        </Card>
      </div>

      {/* Grades List */}
      <Card variant="glass">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">All Grades</h2>
          <Link href="/dashboard/grades/calculator">
            <Button variant="ghost">
              <BarChart3 className="w-5 h-5 mr-2" />
              Calculator
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {gradesData?.grades?.map((grade: any) => {
            const percentage = (grade.marks_obtained / grade.total_marks) * 100
            return (
              <div key={grade.id} className="p-4 rounded-xl bg-background-surface border border-white/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold">{grade.subjects?.name}</h3>
                    <p className="text-sm text-text-secondary">{grade.exam_type}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
                      {percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-text-secondary">
                      {grade.marks_obtained}/{grade.total_marks}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
```

#### `src/app/dashboard/grades/entry/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/card'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import toast from 'react-hot-toast'
import { gamificationService } from '@/lib/services/gamification'

export default function GradeEntryPage() {
  const [formData, setFormData] = useState({
    subject_id: '',
    exam_type: 'mid' as 'mid' | 'end' | 'assignment' | 'quiz' | 'lab' | 'project',
    marks_obtained: 0,
    total_marks: 100,
    exam_date: new Date().toISOString().split('T')[0],
  })

  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .eq('student_id', user?.id)
      return data
    },
    enabled: !!user,
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('grades').insert({
        student_id: user?.id,
        ...formData,
      })
      if (error) throw error

      // Award XP for entering grade
      const percentage = (formData.marks_obtained / formData.total_marks) * 100
      const xpAmount = percentage >= 90 ? 100 : percentage >= 75 ? 50 : 25
      
      await gamificationService.awardXP(user?.id!, xpAmount, 'Entered grade', 'grades')
      
      // Check for achievements
      if (percentage >= 90) {
        await gamificationService.unlockAchievement(user?.id!, 'first_a_plus')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['grades'])
      toast.success('Grade added successfully!')
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Enter Grade</h1>

      <Card variant="glass">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Subject *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background-surface border border-white/10 focus:ring-2 focus:ring-neon-purple"
            >
              <option value="">Select subject</option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Exam Type *
            </label>
            <select
              value={formData.exam_type}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value as any })}
              className="w-full px-4 py-3 rounded-xl bg-background-surface border border-white/10 focus:ring-2 focus:ring-neon-purple"
            >
              <option value="mid">Mid Semester</option>
              <option value="end">End Semester</option>
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="lab">Lab</option>
              <option value="project">Project</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Marks Obtained *"
              value={formData.marks_obtained}
              onChange={(e) => setFormData({ ...formData, marks_obtained: parseFloat(e.target.value) })}
            />

            <Input
              type="number"
              label="Total Marks *"
              value={formData.total_marks}
              onChange={(e) => setFormData({ ...formData, total_marks: parseFloat(e.target.value) })}
            />
          </div>

          <Input
            type="date"
            label="Exam Date"
            value={formData.exam_date}
            onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
          />

          {/* Percentage Preview */}
          <div className="p-4 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
            <p className="text-sm text-text-secondary mb-1">Percentage</p>
            <p className="text-3xl font-bold text-neon-purple">
              {((formData.marks_obtained / formData.total_marks) * 100).toFixed(2)}%
            </p>
          </div>

          <Button
            onClick={() => createMutation.mutate()}
            isLoading={createMutation.isPending}
            className="w-full"
          >
            Save Grade
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

---

### 3. ACHIEVEMENTS PAGE

#### `src/app/dashboard/achievements/page.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/card'
import AchievementBadge from '@/components/gamification/achievement-badge'
import { gamificationService } from '@/lib/services/gamification'
import { Trophy, Zap, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AchievementsPage() {
  const supabase = createClient()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', user?.id)
        .order('unlocked_at', { ascending: false })
      return data
    },
    enabled: !!user,
  })

  const { data: xpData } = useQuery({
    queryKey: ['xp-data'],
    queryFn: async () => {
      const totalXP = await gamificationService.getTotalXP(user?.id!)
      const level = gamificationService.calculateLevel(totalXP)
      const nextLevelXP = gamificationService.calculateXPForNextLevel(level)
      const currentLevelXP = level > 1 ? gamificationService.calculateXPForNextLevel(level - 1) : 0
      const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
      
      return { totalXP, level, nextLevelXP, progress }
    },
    enabled: !!user,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Achievements & Rewards</h1>

      {/* XP Progress Card */}
      <Card variant="glass">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
            <span className="text-4xl font-bold">{xpData?.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold">Level {xpData?.level}</h2>
                <p className="text-text-secondary">{xpData?.totalXP} XP</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Next Level</p>
                <p className="font-bold">{xpData?.nextLevelXP} XP</p>
              </div>
            </div>
            <div className="h-4 bg-background-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpData?.progress}%` }}
                className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{achievements?.length || 0}</p>
              <p className="text-sm text-text-secondary">Unlocked</p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">{xpData?.totalXP}</p>
              <p className="text-sm text-text-secondary">Total XP</p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">Top 10%</p>
              <p className="text-sm text-text-secondary">Ranking</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements?.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              title={achievement.title}
              description={achievement.description}
              icon={achievement.icon}
              rarity={achievement.rarity as any}
              xpEarned={achievement.xp_earned}
              unlocked={true}
              unlockedAt={achievement.unlocked_at}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

Due to length, I'll create a comprehensive summary document with ALL remaining pages...
