import { useState } from 'react'
import { Target, Star, CheckCircle, ArrowRight, RefreshCw, Zap, TrendingUp, Award, Shield, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useStore } from '@/store'

const abilities = [
  { key: 'imagination', label: '想象力', description: '创意构思和内容创新能力' },
  { key: 'logic', label: '逻辑性', description: '思维逻辑和论证结构能力' },
  { key: 'expression', label: '表达力', description: '文字表达和语言组织能力' },
  { key: 'audienceAwareness', label: '受众意识', description: '读者视角和沟通针对性' },
  { key: 'structuring', title: '结构化能力', description: '内容结构和层次安排能力' },
  { key: 'languageRefinement', label: '语言精炼度', description: '语言简洁和精准表达能力' },
  { key: 'dataUsage', label: '数据运用', description: '数据支撑和量化分析能力' },
  { key: 'emotionalResonance', label: '情感共鸣', description: '情感触达和共鸣能力' },
  { key: 'innovativeThinking', label: '创新思维', description: '独特观点和创新视角能力' }
]

const painPoints = [
  { category: '内容层面', items: ['不知道写什么(缺乏素材积累)', '写不深入(停留在表面)', '缺乏独特观点(人云亦云)'] },
  { category: '结构层面', items: ['逻辑混乱(前后不连贯)', '重点不突出(信息过载)', '结构僵化(千篇一律)'] },
  { category: '表达层面', items: ['语言枯燥(缺乏感染力)', '专业术语滥用(无法打动受众)', '情感缺失(冷冰冰的公文风)'] },
  { category: '效果层面', items: ['阅读完成率低', '转化效果差', '读者反馈不佳'] },
  { category: 'AI使用层面', items: ['不知道如何使用AI辅助', 'AI生成内容空洞', '提示词设计不合理'] }
]

