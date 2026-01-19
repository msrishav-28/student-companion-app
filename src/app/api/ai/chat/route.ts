import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Configuration for the 3-Tier Strategy
const PROVIDERS = {
    GEMINI: {
        name: 'Gemini',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        envKey: 'GEMINI_API_KEY',
    },
    DEEPSEEK: {
        name: 'DeepSeek',
        url: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-chat',
        envKey: 'DEEPSEEK_API_KEY',
    },
    GROQ: {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-8b-8192',
        envKey: 'GROQ_API_KEY',
    }
};

export async function POST(req: Request) {
    try {
        const { messages, conversation_id } = await req.json();

        if (!messages) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        // --- TIER 1: GEMINI (Primary) ---
        try {
            if (process.env.GEMINI_API_KEY) {
                console.log('Attempting Tier 1: Gemini...');
                const response = await callGemini(messages);
                return await saveAndRespond(response, 'Gemini', messages, conversation_id);
            }
        } catch (e) {
            console.error('Gemini Failed:', e);
            // Fallthrough to Tier 2
        }

        // --- TIER 2: DEEPSEEK (Secondary) ---
        try {
            if (process.env.DEEPSEEK_API_KEY) {
                console.log('Attempting Tier 2: DeepSeek...');
                const response = await callOpenAICompatible(
                    PROVIDERS.DEEPSEEK.url,
                    PROVIDERS.DEEPSEEK.envKey,
                    PROVIDERS.DEEPSEEK.model!,
                    messages
                );
                return await saveAndRespond(response, 'DeepSeek', messages, conversation_id);
            }
        } catch (e) {
            console.error('DeepSeek Failed:', e);
            // Fallthrough to Tier 3
        }

        // --- TIER 3: GROQ (Tertiary) ---
        try {
            if (process.env.GROQ_API_KEY) {
                console.log('Attempting Tier 3: Groq...');
                const response = await callOpenAICompatible(
                    PROVIDERS.GROQ.url,
                    PROVIDERS.GROQ.envKey,
                    PROVIDERS.GROQ.model!,
                    messages
                );
                return await saveAndRespond(response, 'Groq', messages, conversation_id);
            }
        } catch (e) {
            console.error('Groq Failed:', e);
            // Fallthrough to Error
        }

        return NextResponse.json({ error: 'All AI systems offline. Please check API keys.' }, { status: 503 });

    } catch (error) {
        console.error('AI Route Fatal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper: Call Gemini REST API
async function callGemini(messages: any[]) {
    const geminiMessages = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));

    // For the very first message, if system, Gemini needs it in specific way or just merge.
    // Simplifying: Just pass recent history or full history. 
    // Gemini doesn't support 'system' role in `contents` strictly in the same way, usually passed as system_instruction or merged.
    // For MVP, we'll map 'system' to 'user' with a directive or just ignore if it's strictly message history.
    // Better adjustment: Filter out system messages or prepend to first user message.

    // Quick fix for system prompt if present 
    let finalContents = geminiMessages.filter((m: any) => m.role !== 'system');

    const url = `${PROVIDERS.GEMINI.url}?key=${process.env.GEMINI_API_KEY}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: finalContents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            }
        })
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('Empty response from Gemini');

    return {
        content: text,
        usage: {
            // Estimate or grab if available (Gemini usage meta is sometimes different)
            prompt_tokens: 0,
            completion_tokens: 0,
        }
    };
}

// Helper: Call OpenAI-Compatible API (DeepSeek, Groq)
async function callOpenAICompatible(url: string, envKeyName: string, model: string, messages: any[]) {
    const key = process.env[envKeyName];
    if (!key) throw new Error(`Missing key: ${envKeyName}`);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
        })
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    return {
        content: data.choices[0].message.content,
        usage: data.usage || { prompt_tokens: 0, completion_tokens: 0 }
    };
}

// Helper: Save to DB and Return
async function saveAndRespond(responseData: any, provider: string, messages: any[], conversation_id: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Log user message if authenticated
    if (user && conversation_id) {
        const lastUserMsg = messages[messages.length - 1];
        if (lastUserMsg.role === 'user') {
            await (supabase.from('ai_messages') as any).insert({
                conversation_id,
                role: 'user',
                content: lastUserMsg.content,
                tokens_used: 0 // We don't strictly track input tokens in this MVP step
            });
        }

        await (supabase.from('ai_messages') as any).insert({
            conversation_id,
            role: 'assistant',
            content: responseData.content,
            tokens_used: responseData.usage.completion_tokens || 0
        });
    }

    return NextResponse.json({
        response: responseData.content,
        provider: provider, // Useful for debug/UI
        usage: responseData.usage
    });
}
