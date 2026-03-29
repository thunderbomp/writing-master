-- ============================================
-- 写作大师 - 学习资料管理系统
-- 数据库表结构（完整版）
-- ============================================

-- 1. 用户角色管理表
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'editor', 'admin')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- RLS 策略
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可查看自己的角色" ON user_roles
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "仅管理员可管理角色" ON user_roles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- 2. 学习资料分类表
-- ============================================

CREATE TABLE IF NOT EXISTS learning_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_categories_name ON learning_categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_order ON learning_categories(order_index);

-- RLS 策略
ALTER TABLE learning_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可查看分类" ON learning_categories
  FOR SELECT USING (true);

CREATE POLICY "编辑/管理员可创建分类" ON learning_categories
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  ));

CREATE POLICY "编辑/管理员可修改分类" ON learning_categories
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  ));

-- ============================================
-- 3. 学习资料主表（支持多媒体）
-- ============================================

CREATE TABLE IF NOT EXISTS learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本信息
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES learning_categories(id) ON DELETE SET NULL,
  
  -- 多媒体内容
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'audio', 'video', 'mixed')),
  text_content TEXT,
  
  -- 音频内容
  audio_url TEXT,                    -- 存储在 Supabase 的音频文件 URL
  audio_duration INTEGER,             -- 音频时长（秒）
  audio_transcript TEXT,              -- 音频文本转录
  
  -- 视频内容
  video_url TEXT,                    -- 存储在 Supabase 的视频文件 URL
  video_duration INTEGER,             -- 视频时长（秒）
  video_thumbnail_url TEXT,           -- 视频缩略图
  video_transcript TEXT,              -- 视频文本转录
  
  -- 结构化数据
  structure TEXT,                    -- 内容结构说明
  example TEXT,                      -- 示例内容
  ai_prompt TEXT,                    -- AI提示词
  common_errors TEXT,                -- 常见错误（JSON数组）
  applicable_scenarios TEXT,         -- 适用场景（JSON数组）
  
  -- 元数据
  is_published BOOLEAN DEFAULT false, -- 是否发布
  view_count INTEGER DEFAULT 0,      -- 浏览次数
  like_count INTEGER DEFAULT 0,      -- 点赞数
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- 作者和编辑
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- 版本管理
  version INTEGER DEFAULT 1,
  is_draft BOOLEAN DEFAULT true
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_materials_category ON learning_materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_created_by ON learning_materials(created_by);
CREATE INDEX IF NOT EXISTS idx_materials_is_published ON learning_materials(is_published);
CREATE INDEX IF NOT EXISTS idx_materials_content_type ON learning_materials(content_type);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON learning_materials(created_at DESC);

-- RLS 策略
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有人可查看已发布资料" ON learning_materials
  FOR SELECT USING (is_published = true OR auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  ));

CREATE POLICY "编辑/管理员可创建资料" ON learning_materials
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  ) AND created_by = auth.uid());

CREATE POLICY "编辑/管理员可修改自己的资料或作为管理员修改所有资料" ON learning_materials
  FOR UPDATE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "编辑/管理员可删除自己的资料或作为管理员删除所有资料" ON learning_materials
  FOR DELETE USING (
    created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. 版本历史表（追踪所有修改）
-- ============================================

CREATE TABLE IF NOT EXISTS material_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  
  -- 保存快照
  title TEXT NOT NULL,
  description TEXT,
  text_content TEXT,
  audio_url TEXT,
  video_url TEXT,
  
  -- 变更信息
  change_summary TEXT,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(material_id, version)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_versions_material_id ON material_versions(material_id);
CREATE INDEX IF NOT EXISTS idx_versions_version ON material_versions(version DESC);

-- RLS 策略
ALTER TABLE material_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "相关用户可查看版本历史" ON material_versions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM learning_materials 
    WHERE id = material_id AND (
      created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
      )
    )
  ));

-- ============================================
-- 5. 媒体文件元数据表
-- ============================================

