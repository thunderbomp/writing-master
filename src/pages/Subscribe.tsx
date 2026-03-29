import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Crown, Check, X, Sparkles, ArrowLeft, CreditCard, Smartphone, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useStore } from '@/store'
import { createPaymentOrder, testPaymentService } from '@/utils/api'

const plans = [
  {
    name: '免费版',
    price: '¥0',
    period: '永久',
    description: '适合体验基础功能',
    subscription: 'free' as const,
    features: [
      { text: '写作能力诊断', included: true },
      { text: '基础模板（3个场景）', included: true },
      { text: 'AI写作助手', included: true, note: '5次/天' },
      { text: '全部5大场景模板', included: false },
      { text: '方法论课程', included: false },
      { text: '100+Prompt模板', included: false },
      { text: '50+实战案例', included: false },
      { text: '个人模板收藏', included: false }
    ]
  },
  {
    name: '月度会员',
    price: '¥29',
    period: '/月',
    description: '适合短期学习提升',
    subscription: 'monthly' as const,
    popular: true,
    features: [
      { text: '写作能力诊断', included: true },
      { text: '基础模板（3个场景）', included: true },
      { text: 'AI写作助手', included: true, note: '50次/天' },
      { text: '全部5大场景模板', included: true },
      { text: '方法论课程', included: true },
      { text: '100+Prompt模板', included: true },
      { text: '50+实战案例', included: true },
      { text: '个人模板收藏', included: true }
    ]
  },
  {
    name: '年度会员',
    price: '¥299',
    period: '/年',
    description: '最划算，长期学习首选',
    subscription: 'yearly' as const,
    features: [
      { text: '写作能力诊断', included: true },
      { text: '基础模板（3个场景）', included: true },
      { text: 'AI写作助手', included: true, note: '无限次' },
      { text: '全部5大场景模板', included: true },
      { text: '方法论课程', included: true },
      { text: '100+Prompt模板', included: true },
      { text: '50+实战案例', included: true },
      { text: '个人模板收藏', included: true },
      { text: '专属客服', included: true },
      { text: '优先体验新功能', included: true }
    ]
  }
]

