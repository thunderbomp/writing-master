import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import * as authService from '@/services/auth.service'
import * as dataService from '@/services/data.service'

export interface User {
  id: string
  name: string
  email: string
  subscription: 'free' | 'monthly' | 'yearly'
  subscriptionExpiresAt: string | null
  aiUsageToday: number
  lastUsageDate: string | null
}

interface DiagnosisResult {
  imagination: number
  logic: number
  expression: number
  audienceAwareness: number
  structuring: number
  languageRefinement: number
  dataUsage: number
  emotionalResonance: number
  innovativeThinking: number
}

interface LearningPath {
  shortTerm: string[]
  mediumTerm: string[]
  longTerm: string[]
}

interface AppState {
  user: User | null
  diagnosisResult: DiagnosisResult | null
  learningPath: LearningPath | null
  favorites: string[]
  history: { id: string; type: string; date: string }[]

  // Auth Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  setUser: (user: Partial<User> | null) => void

  // Data Actions
  setDiagnosisResult: (result: DiagnosisResult | null) => void
  setLearningPath: (path: LearningPath | null) => void
  addFavorite: (id: string) => Promise<boolean>
  removeFavorite: (id: string) => Promise<boolean>
  addHistory: (item: { id: string; type: string }) => void
  incrementAiUsage: () => Promise<boolean>
  resetAiUsage: () => Promise<boolean>
  loadFavorites: () => Promise<void>
  loadHistory: () => Promise<void>

  // Real-time Actions
  initializeRealtimeSubscriptions: () => void
  cleanupRealtimeSubscriptions: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      diagnosisResult: null,
      learningPath: null,
      favorites: [],
      history: [],

      // Auth Actions
      signIn: async (email: string, password: string) => {
        const { user, error } = await authService.signIn({ email, password })
        if (error) {
          return { success: false, error }
        }
        set({ user })
        await get().loadFavorites()
        await get().loadHistory()
        return { success: true }
      },

      signUp: async (email: string, password: string, name: string) => {
        const { user, error } = await authService.signUp({ email, password, name })
        if (error) {
          return { success: false, error }
        }
        set({ user })
        return { success: true }
      },

      signOut: async () => {
        const { error } = await authService.signOut()
        if (error) {
          return { success: false, error }
        }
        get().cleanupRealtimeSubscriptions()
        set({ user: null, favorites: [], history: [] })
        return { success: true }
      },

      setUser: (userOrUpdates) => {
        if (userOrUpdates === null) {
          set({ user: null })
          return
        }
        const current = get().user
        if (current) {
          set({ user: { ...current, ...userOrUpdates } })
        } else {
          // 如果没有 current user，直接用传入值（需包含所有必填字段）
          set({ user: userOrUpdates as User })
        }
      },

      // Data Actions
      setDiagnosisResult: async (result) => {
        set({ diagnosisResult: result })

        // Generate learning path based on diagnosis
        const path = result ? generateLearningPath(result) : null
        set({ learningPath: path })

        // Save to Supabase if user is logged in
        const user = get().user
        if (user && result) {
          await dataService.createDiagnosisRecord(user.id, {
            imagination: result.imagination,
            logic: result.logic,
            expression: result.expression,
            audience_awareness: result.audienceAwareness,
            structuring: result.structuring,
            language_refinement: result.languageRefinement,
            data_usage: result.dataUsage,
            emotional_resonance: result.emotionalResonance,
            innovative_thinking: result.innovativeThinking
          })
        }
      },

      setLearningPath: (path) => set({ learningPath: path }),

      addFavorite: async (id: string) => {
        const user = get().user
        if (!user) {
          // 如果未登录，使用本地存储（向后兼容）
          set((state) => ({
            favorites: state.favorites.includes(id)
              ? state.favorites
              : [...state.favorites, id]
          }))
          return true
        }

        // 已登录，同步到 Supabase
        const result = await dataService.addFavorite(user.id, id)
        const success = !!result
        if (success) {
          set((state) => ({
            favorites: state.favorites.includes(id)
              ? state.favorites
              : [...state.favorites, id]
          }))
        }
        return success
      },

      removeFavorite: async (id: string) => {
        const user = get().user
        if (!user) {
          // 如果未登录，使用本地存储（向后兼容）
          set((state) => ({
            favorites: state.favorites.filter(f => f !== id)
          }))
          return true
        }

        // 已登录，同步到 Supabase
        const success = await dataService.removeFavorite(user.id, id)
        if (success) {
          set((state) => ({
            favorites: state.favorites.filter(f => f !== id)
          }))
        }
        return success
      },

      addHistory: async (item: { id: string; type: string }) => {
        const historyItem = { ...item, date: new Date().toISOString() }
        set((state) => ({
          history: [historyItem, ...state.history].slice(0, 50)
        }))

        // Save to Supabase if user is logged in
        const user = get().user
        if (user) {
          await dataService.createUsageRecord(user.id, item.id, item.type)
        }
      },

