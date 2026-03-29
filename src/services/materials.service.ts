import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { templates } from '@/data/templates'
import { cases } from '@/data/cases'

// ============ 类型定义 ============

export type ContentType = 'text' | 'audio' | 'video' | 'mixed'
export type UserRole = 'user' | 'editor' | 'admin'

export interface LearningCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  order_index: number
  created_at: string
}

export interface LearningMaterial {
  id: string
  title: string
  description: string | null
  category_id: string
  category_name?: string
  content_type: ContentType

  // 文字内容
  text_content: string | null
  structure: string | null
  example: string | null
  ai_prompt: string | null
  common_errors: string | null
  applicable_scenarios: string | null

  // 音频内容
  audio_url: string | null
  audio_duration: number | null
  audio_transcript: string | null

  // 视频内容
  video_url: string | null
  video_duration: number | null
  video_thumbnail_url: string | null
  video_transcript: string | null

  // 状态
  is_published: boolean
  is_draft: boolean
  view_count: number
  like_count: number

  // 时间戳
  created_at: string
  updated_at: string
  published_at: string | null

  // 创建者信息
  created_by: string
  creator_name?: string
  version: number
}

export interface CreateMaterialData {
  title: string
  description?: string
  category_id: string
  content_type: ContentType
  text_content?: string
  structure?: string
  example?: string
  ai_prompt?: string
  common_errors?: string[]
  applicable_scenarios?: string[]
  audio_url?: string
  audio_duration?: number
  audio_transcript?: string
  video_url?: string
  video_duration?: number
  video_thumbnail_url?: string
  video_transcript?: string
  is_published?: boolean
}

export interface UploadedMedia {
  url: string
  path: string
  duration?: number
}

// ============ 角色管理服务 ============

export async function getUserRole(userId: string): Promise<UserRole> {
  if (!isSupabaseEnabled || !userId) return 'user'
  try {
    const { data, error } = await supabase!
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('role', { ascending: false })

    if (error || !data || data.length === 0) return 'user'
    if (data.some((r: { role: string }) => r.role === 'admin')) return 'admin'
    if (data.some((r: { role: string }) => r.role === 'editor')) return 'editor'
    return 'user'
  } catch {
    return 'user'
  }
}

export async function setUserRole(userId: string, role: UserRole, grantedBy: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('user_roles')
      .upsert({ user_id: userId, role, granted_by: grantedBy })
    return !error
  } catch {
    return false
  }
}

export async function isAdminOrEditor(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'editor'
}

// ============ 分类管理服务 ============

export async function getCategories(): Promise<LearningCategory[]> {
  // 本地模式降级
  if (!isSupabaseEnabled) {
    return [
      { id: 'cat-1', name: '商务邮件', description: '商务邮件写作模板', icon: 'Mail', order_index: 1, created_at: '' },
      { id: 'cat-2', name: '工作汇报', description: '周报、月报等', icon: 'BarChart3', order_index: 2, created_at: '' },
      { id: 'cat-3', name: '方案提案', description: '项目立项、资源申请', icon: 'FileText', order_index: 3, created_at: '' },
      { id: 'cat-4', name: '会议纪要', description: '会议记录', icon: 'Users', order_index: 4, created_at: '' },
      { id: 'cat-5', name: '公告通知', description: '公司公告和政策通知', icon: 'Bell', order_index: 5, created_at: '' },
      { id: 'cat-6', name: 'AI写作', description: 'AI提示词框架', icon: 'Sparkles', order_index: 6, created_at: '' },
    ]
  }
  try {
    const { data, error } = await supabase!
      .from('learning_categories')
      .select('*')
      .order('order_index')
    if (error) throw error
    return data || []
  } catch {
    return []
  }
}

export async function createCategory(
  name: string,
  description: string,
  icon: string,
  userId: string
): Promise<LearningCategory | null> {
  if (!isSupabaseEnabled) return null
  try {
    const { data, error } = await supabase!
      .from('learning_categories')
      .insert({ name, description, icon, created_by: userId })
      .select()
      .single()
    if (error) throw error
    return data
  } catch {
    return null
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Pick<LearningCategory, 'name' | 'description' | 'icon' | 'order_index'>>
): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('learning_categories')
      .update(updates)
      .eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('learning_categories')
      .delete()
      .eq('id', id)
    return !error
  } catch {
    return false
  }
}

// ============ 学习资料服务 ============

/**
 * 将静态数据文件的模板转换为统一格式
 */
function staticDataToMaterial(t: typeof templates[0], catId: string): LearningMaterial {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    category_id: catId,
    category_name: t.category,
    content_type: 'text',
    text_content: t.structure,
    structure: t.structure,
    example: t.example,
    ai_prompt: t.aiPrompt,
    common_errors: JSON.stringify(t.commonErrors),
    applicable_scenarios: JSON.stringify(t.applicableScenarios),
    audio_url: null, audio_duration: null, audio_transcript: null,
    video_url: null, video_duration: null, video_thumbnail_url: null, video_transcript: null,
    is_published: true, is_draft: false,
    view_count: 0, like_count: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), published_at: null,
    created_by: 'system', version: 1
  }
}

