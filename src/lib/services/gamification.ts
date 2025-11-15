import { firebaseClient, where, orderBy, limit, serverTimestamp } from '@/lib/firebase/client'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, increment, writeBatch, doc as firestoreDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

// Gamification Service for badges, XP, streaks (Phase 3)
export class GamificationService {
  /**
   * Award XP to student
   */
  async awardXP(
    studentId: string,
    amount: number,
    reason: string,
    source: string
  ): Promise<{
    totalXP: number
    newLevel: number
    leveledUp: boolean
  }> {
    const batch = writeBatch(db)
    
    // Get current student XP
    const studentRef = firestoreDoc(db, 'students', studentId)
    const studentSnap = await getDoc(studentRef)
    const currentXP = studentSnap.exists() ? (studentSnap.data().total_xp || 0) : 0
    
    const totalXP = currentXP + amount
    const oldLevel = this.calculateLevel(currentXP)
    const newLevel = this.calculateLevel(totalXP)

    // Update student XP
    batch.update(studentRef, {
      total_xp: totalXP,
      level: newLevel,
      updated_at: serverTimestamp()
    })

    // Create XP transaction record
    const xpTransactionRef = firestoreDoc(collection(db, 'xp_transactions'))
    batch.set(xpTransactionRef, {
      student_id: studentId,
      amount,
      reason,
      source,
      created_at: serverTimestamp()
    })

    await batch.commit()

    return {
      totalXP,
      newLevel,
      leveledUp: newLevel > oldLevel,
    }
  }

  /**
   * Calculate level from XP
   */
  calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  /**
   * Calculate XP needed for next level
   */
  calculateXPForNextLevel(currentLevel: number): number {
    return (currentLevel * currentLevel) * 100
  }

  /**
   * Update streak
   */
  async updateStreak(
    studentId: string,
    streakType: 'attendance' | 'study' | 'assignment' | 'login'
  ): Promise<{
    currentStreak: number
    longestStreak: number
    newAchievement?: any
  }> {
    const today = new Date().toISOString().split('T')[0]
    
    // Query for existing streak
    const streaks = await firebaseClient.queryDocuments<any>('streaks', [
      where('student_id', '==', studentId),
      where('streak_type', '==', streakType)
    ])
    
    let currentStreak = 1
    let longestStreak = 1
    let streakId: string | null = null
    
    if (streaks.length > 0) {
      const streak = streaks[0]
      streakId = streak.id
      const lastDate = new Date(streak.last_activity_date)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        // Continue streak
        currentStreak = streak.current_streak + 1
        longestStreak = Math.max(currentStreak, streak.longest_streak)
      } else if (diffDays > 1) {
        // Streak broken, restart
        currentStreak = 1
        longestStreak = streak.longest_streak
      } else {
        // Same day, no update needed
        return {
          currentStreak: streak.current_streak,
          longestStreak: streak.longest_streak
        }
      }
    }
    
    // Update or create streak
    if (streakId) {
      await firebaseClient.updateDocument('streaks', streakId, {
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today
      })
    } else {
      await firebaseClient.createDocument('streaks', {
        student_id: studentId,
        streak_type: streakType,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today
      })
    }
    
    const streakCount = currentStreak

    // Check for streak achievements
    let newAchievement = null
    if (streakCount === 7) {
      newAchievement = await this.unlockAchievement(studentId, 'week_streak', streakType)
    } else if (streakCount === 30) {
      newAchievement = await this.unlockAchievement(studentId, 'month_streak', streakType)
    } else if (streakCount === 100) {
      newAchievement = await this.unlockAchievement(studentId, 'century_streak', streakType)
    }

