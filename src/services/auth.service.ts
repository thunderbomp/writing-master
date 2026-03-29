import { supabase, isSupabaseEnabled } from '@/lib/supabase'

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  subscription: 'free' | 'monthly' | 'yearly'
  subscriptionExpiresAt: string | null
  aiUsageToday: number
  lastUsageDate: string | null
}

/**
 * 用户注册
 */
export async function signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
  // 如果没有配置 Supabase，返回本地模式错误
  if (!isSupabaseEnabled) {
    return { user: null, error: 'Supabase 未配置，请先配置环境变量或在本地模式下使用' }
  }

  try {
    const { data: authData, error: authError } = await supabase!.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name
        }
      }
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (!authData.user) {
      return { user: null, error: '注册失败' }
    }

    // 等待用户记录创建（触发器会自动创建）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 获取完整的用户信息
    const { data: userData, error: userError } = await supabase!
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return { user: null, error: '获取用户信息失败' }
    }

    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      subscription: userData.subscription,
      subscriptionExpiresAt: userData.subscription_expires_at,
      aiUsageToday: userData.ai_usage_today,
      lastUsageDate: userData.last_usage_date
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : '注册失败' }
  }
}

/**
 * 用户登录
 */
export async function signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
  // 如果没有配置 Supabase，返回本地模式错误
  if (!isSupabaseEnabled) {
    return { user: null, error: 'Supabase 未配置，请先配置环境变量或在本地模式下使用' }
  }

  try {
    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (authError) {
      return { user: null, error: authError.message }
    }

    if (!authData.user) {
      return { user: null, error: '登录失败' }
    }

    // 获取完整的用户信息
    const { data: userData, error: userError } = await supabase!
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return { user: null, error: '获取用户信息失败' }
    }

    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      subscription: userData.subscription,
      subscriptionExpiresAt: userData.subscription_expires_at,
      aiUsageToday: userData.ai_usage_today,
      lastUsageDate: userData.last_usage_date
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : '登录失败' }
  }
}

/**
 * 用户退出登录
 */
export async function signOut(): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled) {
    return { error: null } // 本地模式下无需退出
  }
  try {
    const { error } = await supabase!.auth.signOut()
    return { error: error?.message || null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : '退出登录失败' }
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseEnabled) {
    return null
  }
  try {
    const { data: { user } } = await supabase!.auth.getUser()

    if (!user) {
      return null
    }

    // 获取完整的用户信息
    const { data: userData, error } = await supabase!
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !userData) {
      return null
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      subscription: userData.subscription,
      subscriptionExpiresAt: userData.subscription_expires_at,
      aiUsageToday: userData.ai_usage_today,
      lastUsageDate: userData.last_usage_date
    }
  } catch {
    return null
  }
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseEnabled) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabase!.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = await getCurrentUser()
      callback(user)
    } else {
      callback(null)
    }
  })
}

/**
 * 发送密码重置邮件
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled) {
    return { error: 'Supabase 未配置' }
  }
  try {
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile/reset-password`
    })
    return { error: error?.message || null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : '发送失败' }
  }
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  if (!isSupabaseEnabled) {
    return { error: 'Supabase 未配置' }
  }
  try {
    const { error } = await supabase!.auth.updateUser({
      password: newPassword
    })
    return { error: error?.message || null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : '更新密码失败' }
  }
}
