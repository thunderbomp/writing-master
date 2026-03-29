# MEMORY.md - 写作大师项目核心记录

## 项目概述
- **项目名称**: 写作大师 - 职场商务写作学习平台
- **技术栈**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Supabase
- **当前状态**: Supabase 集成完成，后台管理系统开发中

## Supabase 集成

### 核心服务文件
- `src/lib/supabase.ts` - Supabase 客户端初始化
- `src/services/auth.service.ts` - 认证服务（注册、登录、退出、密码管理）
- `src/services/data.service.ts` - 数据服务（用户、订单、诊断、收藏、使用记录）
- `src/services/materials.service.ts` - 学习资料 CRUD 服务（分类、资料、媒体上传）
- `src/utils/migration.ts` - localStorage 到 Supabase 迁移脚本

### 数据库表结构
- **users**: 用户信息（id, name, email, subscription, ai_usage_today, updated_at）
- **orders**: 订单信息（order_id, user_id, plan_type, amount, status）
- **diagnosis_records**: 诊断记录（9维能力评分）
- **usage_records**: 使用记录（item_id, item_type）
- **favorites**: 收藏（user_id, item_id, UNIQUE约束）
- **learning_categories**: 学习资料分类（id, name, slug, description, order）
- **learning_materials**: 学习资料（id, category_id, title, content_type, text_content, audio_url, video_url, video_thumbnail_url, published, created_at, updated_at）
- **user_roles**: 用户角色（user_id, role: 'user' | 'editor' | 'admin'）

### Supabase Storage
- `learning-audio`: 音频文件存储桶
- `learning-video`: 视频文件存储桶
- `learning-thumbnails`: 视频缩略图存储桶

### 认证与实时同步
- `src/store/index.ts`: Zustand store 集成 Supabase Auth
- `src/main.tsx`: 应用启动时调用 `initializeAuth()` 恢复登录状态
- 实时订阅：`subscribeToUser`, `subscribeToFavorites`, `subscribeToOrders`

### 权限系统
- **user**: 普通用户（只能查看已发布的资料）
- **editor**: 内容编辑（可创建/编辑/发布/删除资料）
- **admin**: 超级管理员（完整权限，可管理分类、设置用户角色）

### 本地降级机制
所有服务都有 `isSupabaseEnabled` 检查，未配置 Supabase 时自动降级到：
- 认证：本地模拟（localStorage 存储 user 对象）
- 数据：从静态文件 `templates.ts` / `cases.ts` 读取
- 状态：纯 localStorage 持久化

## 学习资料管理系统

### 核心功能
1. **权限控制**: 只有登录用户（editor/admin）可以修改学习资料
2. **数据库存储**: 所有资料存储在 Supabase `learning_materials` 表
3. **可视化增删改查**: 后台管理界面 `/admin`
4. **多媒体支持**: 文字、语音、视频三种媒体类型

### 后台管理路由
- `/admin` - 后台管理主页面（独立布局，无导航栏）
- 权限检查：非 editor/admin 自动跳转首页

### 素材类型枚举
```typescript
type ContentType = 'text' | 'audio' | 'video' | 'mixed'
```

### 文件上传限制
- 音频：最大 50MB
- 视频：最大 500MB

## 已完成事项 ✅
1. ✅ 修复所有 TypeScript 编译错误（`tsc --noEmit` 零错误）
2. ✅ 验证数据库 Schema 文件完整性（`supabase/learning_materials_schema.sql` 完整）
3. ✅ 构建测试通过（`npm run build` 零错误）

## 待完成事项
1. 执行数据库 Schema 部署（在 Supabase Dashboard 执行 SQL）
2. 配置 Supabase Storage 存储桶
3. 测试完整的后台管理功能
4. 验证数据迁移脚本

## 项目文件结构
```
src/
├── lib/
│   └── supabase.ts              # Supabase 客户端
├── services/
│   ├── auth.service.ts          # 认证服务
│   ├── data.service.ts          # 数据服务
│   └── materials.service.ts     # 学习资料服务
├── pages/
│   ├── Admin.tsx                # 后台管理
│   ├── Profile.tsx              # 个人中心（登录/注册）
│   └── Subscribe.tsx            # 会员订阅
├── components/
│   ├── admin/
│   │   └── MaterialEditor.tsx   # 资料编辑器
│   └── layout/
│       └── Layout.tsx           # 布局组件（导航栏）
├── store/
│   └── index.ts                 # Zustand store
├── utils/
│   └── migration.ts             # 数据迁移脚本
└── main.tsx                     # 应用入口

supabase/
├── schema.sql                   # 原始数据库结构
└── learning_materials_schema.sql  # 学习资料表结构

.env.example                    # 环境变量模板
```

## 配置环境变量
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
