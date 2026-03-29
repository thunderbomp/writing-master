export interface PromptTemplate {
  id: string
  framework: string
  category: string
  title: string
  description: string
  template: string
  example: string
}

export const promptTemplates: PromptTemplate[] = [
  // RTF Framework
  {
    id: 'rtf-1',
    framework: 'RTF',
    category: '商务邮件',
    title: 'RTF框架 - 商务邮件',
    description: '适合简单邮件任务，入门级',
    template: `Role: [你的角色]
Task: [具体任务]
Format: [输出格式要求]

【AI生成提示词】
你是一位[职业描述],请帮我写[内容类型]。

[核心信息]
- 信息点1
- 信息点2
- 信息点3

[要求]
1. [要求1]
2. [要求2]
3. [要求3]

请输出完整内容。`,
    example: `Role: 市场部经理李明
Task: 向王总汇报Q3营销方案，申请审阅
Format: 商务邮件格式，开头简洁，正文分三点，结尾明确行动呼吁

【AI生成提示词】
你是一位专业的市场部经理,请帮我写一封邮件。

核心信息:
- 方案围绕3个核心策略:渠道拓展、用户激活、品牌升级
- 需要重点审阅预算合理性
- 截止时间:周三前

要求:
1. 开头简洁，10-15字
2. 正文分三点，每点包含:背景+数据+建议+预期
3. 结尾明确行动呼吁和截止时间

请输出完整邮件。`
  },
  // BRO Framework
  {
    id: 'bro-1',
    framework: 'BRO',
    category: '工作汇报',
    title: 'BRO框架 - 工作汇报',
    description: '适合中等复杂度，基础级',
    template: `Background: [背景信息]
Role: [你的角色]
Objectives: [目标描述]

【AI生成提示词】
你是一位专业的工作汇报助手,请帮我写一份[汇报类型]。

背景:
- [背景1]
- [背景2]

核心成果:
1. [成果1]
2. [成果2]

存在问题:
1. [问题1]
2. [问题2]

下月计划:
1. [计划1]
2. [计划2]

要求:
1. 使用结构化格式
2. 所有数据量化
3. 突出成果，诚实反映问题
4. 下一步计划具体可执行

请输出完整汇报。`,
    example: `Background: 2024年3月产品研发部工作，核心项目包括V3.0迭代、性能优化、需求管理
Role: 产品研发部汇报人张伟
Objectives: 汇报3月工作成果，分析问题，制定下月计划

【AI生成提示词】
你是一位专业的工作汇报助手,请帮我写一份月度工作汇报。

背景:
- 汇报周期:2024年3月
- 核心项目:V3.0版本迭代、性能优化专项、需求管理优化
- 整体情况:产品上线率100%,Bug修复率98%,需求完成率85%

核心成果:
1. V3.0版本按时上线,新增功能15个
2. 性能优化显著,加载速度从2秒降至1.8秒

存在问题:
1. 需求完成率85%,未达标
2. 用户满意度4.2分,低于目标4.5分

下月计划:
1. 技术债务专项清理
2. 用户反馈问题修复
3. 需求管理流程优化

请输出完整汇报。`
  },
  // CO-STAR Framework
  {
    id: 'costar-1',
    framework: 'CO-STAR',
    category: '方案提案',
    title: 'CO-STAR框架 - 方案提案',
    description: '适合复杂任务，进阶级',
    template: `Context: [上下文背景]
Objective: [目标]
Style: [风格要求]
Tone: [语气要求]
Audience: [受众]
Response: [输出格式]

【AI生成提示词】
你是一位专业的[职业]专家,请帮我写一份[内容类型]。

上下文:
- [上下文1]
- [上下文2]

目标:
- [目标1]
- [目标2]

风格要求:
- [风格1]
- [风格2]

语气要求:
- [语气1]

受众:
[受众描述]

输出格式:
[格式要求]

核心数据:
- [数据1]
- [数据2]

请输出完整内容,总字数[字数要求]。`,
    example: `Context: 公司当前系统割裂，数据无法互通，效率低下
Objective: 申请数字化转型项目，解决系统割裂问题
Style: 正式、专业、数据驱动
Tone: 客观、理性、有说服力
Audience: 公司高层决策者(CEO、CFO等)
Response: 结构化提案格式(背景→目标→方案→资源→风险)

【AI生成提示词】
你是一位专业的方案提案专家,请帮我写一份数字化转型方案提案。

上下文:
- 公司有ERP、CRM、财务、OA四个独立系统
- 各系统数据无法互通，形成"数据孤岛"
- 当前问题:系统割裂、效率低下、成本高昂

目标:
- 申请数字化转型项目
- 预期:12个月完成,年收益360万元,ROI=120%

风格要求:正式专业、数据驱动、逻辑严密、有说服力
受众:公司高层决策者

请输出完整提案。`
  },
  // APE Framework
  {
    id: 'ape-1',
    framework: 'APE',
    category: '内容优化',
    title: 'APE框架 - 内容优化',
    description: '适合内容优化，专家级',
    template: `Action: [要执行的动作]
Prompt: [详细的提示规则]
Evaluation: [自检标准]

请按照以下步骤优化[内容类型]:

Action: 优化[具体内容]
Prompt: 
1. 检查[要点1]
2. 优化[要点2]
3. 改进[要点3]
4. 完善[要点4]

Evaluation:
- [ ] 是否符合[标准1]
- [ ] 是否满足[标准2]
- [ ] 是否达到[标准3]

请输出优化后的内容,并说明修改原因。`,
    example: `Action: 优化商务邮件
Prompt: 
1. 检查主题是否清晰包含标签+内容+时效
2. 优化开头是否简洁明了
3. 改进正文是否分点清晰
4. 完善结尾是否有明确行动呼吁
5. 检查语言是否专业得体

Evaluation:
- [ ] 主题清晰，包含重要性和时效
- [ ] 开头简洁，10-15%篇幅
- [ ] 正文分点，每点有数据支撑
- [ ] 结尾有明确行动和时间
- [ ] 语言专业，符合商务风格

请输出优化后的邮件,并说明每处修改的原因。`
  },
  // STRUCT Framework
  {
    id: 'struct-1',
    framework: 'STRUCT',
    category: '大型方案',
    title: 'STRUCT框架 - 大型项目方案',
    description: '适合复杂项目，专家级',
    template: `<Role>
[角色定义]
</Role>

<Context>
[详细背景]
</Context>

<Requirements>
1. [要求1]
2. [要求2]
3. [要求3]
</Requirements>

<Limitations>
- [限制1]
- [限制2]
</Limitations>

<Output>
[输出格式]
</Output>

<Tone>
[语气要求]
</Tone>

[详细的任务描述和指导]
请严格按照上述结构输出。`,
    example: `<Role>
你是一位资深的企业咨询顾问，擅长撰写商业计划书和项目方案。
</Role>

<Context>
公司需要数字化转型，当前系统老旧，数据孤岛严重，效率低下。
预算500万，周期12个月。
</Context>

<Requirements>
1. 使用结构化格式(背景→目标→方案→资源→风险)
2. 所有数据必须量化
3. 包含详细实施步骤和时间节点
4. 风险评估要全面
</Requirements>

<Limitations>
- 预算不能超过500万
- 周期不能超过12个月
- 不能影响现有业务运行
</Limitations>

<Output>
Markdown格式，包含表格和图表说明
</Output>

<Tone>
专业、严谨、有说服力
</Tone>

请撰写完整的数字化转型方案提案。`
  }
]

export const frameworks = ['RTF', 'BRO', 'CO-STAR', 'APE', 'STRUCT']

export const frameworkDescriptions = {
  'RTF': {
    name: 'RTF框架',
    level: '入门级',
    description: '适合简单任务，Role + Task + Format',
    bestFor: '邮件、通知、简单消息'
  },
  'BRO': {
    name: 'BRO框架',
    level: '基础级',
    description: '适合中等复杂度，Background + Role + Objectives',
    bestFor: '工作汇报、会议纪要、总结报告'
  },
  'CO-STAR': {
    name: 'CO-STAR框架',
    level: '进阶级',
    description: '适合复杂任务，Context + Objective + Style + Tone + Audience + Response',
    bestFor: '方案提案、营销策略、行业分析'
  },
  'APE': {
    name: 'APE框架',
    level: '专家级',
    description: '适合内容优化，Action + Prompt + Evaluation',
    bestFor: '文字润色、结构优化、内容提升'
  },
  'STRUCT': {
    name: 'STRUCT框架',
    level: '专家级',
    description: '适合复杂项目，XML标签结构化',
    bestFor: '大型项目方案、技术方案、年度报告'
  }
}