export default function Subscribe() {
  const { user, setUser } = useStore()
  const [selectedPayment, setSelectedPayment] = useState<'wechat' | 'alipay'>('wechat')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isPaymentServiceAvailable, setIsPaymentServiceAvailable] = useState(false)
  const [isCheckingService, setIsCheckingService] = useState(true)
  const [searchParams] = useSearchParams()

  // 检查支付服务是否可用
  useEffect(() => {
    const checkService = async () => {
      try {
        const result = await testPaymentService()
        setIsPaymentServiceAvailable(result.success)
      } catch (error) {
        console.error('支付服务不可用:', error)
        setIsPaymentServiceAvailable(false)
      } finally {
        setIsCheckingService(false)
      }
    }
    checkService()
  }, [])

  // 检查支付成功回调
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true' && user) {
      const planType = localStorage.getItem('pending_plan_type') as 'monthly' | 'yearly' | null
      if (planType && planType !== 'free') {
        // 仅更新 subscription 字段
        setUser({ subscription: planType })
        localStorage.removeItem('pending_plan_type')
        alert('支付成功！您已成功升级会员')
      }
    }
  }, [searchParams, user, setUser])

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      // 未登录，跳转到个人中心
      window.location.href = '/profile'
      return
    }

    if (plan.subscription === 'free') {
      return // 免费版无需支付
    }

    // 检查支付服务
    if (!isPaymentServiceAvailable) {
      setPaymentError('支付服务不可用，请检查后端服务是否启动')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // 保存待支付的订阅类型（用于支付成功后更新）
      localStorage.setItem('pending_plan_type', plan.subscription)

      // 创建支付订单
      const result = await createPaymentOrder({
        planType: plan.subscription,
        paymentMethod: selectedPayment,
        userId: user.email || user.name,
        userEmail: user.email
      })

      if (result.success) {
        // 跳转到支付页面
        window.location.href = result.data.paymentUrl
      } else {
        throw new Error('创建订单失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      setPaymentError('创建支付订单失败，请重试')
      setIsProcessing(false)
    }
  }

  const handleSubscribeDemo = async (plan: typeof plans[0]) => {
    if (!user) {
      window.location.href = '/profile'
      return
    }

    setIsProcessing(true)

    // 模拟支付流程
    await new Promise(resolve => setTimeout(resolve, 1500))

    setUser({
      ...user,
      subscription: plan.subscription,
      aiUsageToday: 0,
      lastUsageDate: ''
    })

    setIsProcessing(false)
    alert(`恭喜！您已成功订阅${plan.name}（演示模式）`)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回首页
        </Link>
        <h1 className="mb-2 text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-amber-500" />
          会员订阅
        </h1>
        <p className="text-muted-foreground">解锁全部功能，加速写作能力提升</p>
      </div>

      {/* 支付服务状态提示 */}
      {isCheckingService ? (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm">正在检查支付服务...</span>
          </CardContent>
        </Card>
      ) : !isPaymentServiceAvailable ? (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span className="text-sm">
              支付服务不可用。请启动后端服务：进入 payment-backend 目录，运行 <code className="bg-white px-2 py-1 rounded">npm install && npm run dev</code>
            </span>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm">支付服务正常运行</span>
          </CardContent>
        </Card>
      )}

      {/* 支付方式选择 */}
      {isPaymentServiceAvailable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              选择支付方式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPayment === 'wechat'
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPayment('wechat')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-medium block">微信支付</span>
                    <span className="text-xs text-muted-foreground">推荐使用</span>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPayment === 'alipay'
                    ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPayment('alipay')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="font-medium block">支付宝</span>
                    <span className="text-xs text-muted-foreground">快捷支付</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {paymentError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600">{paymentError}</span>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      {user && user.subscription !== 'free' && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-medium">当前订阅：{
                  user.subscription === 'monthly' ? '月度会员' : '年度会员'
                }</span>
              </div>
              <span className="text-sm text-muted-foreground">
                感谢您的支持！
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden ${
              plan.popular
                ? 'border-primary ring-2 ring-primary'
                : ''
            } ${user?.subscription === plan.subscription ? 'bg-muted/50' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-white text-xs px-3 py-1 rounded-bl-lg">
                  最受欢迎
                </div>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                      {feature.note && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({feature.note})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {isPaymentServiceAvailable ? (
                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={
                    isProcessing ||
                    (user?.subscription === plan.subscription) ||
                    (plan.subscription === 'free')
                  }
                >
                  {isProcessing ? (
                    '处理中...'
                  ) : user?.subscription === plan.subscription ? (
                    '当前方案'
                  ) : plan.subscription === 'free' ? (
                    '当前免费'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {selectedPayment === 'wechat' ? '微信支付' : '支付宝'}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribeDemo(plan)}
                  disabled={
                    isProcessing ||
                    (user?.subscription === plan.subscription) ||
                    (plan.subscription === 'free')
                  }
                >
                  {isProcessing ? (
                    '处理中...'
                  ) : user?.subscription === plan.subscription ? (
                    '当前方案'
                  ) : plan.subscription === 'free' ? (
                    '当前免费'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      演示模式
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>常见问题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Q: 订阅后可以取消吗？</h3>
            <p className="text-sm text-muted-foreground">
              可以随时取消，月度会员取消后仍可使用至月末，年度会员可使用至到期日。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Q: AI写作助手是如何计费的？</h3>
            <p className="text-sm text-muted-foreground">
              免费用户每天5次，月度会员每天50次，年度会员无限次使用。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Q: 支持哪些支付方式？</h3>
            <p className="text-sm text-muted-foreground">
              支持微信支付和支付宝。支付完成后，会员权限会立即生效。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Q: 支付安全吗？</h3>
            <p className="text-sm text-muted-foreground">
              我们使用虎皮椒支付平台，支持微信支付和支付宝，所有支付数据均经过加密处理，安全可靠。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
