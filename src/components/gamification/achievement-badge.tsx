'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Target } from 'lucide-react'

interface AchievementBadgeProps {
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpEarned: number
  unlocked: boolean
  unlockedAt?: string
}

export default function AchievementBadge({
  title,
  description,
  icon,
  rarity,
  xpEarned,
  unlocked,
  unlockedAt,
}: AchievementBadgeProps) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600',
  }

  const rarityGlow = {
    common: 'shadow-gray-500/50',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/50',
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        relative p-6 rounded-xl border-2
        ${unlocked ? 'glass-card' : 'bg-background-surface opacity-50'}
        ${unlocked ? `border-transparent bg-gradient-to-br ${rarityColors[rarity]}` : 'border-white/10'}
        ${unlocked ? `shadow-xl ${rarityGlow[rarity]}` : ''}
        transition-all duration-300
      `}
    >
      {/* Badge Icon */}
      <div className="text-center mb-4">
        <div className={`
          inline-flex items-center justify-center
          w-20 h-20 rounded-full text-4xl
          ${unlocked ? 'bg-white/20' : 'bg-white/5'}
        `}>
          {icon}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm text-text-secondary mb-3">{description}</p>
        
        {/* XP Badge */}
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-sm font-semibold">
          <Zap className="w-3 h-3" />
          +{xpEarned} XP
        </div>

        {/* Unlock Date */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-text-muted mt-2">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Rarity Badge */}
      <div className="absolute top-2 right-2">
        <span className={`
          px-2 py-1 rounded-full text-xs font-bold uppercase
          ${rarity === 'legendary' ? 'bg-yellow-500 text-black' : ''}
          ${rarity === 'epic' ? 'bg-purple-500 text-white' : ''}
          ${rarity === 'rare' ? 'bg-blue-500 text-white' : ''}
          ${rarity === 'common' ? 'bg-gray-500 text-white' : ''}
        `}>
          {rarity}
        </span>
      </div>

      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <p className="text-sm font-semibold">Locked</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
