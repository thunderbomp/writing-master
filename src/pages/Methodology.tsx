import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, Lightbulb, Target, Users, FileText, GitBranch } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

const methodologies = [
  {
    id: 'scqa',
    name: 'SCQA模型',
    description: 'Situation-Complication-Question-Answer，情境-冲突-问题-答案的叙事框架',
    icon: FileText,
    content: {
      definition: 'SCQA是一种结构化表达框架，通过描述情境、冲突、问题来引导出答案，适用于报告、方案、演讲等场景。',
      structure: [
        { title: 'Situation（情境）', description: '描述一个大家熟悉的场景或背景，建立共识' },
        { title: 'Complication（冲突）', description: '引入问题或挑战，打破平衡' },
        { title: 'Question（问题）', description: '基于冲突提出需要解决的核心问题' },
        { title: 'Answer（答案）', description: '给出解决方案或核心观点' }
      ],
      example: {
        title: '示例：年度工作汇报',
        content: `S（情境）：今年团队完成了15个产品功能上线
C（冲突）：但用户满意度从4.5分降至4.2分
Q（问题）：如何在保持功能产出的同时提升用户体验？
A（答案）：通过建立用户体验优化流程，预计Q2满意度提升至4.5分`
      },
      tips: [
        '情境要与受众相关，建立共鸣',
        '冲突要具体，有说服力',
        '问题要聚焦，不要贪多',
        '答案要直接，有行动性'
      ]
    }
  },
  {
    id: 'pyramid',
    name: '金字塔原理',
    description: '结论先行，以上统下，归类分组，逻辑递进',
    icon: GitBranch,
    content: {
      definition: '金字塔原理是麦肯锡提出的结构化思考和表达的方法，核心是结论先行，让受众第一时间知道重点。',
      structure: [
        { title: '结论先行', description: '先说结果，再展开说明' },
        { title: '以上统下', description: '上一层是下一层的概括和总结' },
        { title: '归类分组', description: '同类型信息放在一起' },
        { title: '逻辑递进', description: '按逻辑顺序排列（时间/结构/程度）' }
      ],
      example: {
        title: '示例：项目汇报',
        content: `结论：本项目预计延期2周上线

原因分析：
1. 技术复杂度超出预期（第三方API变更）
2. 测试资源不足
3. 需求变更频繁

解决方案：
- 增加技术评审环节
- 申请额外测试资源
- 建立需求变更流程`
      },
      tips: [
        '每层内容不超过7个要点',
        '同一层要点要有相同逻辑',
        '使用MECE原则确保不重不漏',
        '金字塔顶部是核心观点'
      ]
    }
  },
  {
    id: 'star',
    name: 'STAR法则',
    description: 'Situation-Task-Action-Result，情境-任务-行动-结果',
    icon: Target,
    content: {
      definition: 'STAR法则是一种讲述故事的方式，特别适合描述工作经历、项目经验或成果展示。',
      structure: [
        { title: 'Situation（情境）', description: '描述事情发生的背景和环境' },
        { title: 'Task（任务）', description: '说明你的角色和需要完成的任务' },
        { title: 'Action（行动）', description: '具体采取了什么行动' },
        { title: 'Result（结果）', description: '最终取得了什么成果（最好量化）' }
      ],
      example: {
        title: '示例：项目经验',
        content: `S：在上一家公司，用户反馈系统响应慢，影响满意度
T：作为技术负责人，需要优化系统响应速度
A：
1. 分析性能瓶颈，定位数据库查询问题
2. 引入缓存机制，优化查询语句
3. 增加监控告警
R：响应速度从3秒降至0.5秒，用户满意度提升25%`
      },
      tips: [
        '情境要简洁，不要过多铺垫',
        '行动要具体，展示你的贡献',
        '结果要量化，用数据说话',
        '可以适当强调挑战和难点'
      ]
    }
  },
  {
    id: 'aida',
    name: 'AIDA模型',
    description: 'Attention-Interest-Desire-Action，注意-兴趣-欲望-行动',
    icon: Lightbulb,
    content: {
      definition: 'AIDA是一种营销和说服性写作的框架，适用于文案、提案、演讲开场等需要影响他人的场景。',
      structure: [
        { title: 'Attention（注意）', description: '用惊人的事实、问题或悬念吸引注意' },
        { title: 'Interest（兴趣）', description: '继续深化，诱发进一步了解的兴趣' },
        { title: 'Desire（欲望）', description: '展示价值，激发拥有的欲望' },
        { title: 'Action（行动）', description: '明确号召行动（购买/注册/联系等）' }
      ],
      example: {
        title: '示例：产品提案',
        content: `A：某头部企业因数据泄露损失5000万
I：而这只是冰山一角，80%的企业存在数据安全隐患
D：我们提供企业级数据安全方案，已服务500+企业，0安全事故
A：立即预约免费安全评估，了解您的风险等级`
      },
      tips: [
        '开头要足够吸引眼球',
        '兴趣要靠具体细节维持',
        '欲望要突出利益和价值',
        '行动要明确且易于执行'
      ]
    }
  },
  {
    id: '5w1h',
    name: '5W1H分析法',
    description: 'Who-What-When-Where-Why-How，什么人、什么事、何时、何地、为什么、怎么做',
    icon: Users,
    content: {
      definition: '5W1H是一种全面分析问题的框架，适用于调查报告、事件说明、问题分析等场景。',
      structure: [
        { title: 'Who（谁）', description: '涉及的人物、角色' },
        { title: 'What（什么）', description: '发生了什么、是什么' },
        { title: 'When（何时）', description: '时间、期限' },
        { title: 'Where（何地）', description: '地点、场景' },
        { title: 'Why（为什么）', description: '原因、目的' },
        { title: 'How（怎么做）', description: '方法、步骤' }
      ],
      example: {
        title: '示例：项目说明',
        content: `Who：产品研发部全体成员
What：V3.0版本迭代开发
When：2024年1月-3月
Where：线上开发为主
Why：响应用户反馈，提升产品竞争力
How：采用敏捷开发，2周一迭代`
      },
      tips: [
        '不是每个场景都要用全6点',
        '重点放在why和how上',
        '可以组合使用（如2W1H）',
        '根据受众调整详略'
      ]
    }
  }
]

export default function Methodology() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          写作方法论
        </h1>
        <p className="text-muted-foreground">5大经典写作框架，提升你的逻辑与表达</p>
      </div>

      <div className="grid gap-4">
        {methodologies.map((method) => {
          const Icon = method.icon
          const isExpanded = expandedId === method.id
          
          return (
            <Card key={method.id} className="overflow-hidden">
              <button
                className="w-full"
                onClick={() => setExpandedId(isExpanded ? null : method.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-xl">{method.name}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="space-y-6 pt-0">
                  {/* Definition */}
                  <div>
                    <h3 className="mb-2 font-semibold">概念定义</h3>
                    <p className="text-muted-foreground">{method.content.definition}</p>
                  </div>

                  {/* Structure */}
                  <div>
                    <h3 className="mb-3 font-semibold">核心结构</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {method.content.structure.map((item, i) => (
                        <div key={i} className="rounded-lg bg-muted p-3">
                          <div className="font-medium text-primary mb-1">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h3 className="mb-2 font-semibold">{method.content.example.title}</h3>
                    <pre className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap font-mono">
                      {method.content.example.content}
                    </pre>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="mb-2 font-semibold">使用技巧</h3>
                    <ul className="space-y-2">
                      {method.content.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
