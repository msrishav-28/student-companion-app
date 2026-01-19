'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { mlPredictionService } from '@/lib/services/ml-predictions'
import HolographicCard from '@/components/ui/holographic/HolographicCard'
import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Brain, Clock, Target, ShieldCheck } from 'lucide-react'
import TextScramble from '@/components/ui/holographic/TextScramble'

export default function PredictionsPage() {
    const supabase = createClient()

    // 1. Fetch Risk Assessment
    const { data: riskData, isLoading: riskLoading } = useQuery({
        queryKey: ['risk-assessment'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) return null
            return await mlPredictionService.identifyRisks(user.user.id)
        }
    })

    // 2. Fetch Study Plan
    const { data: studyPlan, isLoading: studyLoading } = useQuery({
        queryKey: ['study-plan'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) return null
            // Defaulting to 15 hours/week for calculation
            return await mlPredictionService.calculateStudyTimeAllocation(user.user.id, 15)
        }
    })

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'text-neon-pink'
            case 'medium': return 'text-neon-yellow'
            case 'low': return 'text-neon-green'
            default: return 'text-text-secondary'
        }
    }

    const getRiskBg = (risk: string) => {
        switch (risk) {
            case 'high': return 'bg-neon-pink/10 border-neon-pink/30'
            case 'medium': return 'bg-neon-yellow/10 border-neon-yellow/30'
            case 'low': return 'bg-neon-green/10 border-neon-green/30'
            default: return 'bg-white/5 border-white/10'
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-display font-bold flex items-center gap-3 mb-2">
                    <span className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
                        <Brain className="w-8 h-8 text-neon-purple" />
                    </span>
                    <span className="gradient-text">ORACLE ANALYTICS</span>
                </h1>
                <p className="text-text-secondary font-mono text-sm ml-14">
                    PREDICTIVE MODELING // ACADEMIC FORECAST
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Risk Assessment Card */}
                <motion.div variants={item} className="lg:col-span-2">
                    <HolographicCard className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-neon-yellow" />
                                Risk Assessment
                            </h2>
                            <div className={`px-3 py-1 rounded-full border text-xs font-mono uppercase ${getRiskBg(riskData?.overallRisk || 'low')} ${getRiskColor(riskData?.overallRisk || 'low')}`}>
                                {riskData?.overallRisk || 'ANALYZING'} RISK LEVEL
                            </div>
                        </div>

                        {riskLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-12 bg-white/5 rounded-lg" />
                                <div className="h-12 bg-white/5 rounded-lg" />
                            </div>
                        ) : riskData?.risks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-neon-green/5 rounded-xl border border-neon-green/10">
                                <ShieldCheck className="w-12 h-12 text-neon-green mb-3" />
                                <h3 className="text-neon-green font-bold text-lg">SYSTEM STABLE</h3>
                                <p className="text-text-secondary text-sm">No academic risks detected. Keep pace maintained.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {riskData?.risks.map((risk, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${getRiskBg(risk.severity)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono uppercase opacity-70 tracking-wider">
                                                {risk.type} ALERT
                                            </span>
                                            <span className={`text-xs font-bold uppercase ${getRiskColor(risk.severity)}`}>
                                                {risk.severity} PRIORITY
                                            </span>
                                        </div>
                                        <p className="font-bold mb-2">{risk.description}</p>
                                        <ul className="space-y-1">
                                            {risk.recommendations.map((rec, j) => (
                                                <li key={j} className="text-sm text-text-secondary flex items-start gap-2">
                                                    <span className="text-neon-blue mt-1">›</span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </HolographicCard>
                </motion.div>

                {/* Study Time Allocation */}
                <motion.div variants={item}>
                    <HolographicCard className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-neon-blue" />
                                Study Plan
                            </h2>
                            <Target className="w-5 h-5 text-neon-purple opacity-50" />
                        </div>

                        {studyLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-white/5 rounded" />
                                <div className="h-8 bg-white/5 rounded" />
                                <div className="h-8 bg-white/5 rounded" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {studyPlan?.subjectAllocations.map((subject, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-text-primary">{subject.subjectName}</span>
                                            <span className="font-mono text-neon-blue font-bold">{subject.hoursPerWeek}h</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(subject.hoursPerWeek / (studyPlan.totalHoursPerWeek || 1)) * 100}%` }}
                                                className={`h-full ${subject.priority === 'high' ? 'bg-neon-pink' :
                                                        subject.priority === 'medium' ? 'bg-neon-purple' : 'bg-neon-blue'
                                                    }`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-text-muted text-right uppercase tracking-wider">
                                            {subject.priority} Priority
                                        </p>
                                    </div>
                                ))}

                                <div className="pt-4 mt-4 border-t border-white/5">
                                    <p className="text-center text-xs text-text-secondary font-mono">
                                        TOTAL LOAD: <span className="text-neon-green font-bold text-sm">
                                            <TextScramble value={studyPlan?.totalHoursPerWeek || 0} />
                                        </span> HRS/WEEK
                                    </p>
                                </div>
                            </div>
                        )}
                    </HolographicCard>
                </motion.div>
            </motion.div>

            {/* Grade Forecasting (Mock Visual) */}
            <motion.div
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
            >
                <HolographicCard>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-6 h-6 text-neon-green" />
                        <div>
                            <h2 className="text-xl font-bold">Performance Trajectory</h2>
                            <p className="text-xs text-text-secondary font-mono">ML CONFIDENCE SCORE: 87.4%</p>
                        </div>
                    </div>

                    <div className="h-48 flex items-end justify-between gap-2 px-2 pb-2 relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 border-b border-l border-white/10 opacity-30 pointer-events-none" />

                        {[65, 68, 72, 70, 75, 78, 82, 85].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-2 group">
                                <div className="text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity font-mono text-neon-green mb-1">{val}%</div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ delay: i * 0.1, duration: 1, type: 'spring' }}
                                    className="w-full bg-neon-green/20 border-t border-neon-green/50 rounded-t-sm relative group-hover:bg-neon-green/40 transition-colors"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-green shadow-[0_0_10px_#00FF94]" />
                                </motion.div>
                                <p className="text-xs text-center text-text-muted font-mono">SEM {i + 1}</p>
                            </div>
                        ))}
                    </div>
                </HolographicCard>
            </motion.div>
        </div>
    )
}
