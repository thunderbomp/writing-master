// API 配置
const API_BASE_URL = 'http://localhost:3001';

// 支付相关接口
export interface PaymentOrder {
  orderId: string;
  amount: number;
  paymentUrl: string;
  orderName: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'paid';
  planType: 'monthly' | 'yearly';
  amount: number;
  paidAt?: string;
}

export interface SubscriptionInfo {
  subscription: 'free' | 'monthly' | 'yearly';
  subscriptionExpiresAt: string | null;
  orderId?: string;
  paidAt?: string;
}

// 创建支付订单
export async function createPaymentOrder(params: {
  planType: 'monthly' | 'yearly';
  paymentMethod: 'wechat' | 'alipay';
  userId: string;
  userEmail?: string;
}): Promise<{ success: boolean; data: PaymentOrder }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('创建订单失败:', error);
    throw error;
  }
}

// 查询订单状态
export async function getOrderStatus(orderId: string): Promise<OrderStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/order-status/${orderId}`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('查询订单失败:', error);
    throw error;
  }
}

// 获取用户订阅信息
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/subscription/${userId}`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取订阅信息失败:', error);
    throw error;
  }
}

// 测试支付服务
export async function testPaymentService(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/test`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('测试支付服务失败:', error);
    return { success: false, message: '支付服务不可用' };
  }
}
