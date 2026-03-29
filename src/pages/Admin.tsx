import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  FileText, Mic, Video, BookOpen, BarChart3, Settings,
  Check, X, RefreshCw,
  Layers, Tag
} from 'lucide-react'
import { useStore } from '@/store'
import {
  getMaterials, getCategories, deleteMaterial, publishMaterial,
  getMaterialStats, getUserRole,
  type LearningMaterial, type LearningCategory, type UserRole, type ContentType
} from '@/services/materials.service'
import MaterialEditor from '@/components/admin/MaterialEditor'

// ── 工具函数 ──────────────────────────────────────────
const contentTypeIcon = (type: ContentType) => {
  switch (type) {
    case 'audio': return <Mic className="h-4 w-4 text-orange-500" />
    case 'video': return <Video className="h-4 w-4 text-purple-500" />
    case 'mixed': return <Layers className="h-4 w-4 text-blue-500" />
    default: return <FileText className="h-4 w-4 text-green-500" />
  }
}
const contentTypeLabel = (type: ContentType) =>
  ({ text: '文字', audio: '语音', video: '视频', mixed: '混合' }[type])

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// ── 组件 ─────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate()
  const { user } = useStore()

  const [role, setRole] = useState<UserRole>('user')
  const [materials, setMaterials] = useState<LearningMaterial[]>([])
  const [categories, setCategories] = useState<LearningCategory[]>([])
  const [stats, setStats] = useState({ total: 0, text: 0, audio: 0, video: 0, categories: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState<ContentType | ''>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [activeTab, setActiveTab] = useState<'materials' | 'categories' | 'stats'>('materials')

  // 编辑器状态
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null)

  // 批量选择
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // 权限检查
  useEffect(() => {
    if (!user) { navigate('/profile'); return }
    getUserRole(user.id).then(r => {
      setRole(r)
      if (r === 'user') navigate('/')
    })
  }, [user, navigate])

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true)
    const [mats, cats, s] = await Promise.all([
      getMaterials({
        category_id: filterCategory || undefined,
        content_type: filterType || undefined,
        is_published: filterStatus === 'all' ? undefined : filterStatus === 'published',
        search: searchQuery || undefined
      }),
      getCategories(),
      getMaterialStats()
    ])
    setMaterials(mats)
    setCategories(cats)
    setStats({ ...s, categories: cats.length })
    setLoading(false)
  }, [filterCategory, filterType, filterStatus, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  // 删除
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) return
    const ok = await deleteMaterial(id)
    if (ok) { setMaterials(prev => prev.filter(m => m.id !== id)); setSelected(s => { s.delete(id); return new Set(s) }) }
    else alert('删除失败，请重试')
  }

  // 切换发布状态
  const handleTogglePublish = async (m: LearningMaterial) => {
    const ok = await publishMaterial(m.id)
    if (ok) setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, is_published: !x.is_published } : x))
  }

  // 新建 / 编辑完成回调
  const handleEditorSave = () => { setEditorOpen(false); setEditingMaterial(null); loadData() }

  const openEditor = (material?: LearningMaterial) => {
    setEditingMaterial(material || null)
    setEditorOpen(true)
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const filteredMaterials = materials.filter(m => {
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(m.description || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (role === 'user') return null // 等待跳转

  // ── 渲染 ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-lg p-1.5">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">学习资料管理后台</h1>
              <p className="text-xs text-gray-500">
                {role === 'admin' ? '超级管理员' : '内容编辑'} · {user?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => openEditor()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
            >
              <Plus className="h-4 w-4" /> 新增资料
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="max-w-7xl mx-auto px-4 flex gap-0 border-t border-gray-100">
          {[
            { key: 'materials', label: '资料管理', icon: BookOpen },
            { key: 'categories', label: '分类管理', icon: Tag },
            { key: 'stats', label: '数据统计', icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── 统计卡片 ── */}
        {activeTab === 'stats' && (
          <StatsPanel stats={stats} materials={materials} categories={categories} />
        )}

        {/* ── 分类管理 ── */}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            user={user}
            onRefresh={loadData}
          />
        )}

        {/* ── 资料管理 ── */}
        {activeTab === 'materials' && (
          <>
            {/* 统计条 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: '全部资料', value: stats.total, color: 'bg-blue-50 text-blue-700' },
                { label: '文字资料', value: stats.text, color: 'bg-green-50 text-green-700', icon: <FileText className="h-4 w-4" /> },
                { label: '语音资料', value: stats.audio, color: 'bg-orange-50 text-orange-700', icon: <Mic className="h-4 w-4" /> },
                { label: '视频资料', value: stats.video, color: 'bg-purple-50 text-purple-700', icon: <Video className="h-4 w-4" /> },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.icon}
                  </div>
                  <div className="text-2xl font-bold mt-1">{item.value}</div>
                </div>
              ))}
            </div>

            {/* 搜索 & 筛选 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜索标题、描述..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">全部分类</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as ContentType | '')}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">全部类型</option>
                    <option value="text">文字</option>
                    <option value="audio">语音</option>
                    <option value="video">视频</option>
                    <option value="mixed">混合</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">全部状态</option>
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                  </select>
                </div>
              </div>
              {selected.size > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  已选择 {selected.size} 条
                  <button onClick={() => setSelected(new Set())} className="ml-auto text-gray-500 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 资料列表 */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin" />
                加载中...
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">暂无学习资料</p>
                <button onClick={() => openEditor()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                  + 新增第一条资料
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="w-8 px-4 py-3">
                        <input type="checkbox"
                          onChange={e => setSelected(e.target.checked ? new Set(filteredMaterials.map(m => m.id)) : new Set())}
                          checked={selected.size === filteredMaterials.length && filteredMaterials.length > 0}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">标题 / 描述</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-24">分类</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">类型</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-20">状态</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-32">更新时间</th>
                      <th className="text-right px-4 py-3 text-gray-600 font-medium w-28">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMaterials.map(m => (
                      <tr key={m.id} className={`hover:bg-gray-50 transition ${selected.has(m.id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 truncate max-w-xs">{m.title}</div>
                          {m.description && (
                            <div className="text-gray-400 text-xs truncate max-w-xs mt-0.5">{m.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {m.category_name || categories.find(c => c.id === m.category_id)?.name || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {contentTypeIcon(m.content_type)}
                            <span className="text-gray-600">{contentTypeLabel(m.content_type)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            m.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {m.is_published ? '已发布' : '草稿'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {formatDate(m.updated_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleTogglePublish(m)}
                              className={`p-1.5 rounded-lg transition ${
                                m.is_published ? 'hover:bg-yellow-100 text-yellow-600' : 'hover:bg-green-100 text-green-600'
                              }`}
                              title={m.is_published ? '撤销发布' : '发布'}
                            >
                              {m.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => openEditor(m)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition"
                              title="编辑"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.title)}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                  共 {filteredMaterials.length} 条资料
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 编辑器弹窗 */}
      {editorOpen && (
        <MaterialEditor
          material={editingMaterial}
          categories={categories}
          onSave={handleEditorSave}
          onClose={() => { setEditorOpen(false); setEditingMaterial(null) }}
        />
      )}
    </div>
  )
}

// ── 统计面板子组件 ─────────────────────────────────────
function StatsPanel({ stats, materials, categories }: {
  stats: { total: number; text: number; audio: number; video: number; categories: number }
  materials: LearningMaterial[]
  categories: LearningCategory[]
}) {
  const published = materials.filter(m => m.is_published).length
  const draft = materials.length - published

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '全部资料', value: stats.total, sub: '条学习资料', color: 'from-blue-500 to-blue-700' },
          { label: '已发布', value: published, sub: '对外可见', color: 'from-green-500 to-green-700' },
          { label: '草稿', value: draft, sub: '待发布', color: 'from-yellow-500 to-yellow-600' },
          { label: '资料分类', value: stats.categories, sub: '个分类', color: 'from-purple-500 to-purple-700' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl text-white bg-gradient-to-br ${item.color} p-5`}>
            <div className="text-3xl font-bold">{item.value}</div>
            <div className="text-sm opacity-90 mt-1">{item.label}</div>
            <div className="text-xs opacity-70">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">按内容类型分布</h3>
          {[
            { label: '文字资料', value: stats.text, total: stats.total, color: 'bg-green-500' },
            { label: '语音资料', value: stats.audio, total: stats.total, color: 'bg-orange-500' },
            { label: '视频资料', value: stats.video, total: stats.total, color: 'bg-purple-500' },
          ].map(item => (
            <div key={item.label} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all`}
                  style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">按分类分布</h3>
          {categories.map(cat => {
            const count = materials.filter(m => m.category_id === cat.id).length
            return (
              <div key={cat.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{cat.name}</span>
                <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── 分类管理子组件 ─────────────────────────────────────
import { createCategory, updateCategory, deleteCategory } from '@/services/materials.service'

function CategoryManager({ categories, user, onRefresh }: {
  categories: LearningCategory[]
  user: { id: string; name: string; subscription: string; aiUsageToday: number; lastUsageDate: string | null } | null
  onRefresh: () => void
}) {
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIcon, setNewIcon] = useState('BookOpen')
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const icons = ['BookOpen', 'Mail', 'FileText', 'Users', 'Bell', 'Sparkles', 'BarChart3', 'Layers', 'Tag', 'Video', 'Mic']

  const handleCreate = async () => {
    if (!newName.trim() || !user) return
    await createCategory(newName.trim(), newDesc.trim(), newIcon, user.id)
    setNewName(''); setNewDesc(''); setNewIcon('BookOpen')
    onRefresh()
  }

  const handleUpdate = async (id: string) => {
    await updateCategory(id, { name: editName })
    setEditing(null)
    onRefresh()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`删除分类「${name}」？该分类下的资料不会被删除。`)) return
    await deleteCategory(id)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      {/* 新增分类 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-600" /> 新增分类
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="分类名称（必填）"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="分类描述（可选）"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={newIcon} onChange={e => setNewIcon(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {icons.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
          >
            确认添加
          </button>
        </div>
      </div>

      {/* 分类列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
          当前分类（{categories.length}）
        </div>
        <div className="divide-y divide-gray-100">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="px-5 py-3 flex items-center gap-3">
              <span className="text-gray-400 text-sm w-5">{idx + 1}</span>
              {editing === cat.id ? (
                <input
                  value={editName} onChange={e => setEditName(e.target.value)}
                  className="flex-1 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-gray-800 font-medium">{cat.name}</span>
              )}
              <span className="text-xs text-gray-400 hidden sm:inline">{cat.description}</span>
              <div className="flex items-center gap-1">
                {editing === cat.id ? (
                  <>
                    <button onClick={() => handleUpdate(cat.id)} className="p-1.5 rounded hover:bg-green-100 text-green-600"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditing(cat.id); setEditName(cat.name) }} className="p-1.5 rounded hover:bg-blue-100 text-blue-600"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded hover:bg-red-100 text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
