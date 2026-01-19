'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import AIChat from '@/components/ai/ai-chat'
import { aiService } from '@/lib/services/ai'
import HolographicCard from '@/components/ui/holographic/HolographicCard'
import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'

export default function AIBuddyPage() {
    const [conversationId] = useState('default')
    const supabase = createClient()

    // Get student context for the AI
    const { data: context } = useQuery({
        queryKey: ['aiContext'],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser()
            if (!user.user) return null

            // Get attendance
            const { data: attendance } = await supabase
                .from('attendance')
                .select('*')
                .eq('student_id', user.user.id)

            // Get subjects
            const { data: subjects } = await supabase
                .from('subjects')
                .select('*')
                .eq('student_id', user.user.id)

            // Get Grades - handled safely if table is empty
            const { data: grades } = await supabase
                .from('grades')
                .select('*')
                .eq('student_id', user.user.id)

            return {
                attendance: attendance || [],
                subjects: subjects || [],
                grades: grades || []
            }
        }
    })

    const handleSendMessage = async (message: string) => {
        // In a real implementation, this would call the actual AI service
        // For now, we'll use the service mock/stub if OpenAI key isn't set, 
        // or the actual service if it is.
        const response = await aiService.sendMessage(
            conversationId,
            message,
            context
        )
        return response.response
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                            <Bot className="w-8 h-8 text-neon-blue" />
                        </span>
                        <span className="gradient-text">NEURAL LINK</span>
                    </h1>
                    <p className="text-text-secondary font-mono text-sm mt-1 ml-1">
                        SYSTEM VERSION 2.0 // ONLINE
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20">
                    <Sparkles className="w-4 h-4 text-neon-purple" />
                    <span className="text-xs font-mono text-neon-purple">GPT-4 ENGINE ACTIVE</span>
                </div>
            </motion.div>

            <HolographicCard className="flex-1 overflow-hidden flex flex-col p-0 border-neon-blue/20 bg-black/40 backdrop-blur-xl">
                <AIChat
                    conversationId={conversationId}
                    onSendMessage={handleSendMessage}
                    context={context}
                    className="h-full"
                />
            </HolographicCard>
        </div>
    )
}
