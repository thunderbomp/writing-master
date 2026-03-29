import { useState } from 'react'
import { FileText, Copy, CheckCircle, XCircle, BookOpen, Search, Filter, Star, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { templates, categories } from '@/data/templates'
import { useStore } from '@/store'

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const { favorites, addFavorite, removeFavorite } = useStore()

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === '全部' || template.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.applicableScenarios.some(scenario =>
        scenario.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesCategory && matchesSearch
  })

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      removeFavorite(id)
    } else {
      addFavorite(id)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-12 md:px-12 md:py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white">
            <FileText className="h-4 w-4" />
            写作模板库
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              5大高频场景模板
            </span>
          </h1>

          <p className="mb-8 text-lg text-gray-600 md:text-xl">
            即学即用，覆盖邮件、汇报、提案、纪要、公告等常见场景
          </p>

          {/* Quick Stats */}
          <div className="mb-8 flex flex-wrap justify-center gap-6 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">{templates.length}</div>
                <div className="text-xs text-gray-500">精选模板</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">100%</div>
                <div className="text-xs text-gray-500">即学即用</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-800">50%+</div>
                <div className="text-xs text-gray-500">效率提升</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索模板名称、描述或场景..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                >
                  <XCircle className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '全部' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('全部')}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                全部 ({templates.length})
              </Button>
              {categories.map((category) => {
                const count = templates.filter(t => t.category === category).length
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="gap-2"
                  >
                    {category} ({count})
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== '全部' || searchQuery) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">当前筛选：</span>
              {selectedCategory !== '全部' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('全部')}
                    className="ml-1 hover:text-blue-900"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-700">
                  搜索: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-purple-900"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory('全部')
                  setSearchQuery('')
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                清除筛选
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          找到 <span className="font-bold text-blue-600">{filteredTemplates.length}</span> 个模板
        </p>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.map((template) => {
          const isFavorite = favorites.includes(template.id)
          return (
            <Card
              key={template.id}
              className={`overflow-hidden transition-all duration-300 ${
                expandedTemplate === template.id
                  ? 'border-2 border-blue-500 shadow-2xl'
                  : 'shadow-lg hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <button
                className="w-full text-left"
                onClick={() => setExpandedTemplate(
                  expandedTemplate === template.id ? null : template.id
                )}
              >
                <CardHeader className={`flex flex-row items-center justify-between transition-colors ${
                  expandedTemplate === template.id ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-muted/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 transition-transform hover:scale-110 ${
                      expandedTemplate === template.id ? 'bg-blue-500' : 'bg-blue-100'
                    }`}>
                      <FileText className={`h-6 w-6 ${
                        expandedTemplate === template.id ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        {isFavorite && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <CardDescription className="text-base">{template.description}</CardDescription>
                    </div>
                  </div>
                  <div className={`h-6 w-6 transition-transform ${
                    expandedTemplate === template.id ? 'rotate-90' : ''
                  }`}>
                    <Copy className="h-6 w-6 text-gray-400" />
                  </div>
                </CardHeader>
              </button>

              {expandedTemplate === template.id && (
                <CardContent className="space-y-8 pt-8">
                  {/* Applicable Scenarios */}
                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 p-6 border-2 border-green-200">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-green-700">
                      <BookOpen className="h-5 w-5" />
                      适用场景
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {template.applicableScenarios.map((scenario) => (
                        <span
                          key={scenario}
                          className="rounded-full bg-green-100 px-4 py-2 font-medium text-green-700 border border-green-200"
                        >
                          {scenario}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Structure */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">模板结构</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(template.structure, `structure-${template.id}`)}
                        className="gap-2 border-2"
                      >
                        {copiedSection === `structure-${template.id}` ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            复制
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 p-6 border-2 border-gray-200">
                      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                        {template.structure}
                      </pre>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">实战案例</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(template.example, `example-${template.id}`)}
                        className="gap-2 border-2"
                      >
                        {copiedSection === `example-${template.id}` ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            复制
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border-2 border-blue-200">
                      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                        {template.example}
                      </pre>
                    </div>
                  </div>

                  {/* AI Prompt */}
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 border-2 border-purple-200">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xl font-bold text-purple-700">
                        <Zap className="h-5 w-5" />
                        AI辅助提示词
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(template.aiPrompt, `prompt-${template.id}`)}
                        className="gap-2 border-2 border-purple-200"
                      >
                        {copiedSection === `prompt-${template.id}` ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            复制
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-white p-4 border-2 border-purple-100">
                      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-700">
                        {template.aiPrompt}
                      </pre>
                    </div>
                  </div>

                  {/* Common Errors */}
                  <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 p-6 border-2 border-red-200">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-red-700">
                      <XCircle className="h-5 w-5" />
                      常见错误
                    </h3>
                    <ul className="space-y-3">
                      {template.commonErrors.map((error, i) => (
                        <li key={i} className="flex items-start gap-3 text-red-700">
                          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-200">
                            <span className="text-xs font-bold">{i + 1}</span>
                          </div>
                          <span className="font-medium">{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 pt-4 border-t-2 border-gray-200 md:flex-row">
                    <Button
                      variant={isFavorite ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => toggleFavorite(template.id)}
                      className={`flex-1 gap-2 border-2 ${
                        isFavorite
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-300'
                          : 'border-gray-300'
                      }`}
                    >
                      {isFavorite ? (
                        <>
                          <Star className="h-5 w-5 fill-white text-white" />
                          已收藏模板
                        </>
                      ) : (
                        <>
                          <Star className="h-5 w-5" />
                          收藏模板
                        </>
                      )}
                    </Button>
                    <Link to="/ai-writer" className="flex-1">
                      <Button
                        size="lg"
                        className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30 transition-transform hover:scale-105"
                      >
                        <Zap className="h-5 w-5" />
                        AI生成内容
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="border-2 border-dashed bg-gradient-to-br from-gray-50 to-blue-50 p-12 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900">未找到匹配的模板</h3>
          <p className="mb-6 text-lg text-gray-600">
            尝试调整搜索关键词或选择其他分类
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <Button
              onClick={() => setSearchQuery('')}
              variant="outline"
              size="lg"
              className="gap-2 border-2"
            >
              <XCircle className="h-5 w-5" />
              清除搜索
            </Button>
            <Button
              onClick={() => {
                setSelectedCategory('全部')
                setSearchQuery('')
              }}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Filter className="h-5 w-5" />
              清除所有筛选
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
