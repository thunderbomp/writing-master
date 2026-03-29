-- ============================================
-- 写作大师 - 数据库表结构
-- Supabase PostgreSQL
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 用户表（扩展现有 auth.users）
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'monthly', 'yearly')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  ai_usage_today INTEGER DEFAULT 0,
  last_usage_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription ON public.users(subscription);

-- ============================================
-- 2. 订单表
-- ============================================
CREATE TABLE public.orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  trade_order_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_id ON public.orders(order_id);

-- ============================================
-- 3. 诊断记录表
-- ============================================
CREATE TABLE public.diagnosis_records (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  imagination INTEGER NOT NULL CHECK (imagination BETWEEN 1 AND 5),
  logic INTEGER NOT NULL CHECK (logic BETWEEN 1 AND 5),
  expression INTEGER NOT NULL CHECK (expression BETWEEN 1 AND 5),
  audience_awareness INTEGER NOT NULL CHECK (audience_awareness BETWEEN 1 AND 5),
  structuring INTEGER NOT NULL CHECK (structuring BETWEEN 1 AND 5),
  language_refinement INTEGER NOT NULL CHECK (language_refinement BETWEEN 1 AND 5),
  data_usage INTEGER NOT NULL CHECK (data_usage BETWEEN 1 AND 5),
  emotional_resonance INTEGER NOT NULL CHECK (emotional_resonance BETWEEN 1 AND 5),
  innovative_thinking INTEGER NOT NULL CHECK (innovative_thinking BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_diagnosis_records_user_id ON public.diagnosis_records(user_id);
CREATE INDEX idx_diagnosis_records_created_at ON public.diagnosis_records(created_at DESC);

-- ============================================
-- 4. 使用记录表
-- ============================================
CREATE TABLE public.usage_records (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_created_at ON public.usage_records(created_at DESC);

-- ============================================
-- 5. 收藏表
-- ============================================
CREATE TABLE public.favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 创建索引
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_item_id ON public.favorites(item_id);

-- ============================================
-- 触发器：自动更新 updated_at 字段
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 订单表策略
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 诊断记录表策略
CREATE POLICY "Users can view their own diagnosis records"
  ON public.diagnosis_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnosis records"
  ON public.diagnosis_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用记录表策略
CREATE POLICY "Users can view their own usage records"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records"
  ON public.usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 收藏表策略
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 自动创建用户记录的函数
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '用户'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 实用函数
-- ============================================

-- 重置每日 AI 使用次数
CREATE OR REPLACE FUNCTION public.reset_daily_ai_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET ai_usage_today = 0
  WHERE last_usage_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 获取用户统计数据
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_diagnoses', COUNT(DISTINCT public.diagnosis_records.id),
    'total_usage', COUNT(public.usage_records.id),
    'total_favorites', COUNT(public.favorites.id),
    'total_orders', COUNT(public.orders.id)
  ) INTO stats
  FROM public.users
  LEFT JOIN public.diagnosis_records ON public.users.id = public.diagnosis_records.user_id
  LEFT JOIN public.usage_records ON public.users.id = public.usage_records.user_id
  LEFT JOIN public.favorites ON public.users.id = public.favorites.user_id
  LEFT JOIN public.orders ON public.users.id = public.orders.user_id
  WHERE public.users.id = user_id;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 完成
-- ============================================
COMMENT ON TABLE public.users IS '用户表';
COMMENT ON TABLE public.orders IS '订单表';
COMMENT ON TABLE public.diagnosis_records IS '诊断记录表';
COMMENT ON TABLE public.usage_records IS '使用记录表';
COMMENT ON TABLE public.favorites IS '收藏表';
