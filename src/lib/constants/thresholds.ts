// Attendance thresholds
export const ATTENDANCE_THRESHOLDS = {
  MID_SEM: 75,
  END_SEM: 85,
  CRITICAL: 70,
  WARNING: 75,
  SAFE: 85
} as const

// Grade scales
export const GRADE_SCALES = {
  GPA_4: '4.0',
  GPA_10: '10.0'
} as const

// Safe zone colors
export const SAFE_ZONE_COLORS = {
  CRITICAL: '#FF4757',
  WARNING: '#FFA502',
  SAFE: '#00FF88'
} as const

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

// Assignment priorities
export const ASSIGNMENT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HOLIDAY: 'holiday',
  MEDICAL: 'medical',
  CANCELLED: 'cancelled'
} as const

// Exam types
export const EXAM_TYPES = {
  MID: 'mid',
  END: 'end',
  SURPRISE: 'surprise',
  VIVA: 'viva'
} as const

// Assignment types
export const ASSIGNMENT_TYPES = {
  ASSIGNMENT: 'assignment',
  LAB: 'lab',
  PROJECT: 'project',
  TEST: 'test',
  MISC: 'misc'
} as const

// Document categories
export const DOCUMENT_CATEGORIES = {
  ID: 'id',
  CERTIFICATE: 'certificate',
  RECEIPT: 'receipt',
  MEDICAL: 'medical',
  FORM: 'form',
  MISC: 'misc'
} as const

// App routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ATTENDANCE: '/dashboard/attendance',
  GRADES: '/dashboard/grades',
  ASSIGNMENTS: '/dashboard/assignments',
  EXAMS: '/dashboard/exams',
  DOCUMENTS: '/dashboard/documents',
  PROFILE: '/dashboard/profile'
} as const
