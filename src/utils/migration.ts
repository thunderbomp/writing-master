/**
 * 数据迁移脚本：从 localStorage 迁移到 Supabase
 *
 * 使用方法：
 * - 在浏览器控制台运行：migrateToSupabase()
 * - 或在组件中引入：import { migrateToSupabase } from '@/utils/migration'
 */

import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import * as authService from '@/services/auth.service'

interface LocalStorageData {
  user: {
    name: string
    email: string
    subscription: 'free' | 'monthly' | 'yearly'
    aiUsageToday: number
    lastUsageDate: string
  } | null
  diagnosisResult: {
    imagination: number
    logic: number
    expression: number
    audienceAwareness: number
    structuring: number
    languageRefinement: number
    dataUsage: number
    emotionalResonance: number
    innovativeThinking: number
  } | null
  favorites: string[]
  history: { id: string; type: string; date: string }[]
}

function getLocalStorageData(): LocalStorageData | null {
  try {
    const data = localStorage.getItem('writing-master-storage')
    if (!data) return null
    const parsed = JSON.parse(data)
    return {
      user: parsed.state?.user || null,
      diagnosisResult: parsed.state?.diagnosisResult || null,
      favorites: parsed.state?.favorites || [],
      history: parsed.state?.history || []
    }
  } catch {
    return null
  }
}

async function migrateUser(localUser: LocalStorageData['user'], userId: string): Promise<boolean> {
  if (!localUser || !supabase) return true
  try {
    const { error } = await supabase
      .from('users')
      .update({ subscription: localUser.subscription, ai_usage_today: localUser.aiUsageToday, last_usage_date: localUser.lastUsageDate || null })
      .eq('id', userId)
    if (error) { console.error('迁移用户数据失败:', error); return false }
    console.log('✅ 用户数据迁移成功')
    return true
  } catch { return false }
}

async function migrateDiagnosis(localDiagnosis: LocalStorageData['diagnosisResult'], userId: string): Promise<boolean> {
  if (!localDiagnosis) { console.log('⏭️ 无诊断记录，跳过'); return true }
  if (!supabase) return false
  try {
    const { error } = await supabase.from('diagnosis_records').insert({
      user_id: userId,
      imagination: localDiagnosis.imagination,
      logic: localDiagnosis.logic,
      expression: localDiagnosis.expression,
      audience_awareness: localDiagnosis.audienceAwareness,
      structuring: localDiagnosis.structuring,
      language_refinement: localDiagnosis.languageRefinement,
      data_usage: localDiagnosis.dataUsage,
      emotional_resonance: localDiagnosis.emotionalResonance,
      innovative_thinking: localDiagnosis.innovativeThinking
    })
    if (error) { console.error('迁移诊断记录失败:', error); return false }
    console.log('✅ 诊断记录迁移成功')
    return true
  } catch { return false }
}

async function migrateFavorites(localFavorites: string[], userId: string): Promise<boolean> {
  if (!localFavorites.length) { console.log('⏭️ 无收藏数据，跳过'); return true }
  if (!supabase) return false
  try {
    const { error } = await supabase.from('favorites').insert(
      localFavorites.map(itemId => ({ user_id: userId, item_id: itemId }))
    )
    if (error) { console.error('迁移收藏失败:', error); return false }
    console.log(`✅ 收藏迁移成功（${localFavorites.length} 项）`)
    return true
  } catch { return false }
}

async function migrateHistory(localHistory: LocalStorageData['history'], userId: string): Promise<boolean> {
  if (!localHistory.length) { console.log('⏭️ 无使用记录，跳过'); return true }
  if (!supabase) return false
  try {
    const { error } = await supabase.from('usage_records').insert(
      localHistory.map(item => ({ user_id: userId, item_id: item.id, item_type: item.type, created_at: item.date }))
    )
    if (error) { console.error('迁移使用记录失败:', error); return false }
    console.log(`✅ 使用记录迁移成功（${localHistory.length} 条）`)
    return true
  } catch { return false }
}

/**
 * 主迁移函数：将 localStorage 数据迁移到 Supabase
 */
export async function migrateToSupabase(): Promise<{ success: boolean; message: string; backupKey: string }> {
  console.log('🚀 开始数据迁移...')

  if (!isSupabaseEnabled) {
    return { success: false, message: '未配置 Supabase，请先配置 .env 中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY', backupKey: '' }
  }

  const currentUser = await authService.getCurrentUser()
  if (!currentUser) {
    return { success: false, message: '请先登录再进行数据迁移', backupKey: '' }
  }

  const localData = getLocalStorageData()
  if (!localData) {
    return { success: false, message: '没有找到 localStorage 数据', backupKey: '' }
  }

  // 备份
  const backupKey = `writing-master-storage-backup-${Date.now()}`
  const rawData = localStorage.getItem('writing-master-storage')
  if (rawData) localStorage.setItem(backupKey, rawData)

  console.log(`📋 开始迁移：用户 ${currentUser.email} (${currentUser.id})`)
  console.log(`  收藏：${localData.favorites.length} 项，历史：${localData.history.length} 条`)

  const results = await Promise.all([
    migrateUser(localData.user, currentUser.id),
    migrateDiagnosis(localData.diagnosisResult, currentUser.id),
    migrateFavorites(localData.favorites, currentUser.id),
    migrateHistory(localData.history, currentUser.id),
  ])

  const successCount = results.filter(Boolean).length
  const failCount = results.length - successCount

  if (failCount === 0) {
    console.log(`🎉 迁移完成！${successCount}/${results.length} 项成功，备份键：${backupKey}`)
    return { success: true, message: `迁移成功！${successCount}/${results.length} 项`, backupKey }
  } else {
    return { success: false, message: `迁移部分失败：成功 ${successCount}，失败 ${failCount}`, backupKey }
  }
}

/**
 * 检查迁移状态
 */
export async function getMigrationStatus(): Promise<{ hasLocalData: boolean; hasSupabaseUser: boolean; recommendations: string[] }> {
  const localData = getLocalStorageData()
  const currentUser = await authService.getCurrentUser()

  const hasLocalData = !!(localData && (localData.user || localData.diagnosisResult || localData.favorites.length || localData.history.length))
  const hasSupabaseUser = !!currentUser
  const recommendations: string[] = []

  if (hasLocalData && !hasSupabaseUser) {
    recommendations.push('请先登录 Supabase 账户，然后运行 migrateToSupabase()')
  } else if (hasLocalData && hasSupabaseUser) {
    recommendations.push('可以运行 migrateToSupabase() 迁移数据到 Supabase')
  } else if (!hasLocalData && hasSupabaseUser) {
    recommendations.push('已使用 Supabase，无需迁移')
  } else {
    recommendations.push('请先使用系统产生一些数据再迁移')
  }

  return { hasLocalData, hasSupabaseUser, recommendations }
}

// 挂载到 window，方便浏览器控制台调用
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).migrateToSupabase = migrateToSupabase
  ;(window as unknown as Record<string, unknown>).getMigrationStatus = getMigrationStatus
}
