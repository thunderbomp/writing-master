import { useState } from 'react'
import { Sparkles, Copy, CheckCircle, Send, MessageSquare, BookOpen, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { promptTemplates, frameworks, frameworkDescriptions } from '@/data/prompts'
import { useStore } from '@/store'
import { cn } from '@/utils/cn'

const usageLimits = {
  free: 5,
  monthly: 50,
  yearly: Infinity
}

export default function AIWriter() {
  const [selectedFramework, setSelectedFramework] = useState<string>('RTF')
  const [selectedTemplate, setSelectedTemplate] = useState(promptTemplates[0])
  const [userInput, setUserInput] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'writer' | 'templates'>('writer')
  
  const { user, addHistory, incrementAiUsage } = useStore()

  const usageLimit = user ? usageLimits[user.subscription] : 5
  const canGenerate = !user || user.subscription === 'yearly' || (user.aiUsageToday < usageLimit)

  const handleFrameworkChange = (framework: string) => {
    setSelectedFramework(framework)
    const template = promptTemplates.find(t => t.framework === framework)
    if (template) {
      setSelectedTemplate(template)
    }
  }

  const handleGenerate = async () => {
    if (!canGenerate || !userInput.trim()) return
    
    setIsGenerating(true)
    incrementAiUsage()
    addHistory({ id: selectedTemplate.id, type: 'ai-writer' })
    
    // Simulate AI generation (in real app, this would call an AI API)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockResponse = `【生成内容示例】

尊敬的${userInput.includes('王总') ? '王总' : '领导'}：

${userInput.includes('汇报') ? '现就近期工作情况进行汇报' : '关于您提出的问题，现回复如下'}：

${selectedTemplate.framework === 'RTF' ? `
1. 背景说明
   根据当前情况分析...

2. 具体内容
   核心要点如下...

3. 下一步计划
   将持续推进相关工作...
` : selectedTemplate.framework === 'BRO' ? `
【工作成果】
- 完成了预期目标
- 达成率100%

【存在问题】
- 需要进一步优化

【改进措施】
- 制定详细计划
- 定期跟进进度
` : `
一、背景与目标
...

二、实施方案
...

三、预期效果
...
`}

以上内容仅供参考，请根据实际情况调整。

---
💡 提示：这是AI生成的初稿，建议人工审核后使用以确保准确性和专业性。`

    setGeneratedContent(mockResponse)
    setIsGenerating(false)
  }

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI写作助手
        </h1>
        <p className="text-muted-foreground">5大Prompt框架，智能生成高质量内容</p>
      </div>

      {/* Usage Info */}
      {user && user.subscription !== 'yearly' && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-medium">今日AI使用次数：{user.aiUsageToday} / {usageLimit}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/subscribe'}>
                升级会员
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'writer' ? 'default' : 'outline'}
          onClick={() => setActiveTab('writer')}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          AI写作
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('templates')}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Prompt模板库
        </Button>
      </div>

      {activeTab === 'writer' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Input */}
          <div className="space-y-4">
            {/* Framework Selection */}
            <Card>
              <CardHeader>
                <CardTitle>选择Prompt框架</CardTitle>
                <CardDescription>不同复杂度场景选择不同框架</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3">
                  {frameworks.map((framework) => (
                    <button
                      key={framework}
                      onClick={() => handleFrameworkChange(framework)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        selectedFramework === framework
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "hover:border-primary/50"
                      )}
                    >
                      <div className="font-medium text-sm">{framework}</div>
                      <div className="text-xs text-muted-foreground">
                        {frameworkDescriptions[framework as keyof typeof frameworkDescriptions]?.level}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                  <div className="font-medium text-primary mb-1">
                    {frameworkDescriptions[selectedFramework as keyof typeof frameworkDescriptions]?.name}
                  </div>
                  <div className="text-muted-foreground">
                    {frameworkDescriptions[selectedFramework as keyof typeof frameworkDescriptions]?.description}
                  </div>
                  <div className="mt-2 text-xs">
                    适用场景：{frameworkDescriptions[selectedFramework as keyof typeof frameworkDescriptions]?.bestFor}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>输入内容</CardTitle>
                <CardDescription>描述你想要写作的内容</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">模板参考</label>
                    <select
                      value={selectedTemplate.id}
                      onChange={(e) => {
                        const template = promptTemplates.find(t => t.id === e.target.value)
                        if (template) setSelectedTemplate(template)
                      }}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    >
                      {promptTemplates.filter(t => t.framework === selectedFramework).map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">你的需求</label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="例如：向王总汇报Q3营销方案，需要审批预算..."
                      className="min-h-[150px] w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!canGenerate || !userInput.trim() || isGenerating}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>生成中...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        生成内容
                      </>
                    )}
                  </Button>

                  {!canGenerate && (
                    <p className="text-center text-sm text-destructive">
                      今日使用次数已用完，请升级会员或明天再来
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Output */}
          <div className="space-y-4">
            <Card className="min-h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>生成结果</CardTitle>
                  <CardDescription>AI生成的内容（模拟）</CardDescription>
                </div>
                {generatedContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(generatedContent, 'output')}
                  >
                    {copiedSection === 'output' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg max-h-[500px] overflow-y-auto">
                    {generatedContent}
                  </pre>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-4">输入内容后点击生成</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Templates Tab */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promptTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {template.framework}
                  </span>
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">模板</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap max-h-[100px]">
                    {template.template.slice(0, 200)}...
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedFramework(template.framework)
                    setSelectedTemplate(template)
                    setActiveTab('writer')
                  }}
                >
                  使用此模板
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