      incrementAiUsage: async () => {
        const user = get().user
        if (!user) return false

        const today = new Date().toDateString()
        const newUsage = user.lastUsageDate === today
          ? user.aiUsageToday + 1
          : 1

        // Update local state
        set({
          user: {
            ...user,
            aiUsageToday: newUsage,
            lastUsageDate: today
          }
        })

        // Sync to Supabase
        const success = await dataService.incrementAIUsage(user.id)
        return success
      },

      resetAiUsage: async () => {
        const user = get().user
        if (!user) return false

        set({
          user: {
            ...user,
            aiUsageToday: 0,
            lastUsageDate: null
          }
        })

        const success = await dataService.resetDailyAIUsage(user.id)
        return success
      },

      loadFavorites: async () => {
        const user = get().user
        if (!user) return

        const favorites = await dataService.getUserFavorites(user.id)
        set({ favorites: favorites.map(f => f.item_id) })
      },

      loadHistory: async () => {
        const user = get().user
        if (!user) return

        const usageRecords = await dataService.getUserUsageRecords(user.id, 50)
        set({
          history: usageRecords.map(r => ({
            id: r.item_id,
            type: r.item_type,
            date: r.created_at
          }))
        })
      },

      // Real-time Actions
      initializeRealtimeSubscriptions: () => {
        const user = get().user
        if (!user) return

        // Subscribe to user updates
        dataService.subscribeToUser(user.id, (updatedUser) => {
          set({
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              subscription: updatedUser.subscription,
              subscriptionExpiresAt: updatedUser.subscription_expires_at,
              aiUsageToday: updatedUser.ai_usage_today,
              lastUsageDate: updatedUser.last_usage_date
            }
          })
        })

        // Subscribe to favorites updates
        dataService.subscribeToFavorites(user.id, (favorites) => {
          set({ favorites: favorites.map(f => f.item_id) })
        })
      },

      cleanupRealtimeSubscriptions: () => {
        // Unsubscribe from all channels
        const sb = supabase
        if (sb) {
          sb.getChannels().forEach(channel => {
            sb.removeChannel(channel)
          })
        }
      }
    }),
    {
      name: 'writing-master-storage',
      partialize: (state) => ({
        // Only persist these items to localStorage
        diagnosisResult: state.diagnosisResult,
        learningPath: state.learningPath,
        // user, favorites, history are loaded from Supabase
      })
    }
  )
)

function generateLearningPath(result: DiagnosisResult): LearningPath {
  const lowScores: string[] = []
  const mediumScores: string[] = []
  const highScores: string[] = []

  const categories = [
    { key: 'imagination', name: '想象力' },
    { key: 'logic', name: '逻辑性' },
    { key: 'expression', name: '表达力' },
    { key: 'audienceAwareness', name: '受众意识' },
    { key: 'structuring', name: '结构化能力' },
    { key: 'languageRefinement', name: '语言精炼度' },
    { key: 'dataUsage', name: '数据运用' },
    { key: 'emotionalResonance', name: '情感共鸣' },
    { key: 'innovativeThinking', name: '创新思维' }
  ]

  categories.forEach(cat => {
    const score = result[cat.key as keyof DiagnosisResult]
    if (score <= 2) lowScores.push(cat.name)
    else if (score <= 3) mediumScores.push(cat.name)
    else highScores.push(cat.name)
  })

  const shortTerm: string[] = []
  const mediumTerm: string[] = []
  const longTerm: string[] = []

  if (lowScores.length > 0) {
    shortTerm.push(...lowScores.slice(0, 2).map(s => `重点提升${s}`))
    mediumTerm.push(...lowScores.map(s => `系统学习${s}方法`))
  }

  shortTerm.push('掌握1-2个核心写作框架', '学习AI辅助写作基础(RTF框架)')
  mediumTerm.push('建立5个以上写作模板', '熟练使用AI辅助写作工具', '掌握3个Prompt框架')
  longTerm.push('形成个人写作风格', '建立写作作品集', '建立个人Prompt库')

  return { shortTerm, mediumTerm, longTerm }
}

// Initialize auth state on app load
export async function initializeAuth() {
  const user = await authService.getCurrentUser()
  if (user) {
    useStore.setState({ user })
    await useStore.getState().loadFavorites()
    await useStore.getState().loadHistory()
    useStore.getState().initializeRealtimeSubscriptions()
  }
}

// Listen to auth state changes
authService.onAuthStateChange((user) => {
  useStore.setState({ user })
  if (user) {
    useStore.getState().loadFavorites()
    useStore.getState().loadHistory()
    useStore.getState().initializeRealtimeSubscriptions()
  } else {
    useStore.getState().cleanupRealtimeSubscriptions()
  }
})
