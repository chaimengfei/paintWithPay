<template>
  <view class="order-detail-container">
    <view class="nav-bar">
      <view class="nav-back" @click.stop="navigateBack" @tap.stop="navigateBack">
        <image src="/static/images/back.png" mode="aspectFit" class="back-icon"/>
      </view>
      <text class="nav-title">订单详情</text>
    </view>

    <view class="order-card">
      <view class="order-header">
        <view class="order-no-wrapper">
          <text class="order-no">订单号：{{ order.order_no }}</text>
        </view>
        <text class="order-status">{{ orderStatusText }}</text>
      </view>

      <view class="product-list">
        <view class="section-title">商品信息</view>
        <view v-for="item in order.items" :key="item.id" class="product-item">
          <image class="product-image" :src="item.product_image || '/static/images/empty-inquiry.png'" mode="aspectFill"/>
          <view class="product-info">
            <view class="product-name-wrapper">
              <text class="product-name">{{ item.product_name }}</text>
              <view class="price-line">
                <text class="product-price">¥{{ priceYuan(item.unit_price) }}</text>
                <text v-if="item.unit" class="product-unit">/{{ item.unit }}</text>
                <text class="product-quantity">×{{ item.quantity }}</text>
              </view>
            </view>
            <view class="total-price">
              <text class="total-price-text">小计: ¥{{ priceYuan(item.total_price) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="order-info" v-if="order.receiver_name || order.receiver_phone || order.receiver_address">
        <view class="section-title">收货信息</view>
        <view class="info-row">
          <text class="info-label">收货人</text>
          <text class="info-value">{{ order.receiver_name }} {{ order.receiver_phone }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">地址</text>
          <text class="info-value">{{ order.receiver_address }}</text>
        </view>
      </view>

      <view class="order-info">
        <view class="info-row">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ formatTime(order.created_at) }}</text>
        </view>
      </view>

      <view class="amount-summary">
        <view class="amount-row total-row">
          <text>实付金额</text>
          <text>¥{{ priceYuan(order.payment_amount) }}</text>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="action-btn share-btn" open-type="share">分享</button>
      <button class="action-btn contact-btn" @click="contactService">联系客服</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { getOrderDetail } from '@/api/order.js'
import { showContactService } from '@/api/common.js'

const order = ref({
  items: [],
  order_no: '',
  total_amount: 0,
  payment_amount: 0,
  created_at: '',
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  order_status: 0
})

function priceYuan(fen) {
  const n = Number(fen)
  return isNaN(n) ? '0.00' : (n / 100).toFixed(2)
}

const loadOrderData = async (orderNo) => {
  try {
    const res = await getOrderDetail(orderNo)
    const data = res.data
    if (data && data.code === 0 && data.data) {
      order.value = {
        ...data.data,
        items: (data.data.items || []).map(item => ({
          ...item,
          unit_price: item.unit_price != null ? item.unit_price : 0,
          total_price: item.total_price != null ? item.total_price : 0
        }))
      }
    }
  } catch (err) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad((options) => {
  const orderNo = options.order_no
  if (orderNo) {
    loadOrderData(decodeURIComponent(orderNo))
  } else {
    uni.showToast({ title: '订单号缺失', icon: 'none' })
  }
})

onShareAppMessage(() => ({
  title: `订单详情 - ${order.value.order_no || ''}`,
  path: `/pages/order/detail?order_no=${encodeURIComponent(order.value.order_no || '')}`,
  imageUrl: ''
}))

const orderStatusText = computed(() => {
  const s = order.value.order_status
  if (s === 1) return '待付款'
  if (s === 2) return '已完成'
  return '未知'
})

const navigateBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

const formatTime = (timeStr) => {
  return timeStr ? new Date(timeStr).toLocaleString() : ''
}

const contactService = () => {
  showContactService()
}
</script>

<style scoped>
.order-detail-container {
  padding-bottom: 100rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
}
.nav-bar {
  height: 88rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  padding-top: calc(env(safe-area-inset-top) + 30rpx);
  padding-bottom: 20rpx;
  background-color: #fff;
  position: relative;
  border-bottom: 1rpx solid #f1f1f1;
  z-index: 999;
}
.nav-back {
  width: 100rpx;
  height: 100rpx;
  min-width: 100rpx;
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1000;
  padding: 25rpx;
  margin-left: -25rpx;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  background-color: #f5f5f5;
  border-radius: 50%;
}
.back-icon {
  width: 50rpx;
  height: 50rpx;
  pointer-events: none;
}
.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 34rpx;
  font-weight: 500;
}
.order-card {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
}
.order-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx dashed #eee;
  margin-bottom: 20rpx;
}
.order-no-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}
.order-no {
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
}
.order-status {
  color: #e93b3d;
  font-size: 28rpx;
  font-weight: bold;
}
.section-title {
  font-size: 28rpx;
  color: #333;
  margin: 20rpx 0;
  font-weight: bold;
}
.product-item {
  display: flex;
  margin-bottom: 30rpx;
}
.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.product-name-wrapper {
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: 8rpx;
  line-height: 1.4;
}
.product-name {
  font-size: 28rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  padding-right: 120rpx;
}
.price-line {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  position: absolute;
  right: 0;
  bottom: 0;
}
.product-price {
  color: #e93b3d;
  font-size: 30rpx;
  font-weight: bold;
}
.product-quantity {
  color: #666;
  font-size: 24rpx;
}
.product-unit {
  color: #666;
  font-size: 24rpx;
}
.total-price {
  margin-top: 8rpx;
}
.total-price-text {
  font-size: 24rpx;
  color: #666;
}
.order-info {
  margin-top: 40rpx;
  border-top: 1rpx dashed #eee;
  padding-top: 20rpx;
}
.info-row {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}
.info-label {
  width: 160rpx;
  color: #666;
}
.info-value {
  flex: 1;
}
.amount-summary {
  margin-top: 30rpx;
  border-top: 1rpx dashed #eee;
  padding-top: 20rpx;
}
.amount-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15rpx;
  font-size: 28rpx;
}
.total-row {
  font-weight: bold;
  color: #e93b3d;
  margin-top: 10rpx;
  font-size: 32rpx;
}
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.05);
  gap: 20rpx;
}
.action-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  border: none;
  text-align: center;
}
.share-btn {
  background-color: #ff9500;
  color: #fff;
}
.contact-btn {
  background-color: #fff;
  color: #666;
  border: 1rpx solid #ddd;
}
</style>