CREATE TABLE IF NOT EXISTS media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES learning_materials(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'video', 'image')),
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  
  storage_path TEXT NOT NULL,        -- Supabase Storage 路径
  storage_url TEXT NOT NULL,
  
  duration INTEGER,                   -- 媒体时长（秒）
  width INTEGER,                      -- 视频宽度
  height INTEGER,                     -- 视频高度
  
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_media_material_id ON media_uploads(material_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media_uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_media_status ON media_uploads(status);

-- RLS 策略
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "授权用户可查看媒体" ON media_uploads
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM learning_materials 
    WHERE id = material_id AND (
      is_published = true OR created_by = auth.uid()
    )
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
  ));

-- ============================================
-- 6. 用户交互表（收藏、点赞）
-- ============================================

CREATE TABLE IF NOT EXISTS material_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  is_favorited BOOLEAN DEFAULT false,
  is_liked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(material_id, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON material_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_material_id ON material_interactions(material_id);

-- RLS 策略
ALTER TABLE material_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能看到自己的交互数据" ON material_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能操作自己的交互数据" ON material_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能修改自己的交互数据" ON material_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. 自动更新时间戳触发器
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_materials_updated_at
  BEFORE UPDATE ON learning_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_learning_categories_updated_at
  BEFORE UPDATE ON learning_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_material_interactions_updated_at
  BEFORE UPDATE ON material_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. 视图 - 材料统计
-- ============================================

CREATE OR REPLACE VIEW material_stats AS
SELECT 
  lm.id,
  lm.title,
  lm.category_id,
  lc.name as category_name,
  COUNT(DISTINCT CASE WHEN mi.is_favorited THEN mi.user_id END) as favorite_count,
  COUNT(DISTINCT CASE WHEN mi.is_liked THEN mi.user_id END) as like_count,
  COALESCE(SUM(mi.view_count), 0) as total_views,
  lm.created_by,
  lm.created_at,
  lm.is_published
FROM learning_materials lm
LEFT JOIN learning_categories lc ON lm.category_id = lc.id
LEFT JOIN material_interactions mi ON lm.id = mi.material_id
GROUP BY lm.id, lm.title, lm.category_id, lc.name, lm.created_by, lm.created_at, lm.is_published;

-- ============================================
-- 9. 初始数据 - 默认分类
-- ============================================

INSERT INTO learning_categories (name, description, icon, order_index, created_by) VALUES
('商务邮件', '商务邮件写作模板和指南', 'Mail', 1, '00000000-0000-0000-0000-000000000000'),
('工作汇报', '周报、月报、项目汇报等', 'BarChart3', 2, '00000000-0000-0000-0000-000000000000'),
('方案提案', '项目立项、资源申请等', 'FileText', 3, '00000000-0000-0000-0000-000000000000'),
('会议纪要', '会议记录和决策文档', 'Users', 4, '00000000-0000-0000-0000-000000000000'),
('公告通知', '公司公告和政策通知', 'Bell', 5, '00000000-0000-0000-0000-000000000000'),
('AI写作', 'AI提示词框架和最佳实践', 'Sparkles', 6, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 10. 存储桶配置（通过代码执行）
-- ============================================
-- 以下操作需要在应用中通过 Supabase SDK 执行：
-- 1. 创建 'learning-materials' 存储桶（文本）
-- 2. 创建 'learning-audio' 存储桶（音频文件）
-- 3. 创建 'learning-video' 存储桶（视频文件）
-- 4. 创建 'learning-thumbnails' 存储桶（缩略图）
-- 5. 配置 RLS 策略允许上传和公开访问

COMMENT ON TABLE learning_materials IS '学习资料主表，支持文字、音频、视频多种内容类型';
COMMENT ON TABLE learning_categories IS '学习资料分类表';
COMMENT ON TABLE user_roles IS '用户角色管理表，支持user/editor/admin三种角色';
COMMENT ON TABLE media_uploads IS '媒体文件上传记录和元数据';
COMMENT ON TABLE material_versions IS '学习资料版本历史，用于追踪所有修改';
