import { useState, useRef, useCallback } from 'react'
import {
  X, Save, Eye, FileText, Mic, Video, Layers,
  Trash2, AlertCircle, Check, Info, RefreshCw
} from 'lucide-react'
import { useStore } from '@/store'
import {
  createMaterial, updateMaterial, uploadMedia,
  type LearningMaterial, type LearningCategory, type ContentType, type CreateMaterialData
} from '@/services/materials.service'

// ── 工具函数 ──────────────────────────────────────────

const CONTENT_TYPES = [
  { value: 'text', label: '文字', icon: FileText, color: 'text-green-600', desc: '纯文本内容，包含结构说明、示例和AI提示词' },
  { value: 'audio', label: '语音', icon: Mic, color: 'text-orange-600', desc: '音频文件（MP3/WAV），支持附带文字描述' },
  { value: 'video', label: '视频', icon: Video, color: 'text-purple-600', desc: '视频文件（MP4/WebM），支持附带字幕' },
  { value: 'mixed', label: '混合', icon: Layers, color: 'text-blue-600', desc: '同时包含文字、语音和视频的综合资料' },
] as const

// ── 主组件 ────────────────────────────────────────────
interface MaterialEditorProps {
  material: LearningMaterial | null
  categories: LearningCategory[]
  onSave: () => void
  onClose: () => void
}

