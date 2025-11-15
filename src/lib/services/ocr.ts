import Tesseract from 'tesseract.js'

// OCR Service for marksheet scanning and document processing (Phase 3)
export class OCRService {
  /**
   * Extract text from image using Tesseract.js
   */
  async extractTextFromImage(imageFile: File): Promise<{
    text: string
    confidence: number
  }> {
    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => console.log(m),
      })

      return {
        text: result.data.text,
        confidence: result.data.confidence,
      }
    } catch (error) {
      console.error('OCR Error:', error)
      throw new Error('Failed to extract text from image')
    }
  }

  /**
   * Parse marksheet from scanned image
   */
  async parseMarksheet(imageFile: File): Promise<{
    subjects: Array<{
      name: string
      marks: number
      totalMarks: number
      grade?: string
    }>
    semester?: number
    studentName?: string
    rollNumber?: string
  }> {
    const { text } = await this.extractTextFromImage(imageFile)

    // Parse text to extract grades
    const subjects = this.extractGradesFromText(text)

    return {
      subjects,
      semester: this.extractSemester(text),
      studentName: this.extractStudentName(text),
      rollNumber: this.extractRollNumber(text),
    }
  }

  /**
   * Parse timetable from image
   */
  async parseTimetable(imageFile: File): Promise<{
    subjects: Array<{
      name: string
      code?: string
      schedule: {
        day: string
        time: string
        room?: string
      }[]
    }>
  }> {
    const { text } = await this.extractTextFromImage(imageFile)

    // Extract subject names and timings
    const subjects = this.extractSubjectsFromTimetable(text)

    return { subjects }
  }

  /**
   * Extract grades from text using regex patterns
   */
  private extractGradesFromText(text: string): Array<{
    name: string
    marks: number
    totalMarks: number
    grade?: string
  }> {
    const subjects: any[] = []

    // Common patterns for grades
    // Example: "Mathematics 85/100 A"
    const gradePattern = /([A-Za-z\s]+)\s+(\d+)\/(\d+)\s*([A-F][+-]?)?/g
    let match

    while ((match = gradePattern.exec(text)) !== null) {
      subjects.push({
        name: match[1].trim(),
        marks: parseInt(match[2]),
        totalMarks: parseInt(match[3]),
        grade: match[4] || undefined,
      })
    }

    return subjects
  }

  /**
   * Extract semester from text
   */
  private extractSemester(text: string): number | undefined {
    const semPattern = /semester[:\s]*(\d+)|sem[:\s]*(\d+)/i
    const match = text.match(semPattern)
    return match ? parseInt(match[1] || match[2]) : undefined
  }

  /**
   * Extract student name from text
   */
  private extractStudentName(text: string): string | undefined {
    const namePattern = /name[:\s]*([A-Za-z\s]+)/i
    const match = text.match(namePattern)
    return match ? match[1].trim() : undefined
  }

  /**
   * Extract roll number from text
   */
  private extractRollNumber(text: string): string | undefined {
    const rollPattern = /roll\s*(?:no|number)[:\s]*([A-Z0-9]+)/i
    const match = text.match(rollPattern)
    return match ? match[1].trim() : undefined
  }

  /**
   * Extract subjects from timetable text
   */
  private extractSubjectsFromTimetable(text: string): Array<{
    name: string
    code?: string
    schedule: any[]
  }> {
    // This is a simplified version
    // In production, you'd use more sophisticated parsing
    const subjects: any[] = []

    const lines = text.split('\n')
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    lines.forEach(line => {
      // Look for subject names followed by times
      const timePattern = /(\d{1,2}):(\d{2})/g
      if (timePattern.test(line)) {
        // Extract subject name (usually at start of line)
        const subjectName = line.split(/\s+/)[0]
        if (subjectName.length > 3) {
          subjects.push({
            name: subjectName,
            schedule: [],
          })
        }
      }
    })

    return subjects
  }

  /**
   * Extract ID card information
   */
  async parseIDCard(imageFile: File): Promise<{
    name?: string
    rollNumber?: string
    department?: string
    validUntil?: string
  }> {
    const { text } = await this.extractTextFromImage(imageFile)

    return {
      name: this.extractStudentName(text),
      rollNumber: this.extractRollNumber(text),
      department: this.extractDepartment(text),
      validUntil: this.extractValidUntil(text),
    }
  }

  private extractDepartment(text: string): string | undefined {
    const deptPattern = /department[:\s]*([A-Za-z\s]+)/i
    const match = text.match(deptPattern)
    return match ? match[1].trim() : undefined
  }

  private extractValidUntil(text: string): string | undefined {
    const datePattern = /valid\s*(?:until|till)[:\s]*(\d{2}\/\d{2}\/\d{4})/i
    const match = text.match(datePattern)
    return match ? match[1] : undefined
  }
}

export const ocrService = new OCRService()
