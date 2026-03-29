# 写作大师 - 虎皮椒支付集成

## 📋 功能说明

本项目已集成虎皮椒支付系统，支持微信支付和支付宝。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd payment-backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写你的虎皮椒商户配置：

```env
# 环境设置
NODE_ENV=development

# 测试环境配置（使用虎皮椒提供的测试账号）
XUNHUPAY_TEST_PID=2000000000
XUNHUPAY_TEST_KEY=test_key_1234567890

# 生产环境配置（请替换为你的真实配置）
XUNHUPAY_PID=your_production_pid
XUNHUPAY_KEY=your_production_key

# 回调地址
NOTIFY_URL=https://yourdomain.com/api/payment/notify
RETURN_URL=https://yourdomain.com/subscribe?success=true
```

### 3. 启动服务

**开发环境：**

```bash
npm run dev
```

**生产环境：**

```bash
npm start
```

服务将在 `http://localhost:3001` 启动。

## 📝 API 接口文档

### 1. 创建支付订单

**接口：** `POST /api/payment/create-order`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| planType | string | 是 | 订阅类型：monthly（月度）、yearly（年度） |
| paymentMethod | string | 是 | 支付方式：wechat（微信）、alipay（支付宝） |
| userId | string | 是 | 用户ID |
| userEmail | string | 否 | 用户邮箱 |

**请求示例：**

```json
{
  "planType": "monthly",
  "paymentMethod": "wechat",
  "userId": "user123",
  "userEmail": "user@example.com"
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "orderId": "WM17116752000001234",
    "amount": 29,
    "paymentUrl": "https://api.xunhupay.com/payment/do.html?pid=xxx&out_trade_order=xxx...",
    "orderName": "写作大师 - 月度会员"
  }
}
```

### 2. 查询订单状态

**接口：** `GET /api/payment/order-status/:orderId`

**响应示例：**

```json
{
  "success": true,
  "data": {
    "orderId": "WM17116752000001234",
    "status": "paid",
    "planType": "monthly",
    "amount": 29,
    "paidAt": "2024-03-29T12:00:00.000Z"
  }
}
```

订单状态：
- `pending`: 待支付
- `paid`: 已支付

### 3. 获取用户订阅信息

**接口：** `GET /api/subscription/:userId`

**响应示例：**

```json
{
  "success": true,
  "data": {
    "subscription": "monthly",
    "subscriptionExpiresAt": "2024-04-28T12:00:00.000Z",
    "orderId": "WM17116752000001234",
    "paidAt": "2024-03-29T12:00:00.000Z"
  }
}
```

### 4. 支付异步通知（回调）

**接口：** `POST /api/payment/notify`

此接口由虎皮椒服务器调用，用于通知支付结果。

### 5. 测试接口

**接口：** `GET /api/payment/test`

用于测试服务是否正常运行。

## 🔐 配置说明

### 虎皮椒商户配置

1. 访问 [虎皮椒官网](https://www.xunhupay.com/) 注册账号
2. 完成实名认证
3. 进入"商户中心" → "API 设置"
4. 记录以下信息：
   - **商户 ID (pid)**
   - **API 密钥 (key)**
5. 配置异步通知地址（callback URL）

### 测试环境

虎皮椒提供测试环境，使用以下配置：

- **测试商户 ID**: `2000000000`
- **测试密钥**: `test_key_1234567890`

测试环境不会产生真实扣款，可以随意测试。

### 生产环境

1. 使用真实的商户 ID 和密钥
2. 修改 `NOTIFY_URL` 和 `RETURN_URL` 为你的域名
3. 确保服务器可以接收外网回调请求

## 🌐 前端集成

### 前端代码示例

```typescript
import axios from 'axios';

// 创建支付订单
async function createPaymentOrder(planType, paymentMethod, userId, userEmail) {
  try {
    const response = await axios.post('http://localhost:3001/api/payment/create-order', {
      planType,
      paymentMethod,
      userId,
      userEmail
    });

    if (response.data.success) {
      // 跳转到支付页面
      window.location.href = response.data.data.paymentUrl;
    }
  } catch (error) {
    console.error('创建订单失败:', error);
  }
}

// 查询订单状态
async function checkOrderStatus(orderId) {
  try {
    const response = await axios.get(`http://localhost:3001/api/payment/order-status/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('查询订单失败:', error);
  }
}

// 获取用户订阅信息
async function getUserSubscription(userId) {
  try {
    const response = await axios.get(`http://localhost:3001/api/payment/subscription/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('获取订阅信息失败:', error);
  }
}
```

## 🔍 测试支付流程

### 1. 测试创建订单

```bash
curl -X POST http://localhost:3001/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "monthly",
    "paymentMethod": "wechat",
    "userId": "test_user_123",
    "userEmail": "test@example.com"
  }'
```

### 2. 测试查询订单

```bash
curl http://localhost:3001/api/payment/order-status/WM17116752000001234
```

### 3. 测试获取订阅信息

```bash
curl http://localhost:3001/api/payment/subscription/test_user_123
```

## 📊 订单状态说明

| 状态 | 说明 | 处理方式 |
|------|------|----------|
| `pending` | 订单已创建，等待支付 | 等待用户支付 |
| `paid` | 支付成功 | 开通会员权限 |

## 🛡️ 安全说明

1. **签名验证**: 所有支付请求都经过签名验证，防止篡改
2. **回调验证**: 异步通知会验证签名，确保请求来自虎皮椒
3. **订单去重**: 防止重复处理同一订单
4. **环境隔离**: 测试和生产环境使用不同配置

## 📝 注意事项

1. **回调地址**: 生产环境必须使用 HTTPS
2. **订单超时**: 订单默认有效期为 15 分钟
3. **金额限制**: 单笔订单金额不能低于 0.01 元
4. **退款**: 如需退款，请联系虎皮椒客服

## 🆘 常见问题

### Q1: 支付成功但没有开通会员？

**A**: 可能原因：
- 异步通知未收到（检查回调地址配置）
- 签名验证失败（检查密钥配置）
- 订单状态未更新（查看日志）

### Q2: 测试环境和生产环境的区别？

**A**:
- 测试环境不会产生真实扣款
- 生产环境使用真实商户配置
- 两者的 API 密钥不同

### Q3: 如何获取真实的商户 ID 和密钥？

**A**:
1. 注册虎皮椒账号
2. 完成实名认证
3. 在"商户中心" → "API 设置"中查看

## 📞 技术支持

- 虎皮椒官网: https://www.xunhupay.com/
- 虎皮椒文档: https://www.xunhupay.com/help.html
- 虎皮椒客服: support@xunhupay.com

## 📄 许可证

MIT License
