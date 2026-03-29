const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 虎皮椒支付配置（请替换为你的实际配置）
// ============================================
const XUNHUPAY_CONFIG = {
  // 测试环境
  test: {
    gateway: 'https://api.xunhupay.com/payment/do.html',
    pid: '2000000000', // 你的测试商户ID
    key: 'test_key_1234567890', // 你的测试密钥
    notifyUrl: 'http://localhost:3001/api/payment/notify', // 异步通知地址
    returnUrl: 'http://localhost:5173/subscribe?success=true' // 同步跳转地址
  },
  // 生产环境
  production: {
    gateway: 'https://api.xunhupay.com/payment/do.html',
    pid: process.env.XUNHUPAY_PID || 'your_pid', // 你的正式商户ID
    key: process.env.XUNHUPAY_KEY || 'your_key', // 你的正式密钥
    notifyUrl: process.env.NOTIFY_URL || 'https://yourdomain.com/api/payment/notify',
    returnUrl: process.env.RETURN_URL || 'https://yourdomain.com/subscribe?success=true'
  }
};

// 使用环境变量判断使用测试还是生产配置
const isDevelopment = process.env.NODE_ENV !== 'production';
const config = isDevelopment ? XUNHUPAY_CONFIG.test : XUNHUPAY_CONFIG.production;

// ============================================
// 订单存储（实际生产中应该使用数据库）
// ============================================
const orders = new Map();

// ============================================
// 辅助函数：生成签名
// ============================================
function generateSign(params) {
  // 排序参数
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});

  // 拼接字符串
  const signString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&') + `&key=${config.key}`;

  // MD5 加密并转大写
  const sign = crypto
    .createHash('md5')
    .update(signString, 'utf8')
    .digest('hex')
    .toUpperCase();

  return sign;
}

// ============================================
// 辅助函数：验证签名
// ============================================
function verifySign(params, receivedSign) {
  const calculatedSign = generateSign(params);
  return calculatedSign === receivedSign;
}

// ============================================
// 辅助函数：生成订单号
// ============================================
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WM${timestamp}${random}`;
}

// ============================================
// 辅助函数：获取订阅价格
// ============================================
function getPlanPrice(planType) {
  const prices = {
    'monthly': 29,
    'yearly': 299
  };
  return prices[planType] || 0;
}

// ============================================
// 辅助函数：获取订阅名称
// ============================================
function getPlanName(planType) {
  const names = {
    'monthly': '月度会员',
    'yearly': '年度会员'
  };
  return names[planType] || '免费版';
}

// ============================================
// 辅助函数：获取订阅时长（天）
// ============================================
function getSubscriptionDuration(planType) {
  const durations = {
    'monthly': 30,
    'yearly': 365
  };
  return durations[planType] || 0;
}

// ============================================
// API 1: 创建支付订单
// ============================================
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { planType, paymentMethod, userId, userEmail } = req.body;

    // 参数验证
    if (!planType || !userId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    if (planType === 'free') {
      return res.status(400).json({
        success: false,
        message: '免费版无需支付'
      });
    }

    // 生成订单信息
    const orderId = generateOrderId();
    const amount = getPlanPrice(planType);
    const orderName = getPlanName(planType);
    const userIdentity = userEmail || userId;

    // 存储订单信息
    orders.set(orderId, {
      orderId,
      userId: userIdentity,
      planType,
      amount,
      status: 'pending',
      createdAt: new Date(),
      paymentMethod
    });

    // 构建支付参数
    const paymentParams = {
      pid: config.pid,
      out_trade_order: orderId,
      name: `写作大师 - ${orderName}`,
      money: amount,
      notify_url: config.notifyUrl,
      return_url: config.returnUrl,
      client_ip: req.ip || '127.0.0.1',
      device: 'web',
      // 自定义参数（用于回调验证）
      attach: JSON.stringify({ userId: userIdentity, planType })
    };

    // 生成签名
    const sign = generateSign(paymentParams);
    paymentParams.sign = sign;

    // 返回支付信息
    res.json({
      success: true,
      data: {
        orderId,
        amount,
        paymentUrl: `${config.gateway}?${qs.stringify(paymentParams)}`,
        orderName
      }
    });

  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
});

// ============================================
// API 2: 查询订单状态
// ============================================
app.get('/api/payment/order-status/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        planType: order.planType,
        amount: order.amount,
        paidAt: order.paidAt
      }
    });
  } catch (error) {
    console.error('查询订单失败:', error);
    res.status(500).json({
      success: false,
      message: '查询订单失败'
    });
  }
});

// ============================================
// API 3: 支付异步通知（回调）
// ============================================
app.post('/api/payment/notify', async (req, res) => {
  try {
    console.log('收到支付通知:', req.body);

    const params = req.body;

    // 验证签名
    if (!verifySign(params, params.sign)) {
      console.error('签名验证失败');
      return res.status(400).send('FAIL');
    }

    const { trade_order_id, out_trade_order, total_fee, trade_status, attach } = params;

    // 查找订单
    const order = orders.get(out_trade_order);
    if (!order) {
      console.error('订单不存在:', out_trade_order);
      return res.status(400).send('FAIL');
    }

    // 更新订单状态
    if (trade_status === 'TRADE_SUCCESS') {
      order.status = 'paid';
      order.paidAt = new Date();
      order.tradeOrderId = trade_order_id;
      order.paidAmount = total_fee;

      // 解析附加信息
      if (attach) {
        try {
          const attachData = JSON.parse(attach);
          order.userId = attachData.userId;
          order.planType = attachData.planType;
        } catch (error) {
          console.error('解析attach失败:', error);
        }
      }

      console.log('订单支付成功:', order);
    }

    // 返回成功
    res.send('SUCCESS');
  } catch (error) {
    console.error('支付通知处理失败:', error);
    res.status(500).send('FAIL');
  }
});

// ============================================
// API 4: 获取用户订阅信息
// ============================================
app.get('/api/subscription/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    // 查询用户最新的已支付订单
    const userOrders = Array.from(orders.values())
      .filter(order => order.userId === userId && order.status === 'paid')
      .sort((a, b) => b.paidAt - a.paidAt);

    if (userOrders.length === 0) {
      return res.json({
        success: true,
        data: {
          subscription: 'free',
          subscriptionExpiresAt: null
        }
      });
    }

    const latestOrder = userOrders[0];
    const duration = getSubscriptionDuration(latestOrder.planType);
    const expiresAt = new Date(latestOrder.paidAt.getTime() + duration * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: {
        subscription: latestOrder.planType,
        subscriptionExpiresAt: expiresAt,
        orderId: latestOrder.orderId,
        paidAt: latestOrder.paidAt
      }
    });
  } catch (error) {
    console.error('获取订阅信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订阅信息失败'
    });
  }
});

// ============================================
// API 5: 测试接口（用于调试）
// ============================================
app.get('/api/payment/test', (req, res) => {
  res.json({
    success: true,
    message: '支付服务正常运行',
    config: {
      environment: isDevelopment ? 'test' : 'production',
      pid: config.pid
    },
    ordersCount: orders.size
  });
});

// ============================================
// 健康检查
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 虎皮椒支付服务已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔧 环境: ${isDevelopment ? '测试环境' : '生产环境'}`);
  console.log(`📊 商户ID: ${config.pid}`);
  console.log('=================================');
});

// ============================================
// 优雅关闭
// ============================================
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});
