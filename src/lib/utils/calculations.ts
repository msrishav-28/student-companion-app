import type { Database } from '@/types/database.types'

type AttendanceStatus = Database['public']['Tables']['attendance']['Row']['status']
type AttendanceRecord = Database['public']['Tables']['attendance']['Row']
type Grade = Database['public']['Tables']['grades']['Row']
type Subject = Database['public']['Tables']['subjects']['Row']

// ============================================
// ATTENDANCE CALCULATIONS
// ============================================

export function calculateAttendancePercentage(
  present: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((present / total) * 100 * 100) / 100
}

export function calculateClassesMissed(
  percentage: number,
  totalClasses: number
): number {
  const presentClasses = Math.round((percentage / 100) * totalClasses)
  return totalClasses - presentClasses
}

export function calculateClassesCanMiss(
  currentPercentage: number,
  currentTotal: number,
  targetPercentage: number
): number {
  if (currentPercentage <= targetPercentage) return 0
  
  const currentPresent = Math.round((currentPercentage / 100) * currentTotal)
  let canMiss = 0
  
  while (true) {
    const newTotal = currentTotal + canMiss
    const newPercentage = (currentPresent / newTotal) * 100
    
    if (newPercentage < targetPercentage) break
    canMiss++
  }
  
  return canMiss - 1
}

export function calculateClassesNeedToAttend(
  currentPercentage: number,
  currentTotal: number,
  targetPercentage: number
): number {
  if (currentPercentage >= targetPercentage) return 0
  
  const currentPresent = Math.round((currentPercentage / 100) * currentTotal)
  let needToAttend = 0
  
  while (true) {
    const newTotal = currentTotal + needToAttend
    const newPresent = currentPresent + needToAttend
    const newPercentage = (newPresent / newTotal) * 100
    
    if (newPercentage >= targetPercentage) break
    needToAttend++
  }
  
  return needToAttend
}

export function isAttendanceSafe(
  percentage: number,
  midSemThreshold = 75,
  endSemThreshold = 85
): {
  midSemSafe: boolean
  endSemSafe: boolean
  status: 'critical' | 'warning' | 'safe'
} {
  const midSemSafe = percentage >= midSemThreshold
  const endSemSafe = percentage >= endSemThreshold
  
  let status: 'critical' | 'warning' | 'safe'
  if (percentage < midSemThreshold) {
    status = 'critical'
  } else if (percentage < endSemThreshold) {
    status = 'warning'
  } else {
    status = 'safe'
  }
  
  return { midSemSafe, endSemSafe, status }
}

export function getAttendanceStats(records: AttendanceRecord[]) {
  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length
  const medical = records.filter(r => r.status === 'medical').length
  const total = present + absent
  const percentage = calculateAttendancePercentage(present, total)
  
  return {
    present,
    absent,
    medical,
    total,
    percentage,
    ...isAttendanceSafe(percentage)
  }
}

// ============================================
// GPA/CGPA CALCULATIONS
// ============================================

export function marksToGradePoint(
  marksObtained: number,
  totalMarks: number,
  scale: '4.0' | '10.0' = '10.0'
): number {
  const percentage = (marksObtained / totalMarks) * 100
  
  if (scale === '4.0') {
    if (percentage >= 90) return 4.0
    if (percentage >= 80) return 3.7
    if (percentage >= 70) return 3.3
    if (percentage >= 60) return 3.0
    if (percentage >= 50) return 2.7
    if (percentage >= 40) return 2.3
    return 0.0
  } else {
    // 10.0 scale (Indian standard)
    return Math.round((percentage / 10) * 100) / 100
  }
}

export function marksToGradeLetter(
  marksObtained: number,
  totalMarks: number
): string {
  const percentage = (marksObtained / totalMarks) * 100
  
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C+'
  if (percentage >= 40) return 'C'
  if (percentage >= 30) return 'D'
  return 'F'
}

export function calculateGPA(
  grades: Grade[],
  subjects: Subject[],
  scale: '4.0' | '10.0' = '10.0'
): number {
  if (grades.length === 0) return 0
  
  let totalCredits = 0
  let qualityPoints = 0
  
  grades.forEach(grade => {
    const subject = subjects.find(s => s.id === grade.subject_id)
    if (!subject) return
    
    const gradePoint = marksToGradePoint(
      grade.marks_obtained,
      grade.total_marks,
      scale
    )
    
    qualityPoints += gradePoint * subject.credits
    totalCredits += subject.credits
  })
  
  if (totalCredits === 0) return 0
  
  return Math.round((qualityPoints / totalCredits) * 100) / 100
}

