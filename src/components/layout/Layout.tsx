import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { PenTool, Home, ClipboardCheck, FileText, BookOpen, Sparkles, FolderOpen, User, Crown, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useStore } from '@/store'
import { getUserRole } from '@/services/materials.service'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/diagnosis', label: '写作诊断', icon: ClipboardCheck },
  { path: '/templates', label: '模板库', icon: FileText },
  { path: '/methodology', label: '方法论', icon: BookOpen },
  { path: '/ai-writer', label: 'AI写作', icon: Sparkles },
  { path: '/cases', label: '案例库', icon: FolderOpen },
  { path: '/profile', label: '个人中心', icon: User },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useStore()
  const [userRole, setUserRole] = useState<'user' | 'editor' | 'admin'>('user')
  const [menuOpen, setMenuOpen] = useState(false)

  // 检查用户角色
  useEffect(() => {
    if (user?.id) {
      getUserRole(user.id).then(setUserRole)
    } else {
      setUserRole('user')
    }
  }, [user?.id])

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  const isAdmin = userRole === 'admin' || userRole === 'editor'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <PenTool className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              写作大师
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center space-x-2">
            {/* 管理员入口 */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">管理后台</span>
              </Link>
            )}

            {/* 用户菜单 */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-20 truncate">{user.name || user.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-800 text-sm truncate">{user.name || '用户'}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          userRole === 'admin' ? 'bg-red-100 text-red-700' :
                          userRole === 'editor' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {userRole === 'admin' ? '超级管理员' : userRole === 'editor' ? '内容编辑' : '普通用户'}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" /> 个人中心
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50"
                        >
                          <Settings className="h-4 w-4" /> 管理后台
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                      >
                        <LogOut className="h-4 w-4" /> 退出登录
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/profile"
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </Link>
            )}

            <Link
              to="/subscribe"
              className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-md text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-colors"
            >
              <Crown className="h-4 w-4" />
              <span>会员</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center space-y-1 px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:pb-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <PenTool className="h-6 w-6 text-primary" />
              <span className="font-bold">写作大师</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 写作大师学习平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
