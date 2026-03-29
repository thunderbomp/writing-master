import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { DatabaseUser, DatabaseOrder, DatabaseDiagnosisRecord, DatabaseUsageRecord, DatabaseFavorite } from '@/lib/supabase'

// ============================================
// 用户数据服务
// ============================================

export async function getUserById(userId: string): Promise<DatabaseUser | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function updateUserSubscription(
  userId: string,
  subscription: 'free' | 'monthly' | 'yearly',
  expiresAt: string | null
): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('users')
      .update({
        subscription,
        subscription_expires_at: expiresAt
      })
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

export async function incrementAIUsage(userId: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    // 先查询当前值，再更新（Supabase JS v2 不支持 .raw()）
    const { data: current } = await supabase!
      .from('users')
      .select('ai_usage_today')
      .eq('id', userId)
      .single()

    const { error } = await supabase!
      .from('users')
      .update({ ai_usage_today: (current?.ai_usage_today || 0) + 1, last_usage_date: new Date().toISOString().split('T')[0] })
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

export async function resetDailyAIUsage(userId: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('users')
      .update({ ai_usage_today: 0 })
      .eq('id', userId)

    return !error
  } catch {
    return false
  }
}

// ============================================
// 订单数据服务
// ============================================

export async function createOrder(order: Omit<DatabaseOrder, 'id' | 'created_at'>): Promise<DatabaseOrder | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function getOrderById(orderId: string): Promise<DatabaseOrder | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function getUserOrders(userId: string): Promise<DatabaseOrder[]> {
  if (!isSupabaseEnabled) return []
  try {
    const { data, error } = await supabase!
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: 'paid' | 'failed',
  tradeOrderId?: string,
  paidAt?: string,
  paymentMethod?: string
): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('orders')
      .update({
        status,
        trade_order_id: tradeOrderId,
        paid_at: paidAt,
        payment_method: paymentMethod
      })
      .eq('order_id', orderId)

    return !error
  } catch {
    return false
  }
}

// ============================================
// 诊断记录服务
// ============================================

export async function createDiagnosisRecord(
  userId: string,
  scores: Omit<DatabaseDiagnosisRecord, 'id' | 'user_id' | 'created_at'>
): Promise<DatabaseDiagnosisRecord | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('diagnosis_records')
      .insert({ user_id: userId, ...scores })
      .select()
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function getUserDiagnosisRecords(userId: string): Promise<DatabaseDiagnosisRecord[]> {
  if (!isSupabaseEnabled) return []
  try {
    const { data, error } = await supabase!
      .from('diagnosis_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function getLatestDiagnosisRecord(userId: string): Promise<DatabaseDiagnosisRecord | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('diagnosis_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

// ============================================
// 使用记录服务
// ============================================

export async function createUsageRecord(
  userId: string,
  itemId: string,
  itemType: string
): Promise<DatabaseUsageRecord | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('usage_records')
      .insert({ user_id: userId, item_id: itemId, item_type: itemType })
      .select()
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function getUserUsageRecords(userId: string, limit: number = 50): Promise<DatabaseUsageRecord[]> {
  if (!isSupabaseEnabled) return []
  try {
    const { data, error } = await supabase!
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// ============================================
// 收藏服务
// ============================================

export async function addFavorite(userId: string, itemId: string): Promise<DatabaseFavorite | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('favorites')
      .insert({ user_id: userId, item_id: itemId })
      .select()
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function removeFavorite(userId: string, itemId: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)

    return !error
  } catch {
    return false
  }
}

export async function getUserFavorites(userId: string): Promise<DatabaseFavorite[]> {
  if (!isSupabaseEnabled) return []
  try {
    const { data, error } = await supabase!
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function isFavorite(userId: string, itemId: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { data, error } = await supabase!
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single()

    if (error || !data) return false
    return true
  } catch {
    return false
  }
}

// ============================================
// 实时订阅服务
// ============================================

export function subscribeToUser(userId: string, callback: (user: DatabaseUser) => void) {
  if (!isSupabaseEnabled) {
    return { unsubscribe: () => {} }
  }
  return supabase!
    .channel(`user:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as DatabaseUser)
        }
      }
    )
    .subscribe()
}

export function subscribeToFavorites(userId: string, callback: (favorites: DatabaseFavorite[]) => void) {
  if (!isSupabaseEnabled) {
    return { unsubscribe: () => {} }
  }
  return supabase!
    .channel(`favorites:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'favorites',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const favorites = await getUserFavorites(userId)
        callback(favorites)
      }
    )
    .subscribe()
}

export function subscribeToOrders(userId: string, callback: (orders: DatabaseOrder[]) => void) {
  if (!isSupabaseEnabled) {
    return { unsubscribe: () => {} }
  }
  return supabase!
    .channel(`orders:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const orders = await getUserOrders(userId)
        callback(orders)
      }
    )
    .subscribe()
}

// ============================================
// 用户统计服务
// ============================================

export async function getUserStats(userId: string) {
  if (!isSupabaseEnabled) return null
  try {
    // 手动查询统计数据
    const [diagnoses, usage, favorites, orders] = await Promise.all([
      supabase!
        .from('diagnosis_records')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase!
        .from('usage_records')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase!
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase!
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
    ])

    return {
      total_diagnoses: diagnoses.count || 0,
      total_usage: usage.count || 0,
      total_favorites: favorites.count || 0,
      total_orders: orders.count || 0
    }
  } catch {
    return null
  }
}
