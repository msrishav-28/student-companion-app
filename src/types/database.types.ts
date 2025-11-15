export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          email: string
          phone: string | null
          name: string
          year: number | null
          semester: number | null
          department: string
          degree: string
          roll_number: string | null
          batch: string | null
          target_cgpa: number | null
          profile_picture: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          name: string
          year?: number | null
          semester?: number | null
          department: string
          degree: string
          roll_number?: string | null
          batch?: string | null
          target_cgpa?: number | null
          profile_picture?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          name?: string
          year?: number | null
          semester?: number | null
          department?: string
          degree?: string
          roll_number?: string | null
          batch?: string | null
          target_cgpa?: number | null
          profile_picture?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          student_id: string
          name: string
          code: string | null
          credits: number
          professor: string | null
          professor_email: string | null
          room: string | null
          schedule: Json | null
          total_classes: number
          color: string | null
          icon: string | null
          semester: number | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          code?: string | null
          credits?: number
          professor?: string | null
          professor_email?: string | null
          room?: string | null
          schedule?: Json | null
          total_classes?: number
          color?: string | null
          icon?: string | null
          semester?: number | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          code?: string | null
          credits?: number
          professor?: string | null
          professor_email?: string | null
          room?: string | null
          schedule?: Json | null
          total_classes?: number
          color?: string | null
          icon?: string | null
          semester?: number | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          date: string
          status: 'present' | 'absent' | 'holiday' | 'medical' | 'cancelled'
          location: unknown | null
          notes: string | null
          marked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          date?: string
          status: 'present' | 'absent' | 'holiday' | 'medical' | 'cancelled'
          location?: unknown | null
          notes?: string | null
          marked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          date?: string
          status?: 'present' | 'absent' | 'holiday' | 'medical' | 'cancelled'
          location?: unknown | null
          notes?: string | null
          marked_at?: string
          created_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          exam_type: 'mid' | 'end' | 'assignment' | 'quiz' | 'lab' | 'project' | null
          marks_obtained: number
          total_marks: number
          weightage: number | null
          grade_letter: string | null
          semester: number | null
          exam_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          exam_type?: 'mid' | 'end' | 'assignment' | 'quiz' | 'lab' | 'project' | null
          marks_obtained: number
          total_marks: number
          weightage?: number | null
          grade_letter?: string | null
          semester?: number | null
          exam_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          exam_type?: 'mid' | 'end' | 'assignment' | 'quiz' | 'lab' | 'project' | null
          marks_obtained?: number
          total_marks?: number
          weightage?: number | null
          grade_letter?: string | null
          semester?: number | null
          exam_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          student_id: string
          subject_id: string | null
          title: string
          description: string | null
          type: 'assignment' | 'lab' | 'project' | 'test' | 'misc' | null
          due_date: string
          status: 'pending' | 'in_progress' | 'completed' | 'submitted' | 'overdue'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          submission_url: string | null
          attachments: Json | null
          reminder_sent: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id?: string | null
          title: string
          description?: string | null
          type?: 'assignment' | 'lab' | 'project' | 'test' | 'misc' | null
          due_date: string
          status?: 'pending' | 'in_progress' | 'completed' | 'submitted' | 'overdue'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          submission_url?: string | null
          attachments?: Json | null
          reminder_sent?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string | null
          title?: string
          description?: string | null
          type?: 'assignment' | 'lab' | 'project' | 'test' | 'misc' | null
          due_date?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'submitted' | 'overdue'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          submission_url?: string | null
          attachments?: Json | null
          reminder_sent?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          exam_name: string
          exam_type: 'mid' | 'end' | 'surprise' | 'viva' | null
          exam_date: string
          exam_time: string | null
          duration: number | null
          room: string | null
          syllabus: Json | null
          notes: string | null
          timetable_url: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          exam_name: string
          exam_type?: 'mid' | 'end' | 'surprise' | 'viva' | null
          exam_date: string
          exam_time?: string | null
          duration?: number | null
          room?: string | null
          syllabus?: Json | null
          notes?: string | null
          timetable_url?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          exam_name?: string
          exam_type?: 'mid' | 'end' | 'surprise' | 'viva' | null
          exam_date?: string
          exam_time?: string | null
          duration?: number | null
          room?: string | null
          syllabus?: Json | null
          notes?: string | null
          timetable_url?: string | null
          is_completed?: boolean
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          category: 'id' | 'certificate' | 'receipt' | 'medical' | 'form' | 'misc' | null
          file_url: string
          file_type: string | null
          file_size: number | null
          thumbnail_url: string | null
          metadata: Json | null
          tags: string[] | null
          expiry_date: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          category?: 'id' | 'certificate' | 'receipt' | 'medical' | 'form' | 'misc' | null
          file_url: string
          file_type?: string | null
          file_size?: number | null
          thumbnail_url?: string | null
          metadata?: Json | null
          tags?: string[] | null
          expiry_date?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          category?: 'id' | 'certificate' | 'receipt' | 'medical' | 'form' | 'misc' | null
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          thumbnail_url?: string | null
          metadata?: Json | null
          tags?: string[] | null
          expiry_date?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          student_id: string
          title: string
          message: string
          type: 'attendance' | 'assignment' | 'grade' | 'achievement' | 'social' | 'system' | null
          priority: 'low' | 'medium' | 'high' | 'urgent' | null
          action_url: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          message: string
          type?: 'attendance' | 'assignment' | 'grade' | 'achievement' | 'social' | 'system' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          message?: string
          type?: 'attendance' | 'assignment' | 'grade' | 'achievement' | 'social' | 'system' | null
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          student_id: string
          endpoint: string
          p256dh_key: string
          auth_key: string
          device_info: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          endpoint: string
          p256dh_key: string
          auth_key: string
          device_info?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          endpoint?: string
          p256dh_key?: string
          auth_key?: string
          device_info?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_attendance_percentage: {
        Args: {
          p_student_id: string
          p_subject_id: string
        }
        Returns: number
      }
      calculate_gpa: {
        Args: {
          p_student_id: string
          p_semester?: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