const features = [
  {
    icon: Target,
    title: '九宫格评估',
    description: '9个维度全面评估写作能力',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  {
    icon: Zap,
    title: '智能分析',
    description: 'AI驱动的个性化学习路径',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100'
  },
  {
    icon: TrendingUp,
    title: '追踪进步',
    description: '持续跟踪能力提升情况',
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  }
]

export default function Diagnosis() {
  const { learningPath, setDiagnosisResult } = useStore()
  const [scores, setScores] = useState<Record<string, number>>({
    imagination: 3,
    logic: 3,
    expression: 3,
    audienceAwareness: 3,
    structuring: 3,
    languageRefinement: 3,
    dataUsage: 3,
    emotionalResonance: 3,
    innovativeThinking: 3
  })
  const [selectedPains, setSelectedPains] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const togglePain = (pain: string) => {
    setSelectedPains(prev => 
      prev.includes(pain) 
        ? prev.filter(p => p !== pain)
        : [...prev, pain]
    )
  }

  const handleSubmit = () => {
    setDiagnosisResult(scores as any)
    setShowResult(true)
  }

  const handleReset = () => {
    setScores({
      imagination: 3,
      logic: 3,
      expression: 3,
      audienceAwareness: 3,
      structuring: 3,
      languageRefinement: 3,
      dataUsage: 3,
      emotionalResonance: 3,
      innovativeThinking: 3
    })
    setSelectedPains([])
    setShowResult(false)
  }

  // Calculate radar chart data
  const maxScore = 5
  const chartData = abilities.map(ability => ({
    name: ability.label,
    value: scores[ability.key] || 3,
    fullMark: maxScore
  }))
  void chartData // 用于雷达图数据，待扩展时使用

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
            <Target className="h-4 w-4" />
            写作能力诊断
          </div>
          
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              九宫格能力自评
            </span>
            <br />
            精准识别你的优势与不足
          </h1>
          
          <p className="mb-8 text-lg text-gray-600 md:text-xl">
            通过9个维度的系统评估，发现你的写作能力短板，获得个性化学习路径
          </p>

          {/* Features */}
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="rounded-xl bg-white/80 backdrop-blur-sm p-4 shadow-lg transition-transform hover:scale-105">
                  <div className={`mb-3 inline-flex ${feature.bgColor} rounded-xl p-3`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="mb-1 font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {!showResult ? (
        <>
          {/* Self Assessment */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">能力自评（1-5星）</CardTitle>
                  <CardDescription className="text-base mt-2">
                    请根据你的实际情况为每项能力打分，越接近5星表示越优秀
                  </CardDescription>
                </div>
                <div className="hidden md:block">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-4">
                    <Target className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {abilities.map((ability) => (
                  <div key={ability.key} className="space-y-3 rounded-xl border p-4 transition-all hover:shadow-md hover:border-blue-200">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-900">{ability.label}</label>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                        <Star className="h-3 w-3" />
                        {scores[ability.key]}星
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleScoreChange(ability.key, star)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= scores[ability.key]
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{ability.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pain Points */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">常见痛点勾选</CardTitle>
                  <CardDescription className="text-base mt-2">
                    选择你目前存在的问题（可多选），帮助我们更精准地为你定制学习方案
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {painPoints.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-600">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      {category.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((pain) => (
                        <button
                          key={pain}
                          onClick={() => togglePain(pain)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${
                            selectedPains.includes(pain)
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pain}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 md:flex-row">
            <Button onClick={handleReset} variant="outline" className="h-12 gap-2 px-8 border-2">
              <RefreshCw className="h-5 w-5" />
              重置
            </Button>
            <Button onClick={handleSubmit} size="lg" className="h-12 gap-2 px-8 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30 transition-transform hover:scale-105">
              生成诊断报告
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white">
                <CheckCircle className="h-4 w-4" />
                诊断完成
              </div>
              <h2 className="text-3xl font-bold text-gray-900">你的写作能力分析报告</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Radar Chart */}
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-xl">能力雷达图</CardTitle>
                  <CardDescription>你的九维能力分布</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-xs">
                      <svg viewBox="0 0 200 200" className="w-full h-auto">
                        {/* Background circles */}
                        {[1, 2, 3, 4, 5].map((i) => (
                          <circle
                            key={i}
                            cx="100"
                            cy="100"
                            r={i * 18}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}
                        {/* Axis lines */}
                        {abilities.map((_, i) => {
                          const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2
                          return (
                            <line
                              key={i}
                              x1="100"
                              y1="100"
                              x2={100 + 90 * Math.cos(angle)}
                              y2={100 + 90 * Math.sin(angle)}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          )
                        })}
                        {/* Data polygon */}
                        <polygon
                          points={abilities.map((ability, i) => {
                            const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2
                            const radius = (scores[ability.key] || 3) * 18
                            return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`
                          }).join(' ')}
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                        {/* Labels */}
                        {abilities.map((ability, i) => {
                          const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2
                          const radius = 105
                          const x = 100 + radius * Math.cos(angle)
                          const y = 100 + radius * Math.sin(angle)
                          return (
                            <text
                              key={i}
                              x={x}
                              y={y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-[8px] fill-gray-600 font-medium"
                            >
                              {ability.label}
                            </text>
                          )
                        })}
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Path */}
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-xl">个性化学习路径</CardTitle>
                  </div>
                  <CardDescription>基于你的诊断结果推荐</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {learningPath && (
                      <>
                        <div className="rounded-xl bg-blue-50 p-4 border-2 border-blue-200">
                          <h3 className="mb-3 font-bold text-blue-600 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            短期目标（1-2周）
                          </h3>
                          <ul className="space-y-2">
                            {learningPath.shortTerm.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                <span className="font-medium">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-xl bg-purple-50 p-4 border-2 border-purple-200">
                          <h3 className="mb-3 font-bold text-purple-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            中期目标（1-3个月）
                          </h3>
                          <ul className="space-y-2">
                            {learningPath.mediumTerm.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                <span className="font-medium">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-xl bg-pink-50 p-4 border-2 border-pink-200">
                          <h3 className="mb-3 font-bold text-pink-600 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            长期目标（6个月以上）
                          </h3>
                          <ul className="space-y-2">
                            {learningPath.longTerm.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                                <span className="font-medium">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Pain Points */}
            {selectedPains.length > 0 && (
              <Card className="border-2 border-red-200 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-xl">你选择的问题</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {selectedPains.map((pain) => (
                      <span
                        key={pain}
                        className="rounded-full bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2 text-sm font-medium text-red-700 border-2 border-red-200"
                      >
                        {pain}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 md:flex-row">
              <Button onClick={handleReset} variant="outline" className="h-12 gap-2 px-8 border-2">
                <RefreshCw className="h-5 w-5" />
                重新诊断
              </Button>
              <Link to="/templates">
                <Button size="lg" className="h-12 gap-2 px-8 bg-gradient-to-r from-green-500 to-blue-500 shadow-lg shadow-green-500/30 transition-transform hover:scale-105">
                  <CheckCircle className="h-5 w-5" />
                  开始学习
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
