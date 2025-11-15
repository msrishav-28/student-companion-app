import Link from 'next/link'
import { BookOpen, TrendingUp, Calendar, FileText } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-DEFAULT">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">
                Your Academic Life,
              </span>
              <br />
              Simplified
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Track attendance, manage grades, organize assignments, and stay on top of your academic goals - all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/register" 
                className="btn-primary"
              >
                Get Started Free
              </Link>
              <Link 
                href="/login" 
                className="btn-neon"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Excel
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Calendar className="w-10 h-10 text-neon-purple" />}
            title="Attendance Tracking"
            description="Swipe to mark attendance. Real-time percentage tracking with safe zone indicators."
          />
          <FeatureCard
            icon={<TrendingUp className="w-10 h-10 text-neon-blue" />}
            title="Grade Management"
            description="Calculate GPA, CGPA, and percentage. Predict final grades and plan your targets."
          />
          <FeatureCard
            icon={<FileText className="w-10 h-10 text-neon-pink" />}
            title="Assignment Tracker"
            description="Never miss a deadline. Smart reminders for all your assignments and projects."
          />
          <FeatureCard
            icon={<BookOpen className="w-10 h-10 text-neon-green" />}
            title="Document Wallet"
            description="Store ID cards, certificates, and receipts securely in one place."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-background-surface py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of students who are already managing their academic life better.
          </p>
          <Link href="/register" className="btn-primary text-lg">
            Start Free Today →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background-DEFAULT border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted">
          <p>© 2024 Student Companion. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </div>
  )
}