export async function getMaterials(filters?: {
  category_id?: string
  content_type?: ContentType
  is_published?: boolean
  search?: string
}): Promise<LearningMaterial[]> {
  // 本地模式降级 - 从静态数据读取
  if (!isSupabaseEnabled) {
    const allMaterials = templates.map(t => staticDataToMaterial(t, `cat-${
      ['商务邮件','工作汇报','方案提案','会议纪要','公告通知'].indexOf(t.category) + 1
    }`))
    if (filters?.search) {
      return allMaterials.filter(m =>
        m.title.includes(filters.search!) || m.description?.includes(filters.search!)
      )
    }
    return allMaterials
  }

  try {
    let query = supabase!
      .from('learning_materials')
      .select(`
        *,
        learning_categories (name)
      `)
      .order('created_at', { ascending: false })

    if (filters?.category_id) query = query.eq('category_id', filters.category_id)
    if (filters?.content_type) query = query.eq('content_type', filters.content_type)
    if (filters?.is_published !== undefined) query = query.eq('is_published', filters.is_published)
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map((item: LearningMaterial & { learning_categories?: { name: string } }) => ({
      ...item,
      category_name: item.learning_categories?.name
    }))
  } catch {
    return []
  }
}

export async function getMaterialById(id: string): Promise<LearningMaterial | null> {
  if (!isSupabaseEnabled) {
    const t = templates.find(t => t.id === id)
    if (!t) return null
    return staticDataToMaterial(t, 'cat-1')
  }
  try {
    const { data, error } = await supabase!
      .from('learning_materials')
      .select(`*, learning_categories(name)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return { ...data, category_name: (data as LearningMaterial & { learning_categories?: { name: string } }).learning_categories?.name }
  } catch {
    return null
  }
}

export async function createMaterial(
  data: CreateMaterialData,
  userId: string
): Promise<LearningMaterial | null> {
  if (!isSupabaseEnabled) return null
  try {
    const payload = {
      ...data,
      common_errors: data.common_errors ? JSON.stringify(data.common_errors) : null,
      applicable_scenarios: data.applicable_scenarios ? JSON.stringify(data.applicable_scenarios) : null,
      created_by: userId,
      updated_by: userId,
      is_draft: !data.is_published,
      published_at: data.is_published ? new Date().toISOString() : null
    }

    const { data: result, error } = await supabase!
      .from('learning_materials')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return result
  } catch {
    return null
  }
}

export async function updateMaterial(
  id: string,
  updates: Partial<CreateMaterialData>,
  userId: string
): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const payload = {
      ...updates,
      common_errors: updates.common_errors ? JSON.stringify(updates.common_errors) : undefined,
      applicable_scenarios: updates.applicable_scenarios ? JSON.stringify(updates.applicable_scenarios) : undefined,
      updated_by: userId,
      published_at: updates.is_published ? new Date().toISOString() : undefined
    }

    const { error } = await supabase!
      .from('learning_materials')
      .update(payload)
      .eq('id', id)

    return !error
  } catch {
    return false
  }
}

export async function deleteMaterial(id: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('learning_materials')
      .delete()
      .eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function publishMaterial(id: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!
      .from('learning_materials')
      .update({ is_published: true, is_draft: false, published_at: new Date().toISOString() })
      .eq('id', id)
    return !error
  } catch {
    return false
  }
}

// ============ 媒体上传服务 ============

export async function uploadMedia(
  file: File,
  type: 'audio' | 'video' | 'image',
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadedMedia | null> {
  if (!isSupabaseEnabled) return null
  try {
    const bucket = type === 'audio' ? 'learning-audio'
      : type === 'video' ? 'learning-video'
      : 'learning-thumbnails'

    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    // 上传文件
    const { data, error } = await supabase!.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // 获取公开URL
    const { data: urlData } = supabase!.storage
      .from(bucket)
      .getPublicUrl(data.path)

    if (onProgress) onProgress(100)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  } catch {
    return null
  }
}

export async function deleteMedia(bucket: string, path: string): Promise<boolean> {
  if (!isSupabaseEnabled) return false
  try {
    const { error } = await supabase!.storage
      .from(bucket)
      .remove([path])
    return !error
  } catch {
    return false
  }
}

// ============ 统计服务 ============

export async function incrementViewCount(materialId: string, userId: string): Promise<void> {
  if (!isSupabaseEnabled) return
  try {
    await supabase!.from('material_interactions').upsert(
      { material_id: materialId, user_id: userId, view_count: 1 },
      { onConflict: 'material_id,user_id', count: 'exact' }
    )
  } catch { /* 忽略错误 */ }
}

export async function getMaterialStats() {
  if (!isSupabaseEnabled) {
    return {
      total: templates.length + cases.length,
      text: templates.length,
      audio: 0,
      video: 0,
      categories: 6
    }
  }
  try {
    const { data } = await supabase!
      .from('learning_materials')
      .select('content_type, is_published')
    if (!data) return { total: 0, text: 0, audio: 0, video: 0, categories: 0 }

    return {
      total: data.length,
      text: data.filter((m: { content_type: string }) => m.content_type === 'text').length,
      audio: data.filter((m: { content_type: string }) => m.content_type === 'audio').length,
      video: data.filter((m: { content_type: string }) => m.content_type === 'video').length,
      categories: 0
    }
  } catch {
    return { total: 0, text: 0, audio: 0, video: 0, categories: 0 }
  }
}
