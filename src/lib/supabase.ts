import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 检查是否配置了真实的 Supabase 凭证
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'

// 如果没有配置 Supabase，创建一个空的客户端对象
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// 导出是否配置了 Supabase
export const isSupabaseEnabled = isSupabaseConfigured

// 类型定义
export interface DatabaseUser {
  id: string
  name: string
  email: string
  subscription: 'free' | 'monthly' | 'yearly'
  subscription_expires_at: string | null
  ai_usage_today: number
  last_usage_date: string | null
  created_at: string
}

export interface DatabaseOrder {
  id: number
  order_id: string
  user_id: string
  plan_type: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  trade_order_id: string | null
  paid_at: string | null
  payment_method: string | null
  created_at: string
}

export interface DatabaseDiagnosisRecord {
  id: number
  user_id: string
  imagination: number
  logic: number
  expression: number
  audience_awareness: number
  structuring: number
  language_refinement: number
  data_usage: number
  emotional_resonance: number
  innovative_thinking: number
  created_at: string
}

export interface DatabaseUsageRecord {
  id: number
  user_id: string
  item_id: string
  item_type: string
  created_at: string
}

export interface DatabaseFavorite {
  id: number
  user_id: string
  item_id: string
  created_at: string
}
