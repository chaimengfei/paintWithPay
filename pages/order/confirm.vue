<template>
  <view class="confirm-container">
    <view v-if="order" class="content">
      <view class="section card">
        <view class="order-no">订单号：{{ order.order_no }}</view>
      </view>

      <view class="section card address-section" v-if="order.address_info">
        <view class="section-title">收货信息</view>
        <view class="address-row">
          <text class="name">{{ order.address_info.recipient_name }}</text>
          <text class="phone">{{ order.address_info.recipient_phone }}</text>
        </view>
        <view class="address-detail">{{ fullAddress }}</view>
      </view>

      <view class="section card">
        <view class="section-title">商品清单</view>
        <view
          v-for="item in (order.items || [])"
          :key="item.id"
          class="item-row"
        >
          <image class="item-image" :src="item.product_image" mode="aspectFill" />
          <view class="item-info">
            <text class="item-name">{{ item.product_name }}</text>
            <view class="item-meta">
              <text class="item-price">¥{{ formatAmount(item.unit_price) }}</text>
              <text class="item-qty">×{{ item.quantity }}</text>
            </view>
          </view>
          <text class="item-total">¥{{ formatAmount(item.total_price) }}</text>
        </view>
      </view>

      <view class="section card total-section">
        <view class="total-row">
          <text class="total-label">应付金额</text>
          <text class="total-value">¥{{ formatAmount(order.payment_amount) }}</text>
        </view>
      </view>
    </view>

    <view class="footer-bar">
      <button class="btn-pay" @click="goPay">去支付</button>
      <button class="btn-later" @click="goSuccessLater">稍后支付</button>
    </view>
  </view>
</template>

<script>
import { payCombined } from '@/api/pay.js'

export default {
  data() {
    return {
      order: null
    }
  },
  computed: {
    fullAddress() {
      if (!this.order || !this.order.address_info) return ''
      const a = this.order.address_info
      return [a.province, a.city, a.district, a.detail].filter(Boolean).join(' ')
    }
  },
  onLoad() {
    const raw = uni.getStorageSync('orderConfirmData')
    if (raw) {
      try {
        this.order = typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (e) {
        uni.showToast({ title: '订单数据异常', icon: 'none' })
      }
    }
    if (!this.order || !this.order.order_no) {
      uni.showToast({ title: '缺少订单信息', icon: 'none' })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/cart/index' })
      }, 1500)
    }
  },
  methods: {
    // 金额统一为元，直接格式化
    formatAmount(v) {
      const n = Number(v)
      return isNaN(n) ? '0.00' : n.toFixed(2)
    },
    goPay() {
      if (!this.order || !this.order.order_no) return
      uni.showLoading({ title: '支付中...', mask: true })
      // 组合支付接口要求：有微信支付部分时需传 code（wx.login 返回）
      uni.login({
        provider: 'weixin',
        success: (loginRes) => {
          const code = loginRes.code || ''
          const paymentAmount = Number(this.order.payment_amount)
          const payload = {
            order_no: this.order.order_no,
            code: code
          }
          if (paymentAmount > 0) payload.total = paymentAmount
          payCombined(payload)
            .then(res => {
              uni.hideLoading()
              if (res.data && res.data.code === 0) {
                const data = res.data.data
                if (data && data.wechat_pay_params && data.wechat_amount > 0) {
                  uni.requestPayment({
                    ...data.wechat_pay_params,
                    success: () => {
                      uni.removeStorageSync('orderConfirmData')
                      uni.redirectTo({
                        url: `/pages/order/success?order_no=${encodeURIComponent(this.order.order_no)}&order_info=${encodeURIComponent('订单已创建，请支付或联系客服')}`
                      })
                    },
                    fail: (err) => {
                      uni.showToast({
                        title: err.errMsg || '支付取消',
                        icon: 'none'
                      })
                    }
                  })
                } else {
                  uni.removeStorageSync('orderConfirmData')
                  uni.redirectTo({
                    url: `/pages/order/success?order_no=${encodeURIComponent(this.order.order_no)}&order_info=${encodeURIComponent('订单已创建，请支付或联系客服')}`
                  })
                }
              } else {
                uni.showToast({
                  title: (res.data && res.data.message) || '支付请求失败',
                  icon: 'none'
                })
              }
            })
            .catch(err => {
              uni.hideLoading()
              uni.showToast({
                title: (err && err.message) || '支付失败，请重试',
                icon: 'none'
              })
            })
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '获取登录态失败，请重试', icon: 'none' })
        }
      })
    },
    goSuccessLater() {
      if (!this.order || !this.order.order_no) return
      uni.removeStorageSync('orderConfirmData')
      uni.redirectTo({
        url: `/pages/order/success?order_no=${encodeURIComponent(this.order.order_no)}&order_info=${encodeURIComponent('订单已创建，请支付或联系客服')}`
      })
    }
  }
}
</script>

<style scoped>
.confirm-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 180rpx;
}
.content {
  padding: 20rpx;
}
.section {
  margin-bottom: 20rpx;
}
.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}
.order-no {
  font-size: 26rpx;
  color: #666;
}
.address-row {
  margin-bottom: 8rpx;
}
.address-row .name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}
.address-row .phone {
  font-size: 26rpx;
  color: #666;
}
.address-detail {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}
.item-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.item-row:last-child {
  border-bottom: none;
}
.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-meta {
  font-size: 24rpx;
  color: #999;
}
.item-price {
  margin-right: 12rpx;
}
.item-total {
  font-size: 28rpx;
  font-weight: bold;
  color: #e93b3d;
  flex-shrink: 0;
}
.total-section {
  margin-top: 8rpx;
}
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-label {
  font-size: 28rpx;
  color: #333;
}
.total-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #e93b3d;
}
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.btn-pay {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #ffb74d;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
}
.btn-pay:active {
  background: #ffa726;
}
.btn-later {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #fff;
  color: #666;
  font-size: 28rpx;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
}
</style>
