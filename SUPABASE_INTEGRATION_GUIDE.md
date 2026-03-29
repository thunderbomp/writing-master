# Supabase 集成完成指南

## 🎉 集成完成

恭喜！写作大师项目已完成 Supabase 的完整集成。以下是已实现的所有功能：

---

## ✅ 已完成的工作

### 1. 依赖安装
- ✅ 安装 @supabase/supabase-js
- ✅ 配置环境变量模板 (.env.example)

### 2. 数据库设计
- ✅ 完整的数据库表结构 (schema.sql)
- ✅ Row Level Security (RLS) 策略
- ✅ 自动触发器 (用户创建、时间戳更新)
- ✅ 实用函数 (统计数据、重置使用次数)

### 3. 认证系统
- ✅ 用户注册 (src/services/auth.service.ts)
- ✅ 用户登录
- ✅ 用户退出
- ✅ 获取当前用户
- ✅ 监听认证状态变化
- ✅ 密码重置
- ✅ 密码更新

### 4. 数据服务层
- ✅ 用户数据服务 (src/services/data.service.ts)
- ✅ 订单数据服务
- ✅ 诊断记录服务
- ✅ 使用记录服务
- ✅ 收藏服务
- ✅ 实时订阅服务
- ✅ 用户统计服务

### 5. 状态管理
- ✅ 重构 Zustand store (src/store/index.ts)
- ✅ 集成 Supabase 认证
- ✅ 实时数据同步
- ✅ 自动数据持久化

### 6. 数据迁移
- ✅ 迁移脚本 (src/utils/migration.ts)
- ✅ 从 localStorage 迁移到 Supabase
- ✅ 自动数据备份
- ✅ 数据完整性检查

---

## 📁 项目结构

```
writing-master/
├── .env.example                    # 环境变量模板
├── supabase/
│   └── schema.sql                  # 数据库表结构
├── src/
│   ├── lib/
│   │   └── supabase.ts             # Supabase 客户端
│   ├── services/
│   │   ├── auth.service.ts         # 认证服务
│   │   └── data.service.ts        # 数据服务
│   ├── store/
│   │   └── index.ts                # 状态管理 (已更新)
│   └── utils/
│       └── migration.ts            # 数据迁移脚本
└── package.json                    # 依赖已添加
```

---

## 🚀 快速开始

### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册
2. 创建新项目 (Name: writing-master)
3. 等待项目创建完成

### 步骤 2: 获取凭证

在项目设置中找到：
- Project URL: `https://xxx.supabase.co`
- Anon Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 步骤 3: 配置环境变量

创建 `.env` 文件：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 步骤 4: 初始化数据库

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `supabase/schema.sql` 内容
4. 点击 Run 执行

### 步骤 5: 启动项目

```bash
npm run dev
```

---

## 💡 使用示例

### 认证

```typescript
import { useStore } from '@/store'

function LoginForm() {
  const { signIn, signUp } = useStore()

  // 注册
  await signUp('user@example.com', 'password123', '张三')

  // 登录
  await signIn('user@example.com', 'password123')
}
```

### 数据操作

```typescript
const {
  setDiagnosisResult,
  addFavorite,
  incrementAiUsage
} = useStore()

// 保存诊断结果
setDiagnosisResult({
  imagination: 4,
  logic: 3,
  expression: 5,
  // ...
})

// 添加收藏
await addFavorite('template-001')

// 增加 AI 使用次数
await incrementAiUsage()
```

### 实时同步

```typescript
import { useEffect } from 'react'

function UserProfile() {
  const { initializeRealtimeSubscriptions } = useStore()

  useEffect(() => {
    // 初始化实时订阅
    initializeRealtimeSubscriptions()
  }, [])

  return <div>{/* ... */}</div>
}
```

---

## 📦 数据迁移

### 从 localStorage 迁移到 Supabase

#### 方法 1: 浏览器控制台

1. 打开浏览器控制台 (F12)
2. 登录系统
3. 运行：
```javascript
await migrateToSupabase()
```

#### 方法 2: 使用迁移组件

创建迁移组件：
```typescript
import { migrateToSupabase } from '@/utils/migration'

function MigrationTool() {
  const handleMigrate = async () => {
    const result = await migrateToSupabase()
    console.log(result)
  }

  return <button onClick={handleMigrate}>迁移数据</button>
}
```

### 迁移内容

- ✅ 用户信息 (订阅、AI 使用次数)
- ✅ 诊断记录
- ✅ 收藏列表
- ✅ 使用记录 (最多 50 条)

---

## 📊 数据库表结构

### users (用户表)
- id (UUID, PK)
- name (TEXT)
- email (TEXT, UNIQUE)
- subscription (TEXT)
- subscription_expires_at (TIMESTAMP)
- ai_usage_today (INTEGER)
- last_usage_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### orders (订单表)
- id (SERIAL, PK)
- order_id (TEXT, UNIQUE)
- user_id (UUID, FK)
- plan_type (TEXT)
- amount (DECIMAL)
- status (TEXT)
- trade_order_id (TEXT)
- paid_at (TIMESTAMP)
- payment_method (TEXT)
- created_at (TIMESTAMP)

### diagnosis_records (诊断记录表)
- id (SERIAL, PK)
- user_id (UUID, FK)
- imagination, logic, expression, ... (INTEGER)
- created_at (TIMESTAMP)

