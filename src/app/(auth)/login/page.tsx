'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import Card from '@/components/ui/card'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      toast.success('Check your email for the magic link!')
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-DEFAULT">
      <Card variant="glass" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">
            Welcome Back
          </h1>
          <p className="text-text-secondary">
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Email Address"
            placeholder="your.email@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={loading}
          >
            <Mail className="w-5 h-5 mr-2" />
            Send Magic Link
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <a href="/register" className="text-neon-purple hover:text-neon-blue font-semibold">
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-6 p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
          <p className="text-xs text-text-secondary text-center">
            🔒 We'll send you a secure magic link. No passwords needed!
          </p>
        </div>
      </Card>
    </div>
  )
}