export function calculateCGPA(
  allGrades: Grade[],
  allSubjects: Subject[],
  scale: '4.0' | '10.0' = '10.0'
): number {
  return calculateGPA(allGrades, allSubjects, scale)
}

export function calculateSemesterGPA(
  grades: Grade[],
  subjects: Subject[],
  semester: number,
  scale: '4.0' | '10.0' = '10.0'
): number {
  const semesterGrades = grades.filter(g => g.semester === semester)
  return calculateGPA(semesterGrades, subjects, scale)
}

export function calculatePercentage(
  grades: Grade[],
  subjects: Subject[]
): number {
  if (grades.length === 0) return 0
  
  let totalWeightedMarks = 0
  let totalWeightedMax = 0
  
  grades.forEach(grade => {
    const subject = subjects.find(s => s.id === grade.subject_id)
    if (!subject) return
    
    const weight = subject.credits
    totalWeightedMarks += (grade.marks_obtained / grade.total_marks) * 100 * weight
    totalWeightedMax += 100 * weight
  })
  
  if (totalWeightedMax === 0) return 0
  
  return Math.round((totalWeightedMarks / totalWeightedMax) * 100 * 100) / 100
}

// ============================================
// PREDICTIVE CALCULATIONS
// ============================================

export function predictFinalGrade(
  midSemMarks: number,
  midSemTotal: number,
  midSemWeightage: number = 0.3
): {
  requiredInEndSem: number
  predictedGrade: number
  isAchievable: boolean
} {
  const endSemWeightage = 1 - midSemWeightage
  const midSemPercentage = (midSemMarks / midSemTotal) * 100
  const currentContribution = midSemPercentage * midSemWeightage
  
  // Calculate required marks in end-sem for various targets
  const requiredFor90 = ((90 - currentContribution) / endSemWeightage)
  const requiredFor80 = ((80 - currentContribution) / endSemWeightage)
  const requiredFor70 = ((70 - currentContribution) / endSemWeightage)
  
  // Predict if student maintains same performance
  const predictedGrade = midSemPercentage
  
  return {
    requiredInEndSem: requiredFor70,
    predictedGrade,
    isAchievable: requiredFor70 <= 100
  }
}

export function calculateWhatIfScenario(
  currentGrades: Grade[],
  subjects: Subject[],
  hypotheticalGrades: { subjectId: string; marks: number; total: number }[]
): {
  currentGPA: number
  projectedGPA: number
  difference: number
} {
  const currentGPA = calculateGPA(currentGrades, subjects)
  
  const allGrades = [...currentGrades]
  hypotheticalGrades.forEach(hyp => {
    const existingIndex = allGrades.findIndex(g => g.subject_id === hyp.subjectId)
    if (existingIndex >= 0) {
      allGrades[existingIndex] = {
        ...allGrades[existingIndex],
        marks_obtained: hyp.marks,
        total_marks: hyp.total
      }
    }
  })
  
  const projectedGPA = calculateGPA(allGrades, subjects)
  
  return {
    currentGPA,
    projectedGPA,
    difference: Math.round((projectedGPA - currentGPA) * 100) / 100
  }
}

export function calculateRequiredGradeForTarget(
  currentGrades: Grade[],
  subjects: Subject[],
  targetCGPA: number,
  remainingSubjects: Subject[]
): {
  requiredGPA: number
  isAchievable: boolean
  averageMarksNeeded: number
} {
  const completedCredits = subjects
    .filter(s => currentGrades.some(g => g.subject_id === s.id))
    .reduce((sum, s) => sum + s.credits, 0)
  
  const remainingCredits = remainingSubjects.reduce((sum, s) => sum + s.credits, 0)
  const totalCredits = completedCredits + remainingCredits
  
  if (totalCredits === 0) {
    return { requiredGPA: 0, isAchievable: false, averageMarksNeeded: 0 }
  }
  
  const currentGPA = calculateGPA(currentGrades, subjects)
  const currentQualityPoints = currentGPA * completedCredits
  const targetQualityPoints = targetCGPA * totalCredits
  const requiredQualityPoints = targetQualityPoints - currentQualityPoints
  
  const requiredGPA = requiredQualityPoints / remainingCredits
  const isAchievable = requiredGPA <= 10 && requiredGPA >= 0
  const averageMarksNeeded = requiredGPA * 10 // Convert GPA to percentage
  
  return {
    requiredGPA: Math.round(requiredGPA * 100) / 100,
    isAchievable,
    averageMarksNeeded: Math.round(averageMarksNeeded * 100) / 100
  }
}
