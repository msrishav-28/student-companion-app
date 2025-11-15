import { format, formatDistance, formatRelative, isToday, isTomorrow, isYesterday, addDays, differenceInDays } from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatStr)
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm')
}

export function getRelativeTime(date: string | Date): string {
  const d = new Date(date)
  
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isYesterday(d)) return 'Yesterday'
  
  return formatRelative(d, new Date())
}

export function getTimeAgo(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export function getDaysUntil(date: string | Date): number {
  return differenceInDays(new Date(date), new Date())
}

export function isUpcoming(date: string | Date, daysThreshold: number = 7): boolean {
  const days = getDaysUntil(date)
  return days >= 0 && days <= daysThreshold
}

export function isOverdue(date: string | Date): boolean {
  return getDaysUntil(date) < 0
}

export function getDueDateStatus(dueDate: string | Date): {
  status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'future'
  label: string
  daysRemaining: number
} {
  const days = getDaysUntil(dueDate)
  
  if (days < 0) {
    return {
      status: 'overdue',
      label: `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`,
      daysRemaining: days
    }
  }
  
  if (days === 0) {
    return {
      status: 'today',
      label: 'Due today',
      daysRemaining: days
    }
  }
  
  if (days === 1) {
    return {
      status: 'tomorrow',
      label: 'Due tomorrow',
      daysRemaining: days
    }
  }
  
  if (days <= 7) {
    return {
      status: 'upcoming',
      label: `Due in ${days} days`,
      daysRemaining: days
    }
  }
  
  return {
    status: 'future',
    label: formatDate(dueDate),
    daysRemaining: days
  }
}

export function getWeekDayName(date: string | Date): string {
  return format(new Date(date), 'EEEE')
}

export function getMonthName(date: string | Date): string {
  return format(new Date(date), 'MMMM')
}

export function getCurrentSemester(academicYearStart: Date = new Date(new Date().getFullYear(), 6, 1)): number {
  const now = new Date()
  const monthsSinceStart = differenceInDays(now, academicYearStart) / 30
  
  if (monthsSinceStart < 6) return 1 // Odd semester
  return 2 // Even semester
}
