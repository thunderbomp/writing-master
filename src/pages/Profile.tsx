import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Heart, History, Crown, ChevronRight, LogIn, LogOut, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useStore } from '@/store'
import { templates } from '@/data/templates'

type AuthMode = 'login' | 'register'

export default function Profile() {
  const { user, favorites, history, signIn, signUp, signOut } = useStore()
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result: { success: boolean; error?: string }

    if (authMode === 'register') {
      if (!form.name.trim()) { setError('请填写姓名'); setLoading(false); return }
      result = await signUp(form.email, form.password, form.name)
    } else {
      result = await signIn(form.email, form.password)
    }

    setLoading(false)
    if (result.success) {
      setShowAuthForm(false)
      setForm({ name: '', email: '', password: '' })
    } else {
      setError(result.error || '操作失败，请重试')
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const favoriteTemplates = templates.filter(t => favorites.includes(t.id))

  const stats = [
    { label: '收藏模板', value: favorites.length, icon: Heart },
    { label: '使用记录', value: history.length, icon: History }
  ]

  // ── 未登录状态 ──────────────────────────────────────
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold flex items-center justify-center gap-2">
            <User className="h-8 w-8 text-primary" />
            个人中心
          </h1>
          <p className="text-muted-foreground">登录后查看你的学习进度和收藏</p>
        </div>

        {!showAuthForm ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <User className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">请先登录</h2>
              <p className="text-muted-foreground mb-6">
                登录后可保存学习进度、收藏模板、查看AI使用记录
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setAuthMode('login'); setShowAuthForm(true) }} className="gap-2">
                  <LogIn className="h-4 w-4" /> 登录
                </Button>
                <Button variant="outline" onClick={() => { setAuthMode('register'); setShowAuthForm(true) }} className="gap-2">
                  <UserPlus className="h-4 w-4" /> 注册
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex gap-2 border-b pb-3">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${authMode === 'login' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  登录
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${authMode === 'register' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  注册
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">姓名</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="请输入姓名"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1 block">邮箱</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">密码</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="请输入密码（至少6位）"
                    minLength={6}
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowAuthForm(false); setError('') }}>
                    取消
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? '处理中...' : authMode === 'login' ? '登录' : '注册'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ── 已登录状态 ──────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold flex items-center justify-center gap-2">
          <User className="h-8 w-8 text-primary" />
          个人中心
        </h1>
      </div>

      {/* 用户信息卡片 */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/20 p-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-5 w-5" />
                <span className="font-medium">
                  {user.subscription === 'free' ? '免费用户' :
                   user.subscription === 'monthly' ? '月度会员' : '年度会员'}
                </span>
              </div>
              {user.subscription === 'free' && (
                <Link to="/subscribe">
                  <Button size="sm" variant="outline" className="mt-2">升级会员</Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 收藏 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle>我的收藏</CardTitle>
          </div>
          {favoriteTemplates.length > 0 && (
            <Link to="/templates">
              <Button variant="ghost" size="sm">查看全部 <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {favoriteTemplates.length > 0 ? (
            <div className="space-y-2">
              {favoriteTemplates.slice(0, 5).map((template) => (
                <Link key={template.id} to="/templates"
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{template.title}</div>
                    <div className="text-sm text-muted-foreground">{template.category}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="mx-auto h-8 w-8 opacity-50 mb-2" />
              <p>暂无收藏，快去模板库看看吧</p>
              <Link to="/templates"><Button variant="outline" size="sm" className="mt-2">浏览模板</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 历史记录 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>最近使用</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-2">
              {history.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{item.type}</div>
                    <div className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString('zh-CN')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="mx-auto h-8 w-8 opacity-50 mb-2" />
              <p>暂无使用记录</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 退出登录 */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="h-4 w-4" /> 退出登录
        </Button>
      </div>
    </div>
  )
}