    return {
      currentStreak: streakCount,
      longestStreak: streakCount,
      newAchievement,
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(
    studentId: string,
    badgeType: string,
    context?: string
  ): Promise<any> {
    // Check if already unlocked
    const existing = await firebaseClient.queryDocuments<any>('achievements', [
      where('student_id', '==', studentId),
      where('badge_type', '==', badgeType)
    ])

    if (existing.length > 0) return null

    const achievement = this.getAchievementDetails(badgeType, context)

    const achievementId = await firebaseClient.createDocument('achievements', {
      student_id: studentId,
      ...achievement,
      unlocked_at: serverTimestamp()
    })

    // Award XP for the achievement
    if (achievement.xp_earned) {
      await this.awardXP(studentId, achievement.xp_earned, `Unlocked ${achievement.title}`, 'achievement')
    }

    return { id: achievementId, ...achievement }
  }

  /**
   * Get achievement details
   */
  private getAchievementDetails(badgeType: string, context?: string) {
    const achievements: Record<string, any> = {
      // Attendance Achievements
      perfect_week: {
        badge_type: 'perfect_week',
        title: 'Perfect Week',
        description: '100% attendance for 1 week straight',
        icon: '🎯',
        rarity: 'common',
        xp_earned: 50,
      },
      week_streak: {
        badge_type: 'week_streak',
        title: '7-Day Streak',
        description: 'Maintained your streak for 7 days',
        icon: '🔥',
        rarity: 'common',
        xp_earned: 100,
      },
      month_streak: {
        badge_type: 'month_streak',
        title: '30-Day Streak',
        description: 'Maintained your streak for 30 days',
        icon: '⭐',
        rarity: 'rare',
        xp_earned: 500,
      },
      century_streak: {
        badge_type: 'century_streak',
        title: 'Century Streak',
        description: '100 days of consistency!',
        icon: '🏆',
        rarity: 'legendary',
        xp_earned: 2000,
      },

      // Grade Achievements
      first_a_plus: {
        badge_type: 'first_a_plus',
        title: 'First A+',
        description: 'Scored your first A+ grade',
        icon: '📚',
        rarity: 'common',
        xp_earned: 100,
      },
      dean_list: {
        badge_type: 'dean_list',
        title: 'Dean\'s List',
        description: 'Achieved 9+ CGPA',
        icon: '🎓',
        rarity: 'epic',
        xp_earned: 1000,
      },
      all_rounder: {
        badge_type: 'all_rounder',
        title: 'All-Rounder',
        description: 'A+ in all subjects this semester',
        icon: '🌟',
        rarity: 'legendary',
        xp_earned: 2500,
      },

      // Assignment Achievements
      never_missed: {
        badge_type: 'never_missed',
        title: 'Assignment Ninja',
        description: 'Never missed a deadline',
        icon: '⚡',
        rarity: 'rare',
        xp_earned: 300,
      },
      early_bird: {
        badge_type: 'early_bird',
        title: 'Early Bird',
        description: 'Submitted 10 assignments early',
        icon: '🐦',
        rarity: 'common',
        xp_earned: 150,
      },

      // Social Achievements
      helpful_peer: {
        badge_type: 'helpful_peer',
        title: 'Helpful Peer',
        description: 'Helped 10 classmates with notes',
        icon: '🤝',
        rarity: 'rare',
        xp_earned: 400,
      },
      knowledge_sharer: {
        badge_type: 'knowledge_sharer',
        title: 'Knowledge Sharer',
        description: 'Shared 50+ notes publicly',
        icon: '📤',
        rarity: 'epic',
        xp_earned: 800,
      },

      // Comeback Achievements
      comeback_king: {
        badge_type: 'comeback_king',
        title: 'Comeback King',
        description: 'Improved CGPA by 1+ point',
        icon: '👑',
        rarity: 'epic',
        xp_earned: 1500,
      },
      attendance_recovery: {
        badge_type: 'attendance_recovery',
        title: 'Recovery Master',
        description: 'Brought attendance from danger to safe zone',
        icon: '💪',
        rarity: 'rare',
        xp_earned: 600,
      },
    }

    return achievements[badgeType] || achievements.perfect_week
  }

  /**
   * Get student's total XP
   */
  async getTotalXP(studentId: string): Promise<number> {
    const student = await firebaseClient.getDocument<any>('students', studentId)
    return student?.total_xp || 0
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    category: 'attendance' | 'grades' | 'xp' | 'streak',
    limitCount = 100
  ): Promise<any[]> {
    const leaderboard = await firebaseClient.queryDocuments<any>('leaderboard_entries', [
      where('category', '==', category),
      orderBy('score', 'desc'),
      limit(limitCount)
    ])

    return leaderboard
  }

  /**
   * Update leaderboard entry
   */
  async updateLeaderboard(
    studentId: string,
    category: 'attendance' | 'grades' | 'xp' | 'streak',
    score: number
  ): Promise<void> {
    // Check if entry exists
    const existing = await firebaseClient.queryDocuments<any>('leaderboard_entries', [
      where('student_id', '==', studentId),
      where('category', '==', category)
    ])

    if (existing.length > 0) {
      await firebaseClient.updateDocument('leaderboard_entries', existing[0].id, {
        score,
        period: 'current'
      })
    } else {
      await firebaseClient.createDocument('leaderboard_entries', {
        student_id: studentId,
        category,
        score,
        period: 'current'
      })
    }
  }

  /**
   * Check for automatic achievements based on activity
   */
  async checkAndAwardAchievements(studentId: string, activity: {
    type: 'attendance' | 'grade' | 'assignment' | 'social'
    data: any
  }): Promise<any[]> {
    const newAchievements: any[] = []

    switch (activity.type) {
      case 'attendance':
        if (activity.data.percentage === 100) {
          const achievement = await this.unlockAchievement(studentId, 'perfect_week')
          if (achievement) newAchievements.push(achievement)
        }
        break

      case 'grade':
        if (activity.data.grade === 'A+') {
          const achievement = await this.unlockAchievement(studentId, 'first_a_plus')
          if (achievement) newAchievements.push(achievement)
        }
        if (activity.data.cgpa >= 9) {
          const achievement = await this.unlockAchievement(studentId, 'dean_list')
          if (achievement) newAchievements.push(achievement)
        }
        break

      case 'assignment':
        if (activity.data.submittedEarly) {
          const achievement = await this.unlockAchievement(studentId, 'early_bird')
          if (achievement) newAchievements.push(achievement)
        }
        break
    }

    return newAchievements
  }
}

export const gamificationService = new GamificationService()
