import { Link } from 'react-router-dom'
import { Zap, BookOpen, Sparkles, Target, TrendingUp, ArrowRight, CheckCircle, Users, Award, Shield, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

const features = [
  {
    icon: Target,
    title: '写作能力诊断',
    description: '九宫格能力自评，精准识别痛点，定制学习路径',
    link: '/diagnosis',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    stats: '9维度评估'
  },
  {
    icon: BookOpen,
    title: '场景模板库',
    description: '5大高频场景模板，邮件/汇报/提案/纪要/公告',
    link: '/templates',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    stats: '50+模板'
  },
  {
    icon: Sparkles,
    title: 'AI写作助手',
    description: '5大Prompt框架，100+模板，效率提升50%-67%',
    link: '/ai-writer',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    stats: '67%提效'
  },
  {
    icon: TrendingUp,
    title: '实战案例库',
    description: '50+错误vs正确对比，快速避坑，提升水平',
    link: '/cases',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    stats: '50+案例'
  }
]

const learningPaths = [
  {
    title: '快速提升路径',
    duration: '1-2周',
    badge: '高效',
    description: '适合急需解决当前写作问题的读者',
    steps: ['写作诊断 → 高频场景模板 → 常见错误修正 → AI辅助入门'],
    highlight: true
  },
  {
    title: '系统学习路径',
    duration: '1-3个月',
    badge: '全面',
    description: '希望全面提升写作能力的读者',
    steps: ['全部章节顺序学习 → 完成实战练习 → 建立知识体系 → AI协作'],
    highlight: false
  },
  {
    title: '实战大师路径',
    duration: '推荐',
    badge: '热门',
    description: '追求极致实战效果和AI提效的读者',
    steps: ['实战案例精选 → AI协作体系 → 进阶Prompt框架 → 建立个人Prompt库'],
    highlight: true
  }
]

const stats = [
  { value: '50+', label: '实战案例', icon: FolderOpen },
  { value: '100+', label: 'AI模板', icon: Sparkles },
  { value: '5', label: '写作场景', icon: BookOpen },
  { value: '67%', label: '效率提升', icon: TrendingUp }
]

const testimonials = [
  {
    name: '张经理',
    role: '市场总监',
    company: '某互联网公司',
    avatar: '👨‍💼',
    content: '通过写作大师的系统学习，我的汇报质量显著提升，方案通过率从40%提升到85%。',
    rating: 5
  },
  {
    name: '李助理',
    role: '行政助理',
    company: '某国企',
    avatar: '👩‍💼',
    content: '模板库太实用了！各种商务场景都有对应模板，写作效率至少提升了一倍。',
    rating: 5
  },
  {
    name: '王总',
    role: '创始人',
    company: '创业公司',
    avatar: '👨‍💻',
    content: 'AI写作助手帮我们团队节省了大量时间，特别是对外商务函件，专业且高效。',
    rating: 5
  }
]

const advantages = [
  {
    icon: Shield,
    title: '系统化方法论',
    description: '基于SCQA、金字塔原理、STAR等经典方法论，构建完整知识体系',
    items: ['SCQA模型', '金字塔原理', 'STAR法则', 'AIDA模型', '5W1H分析']
  },
  {
    icon: Sparkles,
    title: 'AI辅助写作',
    description: '5大Prompt框架，100+模板，实测效率提升50%-67%',
    items: ['RTF框架', 'BRO框架', '场景化Prompt', '智能润色', '一键生成']
  },
  {
    icon: Users,
    title: '实战驱动',
    description: '50+真实案例对比，错误vs正确，快速避坑提升',
    items: ['50+对比案例', '错误解析', '正确示范', '场景覆盖广', '持续更新']
  }
]

const ctaSections = [
  {
    title: '职场新人',
    description: '快速掌握商务写作技巧，自信应对各种工作场景',
    features: ['基础模板库', '写作方法论', '常见错误避坑', 'AI辅助入门'],
    primary: true
  },
  {
    title: '中层管理',
    description: '提升汇报和方案质量，增强职场竞争力',
    features: ['进阶模板库', '高级写作技巧', '案例深度解析', 'AI协作体系'],
    primary: false
  },
  {
    title: '高层领导',
    description: '优化团队写作水平，建立标准化文档体系',
    features: ['团队学习方案', '模板定制服务', '写作评估工具', '企业专属方案'],
    primary: false
  }
]

import { FolderOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 更具冲击力的设计 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
              <Zap className="h-4 w-4" />
              职场商务写作必备神器
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">2026升级版</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                写作大师
              </span>
              <br />
              <span className="text-gray-800">职场商务写作学习平台</span>
            </h1>

            <p className="mb-8 text-lg text-gray-600 md:text-xl leading-relaxed">
              融合传统写作方法论 + 实战技巧 + AI辅助写作
              <br />
              系统化提升职场写作能力，让你的文字更有影响力
            </p>

            {/* Stats Bar */}
            <div className="mb-10 flex flex-wrap justify-center gap-8 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${stat.icon === TrendingUp ? 'bg-purple-100' : stat.icon === Sparkles ? 'bg-pink-100' : 'bg-blue-100'}`}>
                      <Icon className={`h-5 w-5 ${stat.icon === TrendingUp ? 'text-purple-600' : stat.icon === Sparkles ? 'text-pink-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/diagnosis">
                <Button size="lg" className="h-14 gap-2 px-8 text-base shadow-xl shadow-blue-500/30 transition-transform hover:scale-105">
                  <Target className="h-5 w-5" />
                  开始免费诊断
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/templates">
                <Button size="lg" variant="outline" className="h-14 gap-2 px-8 text-base border-2 transition-transform hover:scale-105">
                  <BookOpen className="h-5 w-5" />
                  浏览模板库
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>永久免费</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>无需注册</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>100+模板</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>5大框架</span>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-10 hidden lg:block animate-bounce">
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">效率提升67%</span>
              </div>
            </div>
          </div>
          <div className="absolute top-1/3 right-10 hidden lg:block animate-bounce delay-500">
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">50+实战案例</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - 增强版 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              <Award className="h-4 w-4" />
              核心功能
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">一站式写作能力提升解决方案</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              从诊断到学习，从模板到实战，全方位助力你成为写作高手
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link key={index} to={feature.link}>
                  <Card className="group h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    <CardHeader className="pb-4">
                      <div className={`mb-4 inline-flex ${feature.bgColor} rounded-2xl p-4 transition-transform group-hover:scale-110`}>
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        <Zap className="h-3 w-3" />
                        {feature.stats}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm font-medium text-blue-600 group-hover:gap-3 transition-all">
                        立即体验
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Advantages Section - 新增 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600">
              <Star className="h-4 w-4" />
              为什么选择我们
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">三大核心优势</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              系统化的方法论、智能化的AI辅助、实战化的案例库
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon
              return (
                <Card key={index} className="overflow-hidden border-2 bg-white transition-all hover:shadow-xl">
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 pb-8">
                    <div className="mb-4 inline-flex rounded-2xl bg-white p-4 shadow-lg">
                      <Icon className="h-10 w-10 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">{advantage.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{advantage.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {advantage.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Learning Paths Section - 优化版 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-600">
              <Clock className="h-4 w-4" />
              学习路径
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">选择适合你的学习方式</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              根据你的需求和目标，选择最优学习路径
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {learningPaths.map((path, index) => (
              <Card key={index} className={`relative overflow-hidden transition-all hover:shadow-2xl ${path.highlight ? 'border-2 border-blue-500' : ''}`}>
                {path.highlight && (
                  <div className="absolute right-0 top-0 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white">
                    {path.badge}
                  </div>
                )}
                <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50 pb-8">
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle className="text-2xl">{path.title}</CardTitle>
                    {!path.highlight && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {path.badge}
                      </span>
                    )}
                  </div>
                  <div className="mb-3 text-2xl font-bold text-blue-600">{path.duration}</div>
                  <CardDescription className="text-base">{path.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {path.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {i + 1}
                        </div>
                        <span className="font-medium">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sections - 新增人群导向 */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">为不同角色量身定制</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              无论你是职场新人、中层管理还是高层领导，都有适合你的学习方案
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {ctaSections.map((section, index) => (
              <Card key={index} className={`border-2 bg-white/10 backdrop-blur-sm transition-all hover:scale-105 ${section.primary ? 'border-blue-400' : 'border-white/20'}`}>
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{section.title}</CardTitle>
                  <CardDescription className="text-base text-gray-300">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-2">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-200">
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/diagnosis">
                    <Button className={`w-full ${section.primary ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}>
                      立即开始
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - 新增 */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-600">
              <Users className="h-4 w-4" />
              用户评价
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-900">来自真实用户的反馈</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              已帮助10,000+职场人士提升写作能力
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 bg-white shadow-lg transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-3xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - 增强版 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white shadow-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
              <Sparkles className="h-5 w-5" />
              限时免费
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              准备好提升你的写作能力了吗？
            </h2>
            <p className="mb-8 text-xl text-blue-100">
              立即开始写作诊断，发现你的优势和不足，开启高效学习之旅
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/diagnosis">
                <Button size="lg" className="h-14 gap-2 bg-white text-blue-600 px-8 text-base font-bold shadow-xl transition-transform hover:scale-105 hover:bg-gray-100">
                  <Target className="h-5 w-5" />
                  立即开始诊断
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/templates">
                <Button size="lg" variant="outline" className="h-14 gap-2 px-8 text-base border-2 border-white text-white font-bold transition-transform hover:scale-105 hover:bg-white/10">
                  <BookOpen className="h-5 w-5" />
                  先看看模板
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>永久免费使用</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>50+实战模板</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>AI智能辅助</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