### usage_records (使用记录表)
- id (SERIAL, PK)
- user_id (UUID, FK)
- item_id (TEXT)
- item_type (TEXT)
- created_at (TIMESTAMP)

### favorites (收藏表)
- id (SERIAL, PK)
- user_id (UUID, FK)
- item_id (TEXT)
- created_at (TIMESTAMP)
- UNIQUE(user_id, item_id)

---

## 🔐 安全特性

### Row Level Security (RLS)

所有表都启用了 RLS，确保：
- ✅ 用户只能访问自己的数据
- ✅ 防止越权访问
- ✅ 数据安全隔离

### 策略示例

```sql
-- 用户只能查看自己的数据
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);
```

---

## 🎯 API 参考

### 认证服务 (auth.service.ts)

```typescript
// 注册
authService.signUp({ email, password, name })

// 登录
authService.signIn({ email, password })

// 退出
authService.signOut()

// 获取当前用户
authService.getCurrentUser()

// 监听认证状态
authService.onAuthStateChange((user) => {})

// 重置密码
authService.resetPassword(email)

// 更新密码
authService.updatePassword(newPassword)
```

### 数据服务 (data.service.ts)

```typescript
// 用户数据
dataService.getUserById(userId)
dataService.updateUserSubscription(userId, subscription, expiresAt)
dataService.incrementAIUsage(userId)
dataService.resetDailyAIUsage(userId)

// 订单数据
dataService.createOrder(order)
dataService.getOrderById(orderId)
dataService.getUserOrders(userId)
dataService.updateOrderStatus(orderId, status, tradeOrderId, paidAt, paymentMethod)

// 诊断记录
dataService.createDiagnosisRecord(userId, scores)
dataService.getUserDiagnosisRecords(userId)
dataService.getLatestDiagnosisRecord(userId)

// 使用记录
dataService.createUsageRecord(userId, itemId, itemType)
dataService.getUserUsageRecords(userId, limit)

// 收藏
dataService.addFavorite(userId, itemId)
dataService.removeFavorite(userId, itemId)
dataService.getUserFavorites(userId)
dataService.isFavorite(userId, itemId)

// 实时订阅
dataService.subscribeToUser(userId, callback)
dataService.subscribeToFavorites(userId, callback)
dataService.subscribeToOrders(userId, callback)

// 用户统计
dataService.getUserStats(userId)
```

---

## ⚠️ 注意事项

### 1. 环境变量

必须正确配置 `.env` 文件，否则会报错：
```
Missing Supabase environment variables
```

### 2. 数据库初始化

必须先执行 `schema.sql` 创建表，否则会报错：
```
relation "public.users" does not exist
```

### 3. 用户登录

所有数据操作都需要用户登录，否则会失败：
```
new row violates row-level security policy
```

### 4. 实时同步

确保 Supabase 项目启用了 Realtime 功能，并为需要的表开启 Realtime。

---

## 🐛 故障排查

### 问题 1: 环境变量错误

**错误**:
```
Missing Supabase environment variables
```

**解决**:
- 检查 `.env` 文件是否存在
- 确认变量名正确 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- 重启开发服务器

### 问题 2: 数据库表不存在

**错误**:
```
relation "public.users" does not exist
```

**解决**:
- 在 Supabase Dashboard 中执行 `schema.sql`
- 确认所有表都已创建

### 问题 3: RLS 权限错误

**错误**:
```
new row violates row-level security policy
```

**解决**:
- 确认用户已登录
- 检查 RLS 策略是否正确
- 验证 `auth.uid()` 与 `user.id` 是否匹配

### 问题 4: 实时订阅不工作

**检查项**:
- Supabase 项目启用了 Realtime 功能
- 表的 Realtime 设置已开启
- 订阅 channel 格式正确

---

## 📚 下一步

### 测试

1. ✅ 注册新用户
2. ✅ 登录系统
3. ✅ 保存诊断结果
4. ✅ 添加/取消收藏
5. ✅ 查看使用记录
6. ✅ 测试实时同步

### 部署

1. 配置生产环境变量
2. 启用 HTTPS
3. 设置自定义域名
4. 配置 CDN

### 扩展

1. 添加第三方登录 (Google, GitHub)
2. 实现数据导出功能
3. 添加用户统计分析
4. 优化性能和缓存

---

## 🎉 总结

### 完成的功能

✅ **完整的认证系统**
- 注册、登录、退出
- 密码重置
- 自动会话管理

✅ **强大的数据存储**
- PostgreSQL 数据库
- 完整的用户、订单、诊断、收藏等数据
- Row Level Security 保护

✅ **实时数据同步**
- 自动同步数据变化
- 实时通知
- WebSocket 连接

✅ **平滑的数据迁移**
- 从 localStorage 迁移到 Supabase
- 自动备份
- 数据完整性检查

✅ **生产就绪**
- 完善的错误处理
- 安全机制
- 性能优化

---

## 📞 技术支持

- **Supabase 文档**: https://supabase.com/docs
- **Supabase Discord**: https://discord.gg/supabase
- **GitHub**: https://github.com/supabase/supabase

---

**版本**: 1.0.0
**最后更新**: 2026-03-29
**作者**: Writing Master Team
