'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    department: '',
    year: 1,
    semester: 1,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Send magic link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
            department: formData.department,
            year: formData.year,
            semester: formData.semester,
          },
        },
      })

      if (authError) throw authError

      toast.success('Check your email for the magic link!')
      
      // Note: Profile will be created in auth callback after email verification
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-DEFAULT">
      <Card variant="glass" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">
            Create Account
          </h1>
          <p className="text-text-secondary">
            Join thousands of students managing their academic life better
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="text"
            label="Full Name *"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
          />

          <Input
            type="email"
            label="Email Address *"
            placeholder="your.email@college.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />

          <Input
            type="text"
            label="Department"
            placeholder="Computer Science"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Year"
              min="1"
              max="5"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              disabled={loading}
            />

            <Input
              type="number"
              label="Semester"
              min="1"
              max="10"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <a href="/login" className="text-neon-purple hover:text-neon-blue font-semibold">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-6 p-4 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
          <p className="text-xs text-text-secondary text-center">
            🔒 We'll send you a secure magic link. Your data is encrypted and never shared.
          </p>
        </div>
      </Card>
    </div>
  )
}