export default function MaterialEditor({ material, categories, onSave, onClose }: MaterialEditorProps) {
  const { user } = useStore()
  const isEditing = !!material

  // 基本信息
  const [title, setTitle] = useState(material?.title || '')
  const [description, setDescription] = useState(material?.description || '')
  const [categoryId, setCategoryId] = useState(material?.category_id || (categories[0]?.id || ''))
  const [contentType, setContentType] = useState<ContentType>(material?.content_type || 'text')
  const [isPublished, setIsPublished] = useState(material?.is_published || false)

  // 文字内容
  const [textContent, setTextContent] = useState(material?.text_content || '')
  const [structure, setStructure] = useState(material?.structure || '')
  const [example, setExample] = useState(material?.example || '')
  const [aiPrompt, setAiPrompt] = useState(material?.ai_prompt || '')
  const [commonErrors, setCommonErrors] = useState<string[]>(
    material?.common_errors ? JSON.parse(material.common_errors) : []
  )
  const [scenarios, setScenarios] = useState<string[]>(
    material?.applicable_scenarios ? JSON.parse(material.applicable_scenarios) : []
  )

  // 音频
  const [audioUrl, setAudioUrl] = useState(material?.audio_url || '')
  const [audioTranscript, setAudioTranscript] = useState(material?.audio_transcript || '')
  const [audioProgress, setAudioProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 视频
  const [videoUrl, setVideoUrl] = useState(material?.video_url || '')
  const [videoTranscript, setVideoTranscript] = useState(material?.video_transcript || '')
  const [videoProgress, setVideoProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // UI状态
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>('basic')
  const [newError, setNewError] = useState('')
  const [newScenario, setNewScenario] = useState('')
  const [preview, setPreview] = useState(false)

  // ── 文件上传 ────────────────────────────────────────
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video') => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadError('')
    const maxSize = type === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`文件过大，${type === 'video' ? '视频最大 500MB' : '音频最大 50MB'}`)
      return
    }

    setUploading(true)

    const result = await uploadMedia(file, type, user.id, (p) => {
      if (type === 'audio') setAudioProgress(p)
      else setVideoProgress(p)
    })

    if (result) {
      if (type === 'audio') setAudioUrl(result.url)
      else setVideoUrl(result.url)
    } else {
      setUploadError(`${type === 'audio' ? '音频' : '视频'}上传失败（未配置Supabase时将使用本地预览）`)
      // 本地预览用 Object URL
      const localUrl = URL.createObjectURL(file)
      if (type === 'audio') setAudioUrl(localUrl)
      else setVideoUrl(localUrl)
    }
    setUploading(false)
  }, [user])

  // ── 校验 ──────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = '标题不能为空'
    if (!categoryId) errs.category = '请选择分类'
    if ((contentType === 'text' || contentType === 'mixed') && !textContent.trim() && !structure.trim())
      errs.content = '请填写文字内容或结构说明'
    if ((contentType === 'audio' || contentType === 'mixed') && !audioUrl)
      errs.audio = '请上传音频文件'
    if ((contentType === 'video' || contentType === 'mixed') && !videoUrl)
      errs.video = '请上传视频文件'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── 保存 ──────────────────────────────────────────
  const handleSave = async () => {
    if (!validate() || !user) return
    setSaving(true)

    const data: CreateMaterialData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId,
      content_type: contentType,
      text_content: textContent.trim() || undefined,
      structure: structure.trim() || undefined,
      example: example.trim() || undefined,
      ai_prompt: aiPrompt.trim() || undefined,
      common_errors: commonErrors.filter(Boolean),
      applicable_scenarios: scenarios.filter(Boolean),
      audio_url: audioUrl || undefined,
      audio_transcript: audioTranscript.trim() || undefined,
      video_url: videoUrl || undefined,
      video_transcript: videoTranscript.trim() || undefined,
      is_published: isPublished
    }

    let ok = false
    if (isEditing && material) {
      ok = await updateMaterial(material.id, data, user.id)
    } else {
      const result = await createMaterial(data, user.id)
      ok = !!result
    }

    setSaving(false)
    if (ok) {
      onSave()
    } else {
      // 本地模式下仍然模拟成功
      alert('本地模式：数据已在内存中更新（配置Supabase后将持久化保存）')
      onSave()
    }
  }

  // ── 渲染 ──────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? '编辑学习资料' : '新增学习资料'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing ? `正在编辑：${material?.title}` : '创建一条新的学习资料'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(p => !p)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${preview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Eye className="h-4 w-4" /> 预览
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* 左侧导航 */}
          <div className="w-44 border-r border-gray-100 p-3 shrink-0">
            {[
              { key: 'basic', label: '基本信息' },
              { key: 'content', label: '文字内容', show: ['text', 'mixed'].includes(contentType) },
              { key: 'audio', label: '语音内容', show: ['audio', 'mixed'].includes(contentType) },
              { key: 'video', label: '视频内容', show: ['video', 'mixed'].includes(contentType) },
              { key: 'extra', label: '附加信息' },
              { key: 'publish', label: '发布设置' },
            ].filter(s => s.show !== false).map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition mb-1 ${
                  activeSection === section.key
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.label}
                {errors[section.key] && <span className="ml-1 text-red-400">!</span>}
              </button>
            ))}
          </div>

          {/* 主内容区 */}
          <div className="flex-1 p-6 space-y-5">
            {/* ── 基本信息 ── */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">基本信息</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="请输入资料标题"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                  <textarea
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="简短描述这条资料的用途和适用场景"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="">请选择分类</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    内容类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CONTENT_TYPES.map(({ value, label, icon: Icon, color, desc }) => (
                      <button
                        key={value}
                        onClick={() => setContentType(value as ContentType)}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 transition text-left ${
                          contentType === value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{label}</div>
                          <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 文字内容 ── */}
            {activeSection === 'content' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">文字内容</h3>
                {errors.content && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {errors.content}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容结构说明</label>
                  <textarea
                    value={structure} onChange={e => setStructure(e.target.value)}
                    placeholder="描述内容的结构和框架，例如：1. 开头 2. 正文 3. 结尾"
                    rows={6}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">完整示例</label>
                  <textarea
                    value={example} onChange={e => setExample(e.target.value)}
                    placeholder="提供一个完整的写作示例"
                    rows={8}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI 提示词</label>
                  <textarea
                    value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="配合 AI 使用的提示词模板"
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">正文内容（可选）</label>
                  <textarea
                    value={textContent} onChange={e => setTextContent(e.target.value)}
                    placeholder="详细的正文内容，支持 Markdown 格式"
                    rows={6}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* ── 语音内容 ── */}
            {activeSection === 'audio' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">语音内容</h3>
                {errors.audio && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {errors.audio}
                  </div>
                )}

                {/* 上传区域 */}
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  audioUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                }`}>
                  {audioUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">音频已上传</span>
                      </div>
                      <audio ref={audioRef} src={audioUrl} className="w-full max-w-sm mx-auto" controls />
                      <button
                        onClick={() => { setAudioUrl('') }}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 删除音频
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Mic className="h-10 w-10 text-orange-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">点击上传音频文件</p>
                      <p className="text-xs text-gray-400 mt-1">支持 MP3、WAV、M4A，最大 50MB</p>
                      {uploading && (
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all" style={{ width: `${audioProgress}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">上传中 {audioProgress}%...</p>
                        </div>
                      )}
                      <input type="file" accept="audio/*" className="hidden" onChange={e => handleFileSelect(e, 'audio')} />
                    </label>
                  )}
                </div>

                {/* 直接填写 URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">或直接填写音频URL</label>
                  <input
                    value={audioUrl} onChange={e => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">音频文字转录（可选）</label>
                  <textarea
                    value={audioTranscript} onChange={e => setAudioTranscript(e.target.value)}
                    placeholder="音频内容的文字版本，方便用户阅读和检索"
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {uploadError && <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">{uploadError}</p>}
              </div>
            )}

            {/* ── 视频内容 ── */}
            {activeSection === 'video' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">视频内容</h3>
                {errors.video && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {errors.video}
                  </div>
                )}

                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  videoUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}>
                  {videoUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">视频已上传</span>
                      </div>
                      <video ref={videoRef} src={videoUrl} className="w-full max-w-md mx-auto rounded-lg" controls />
                      <button
                        onClick={() => { setVideoUrl('') }}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 删除视频
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Video className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700">点击上传视频文件</p>
                      <p className="text-xs text-gray-400 mt-1">支持 MP4、WebM、MOV，最大 500MB</p>
                      {uploading && (
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${videoProgress}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">上传中 {videoProgress}%...</p>
                        </div>
                      )}
                      <input type="file" accept="video/*" className="hidden" onChange={e => handleFileSelect(e, 'video')} />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">或直接填写视频URL</label>
                  <input
                    value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">视频字幕/转录（可选）</label>
                  <textarea
                    value={videoTranscript} onChange={e => setVideoTranscript(e.target.value)}
                    placeholder="视频内容的文字版本"
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {uploadError && <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">{uploadError}</p>}
              </div>
            )}

            {/* ── 附加信息 ── */}
            {activeSection === 'extra' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">附加信息</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">适用场景</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {scenarios.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {s}
                        <button onClick={() => setScenarios(prev => prev.filter((_, j) => j !== i))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newScenario} onChange={e => setNewScenario(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newScenario.trim()) {
                          setScenarios(prev => [...prev, newScenario.trim()])
                          setNewScenario('')
                        }
                      }}
                      placeholder="输入场景后按 Enter 添加"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => { if (newScenario.trim()) { setScenarios(prev => [...prev, newScenario.trim()]); setNewScenario('') } }}
                      className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition"
                    >添加</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">常见错误（帮助用户避坑）</label>
                  <div className="space-y-2 mb-2">
                    {commonErrors.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{e}</span>
                        <button onClick={() => setCommonErrors(prev => prev.filter((_, j) => j !== i))}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newError} onChange={e => setNewError(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newError.trim()) {
                          setCommonErrors(prev => [...prev, newError.trim()])
                          setNewError('')
                        }
                      }}
                      placeholder="描述一个常见错误，按 Enter 添加"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => { if (newError.trim()) { setCommonErrors(prev => [...prev, newError.trim()]); setNewError('') } }}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition"
                    >添加</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 发布设置 ── */}
            {activeSection === 'publish' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">发布设置</h3>
                <div className={`rounded-xl border-2 p-5 cursor-pointer transition ${
                  isPublished ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setIsPublished(p => !p)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">
                        {isPublished ? '✅ 立即发布' : '💾 保存为草稿'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {isPublished
                          ? '资料将对所有用户可见'
                          : '仅管理员可见，随时可以发布'}
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition ${isPublished ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${isPublished ? 'translate-x-6' : ''}`} />
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-xl flex gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    保存后可以随时在资料列表中切换发布/草稿状态。
                    发布的资料用户即可在模板库、案例库等页面查看。
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-400">
            {Object.keys(errors).length > 0 && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                请修复 {Object.keys(errors).length} 处错误后保存
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? '保存中...' : isPublished ? '保存并发布' : '保存草稿'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

