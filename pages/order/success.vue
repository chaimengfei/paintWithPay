<template>
  <view class="success-container">
    <view class="nav-bar">
      <view class="nav-back" @click.stop="navigateBack" @tap.stop="navigateBack">
        <image src="/static/images/back.png" mode="aspectFit" class="back-icon"/>
      </view>
    </view>
    <view class="success-header">
      <view class="success-icon">
        <view class="icon-circle">
          <text class="checkmark">✓</text>
        </view>
      </view>
      <text class="success-title">提交成功</text>
      <text class="success-subtitle">{{ orderInfo || '订单已创建，请支付或联系客服' }}</text>
    </view>

    <view class="action-buttons">
      <button class="view-detail-btn" hover-class="view-detail-btn-hover" @click="viewOrderDetail">查看订单</button>
      <button class="contact-service-btn" @click="contactService">联系客服</button>
    </view>
  </view>
</template>

<script>
import { showContactService } from '@/api/common.js'

export default {
  data() {
    return {
      orderNo: '',
      orderInfo: ''
    }
  },
  onLoad(options) {
    if (options.order_no) {
      this.orderNo = decodeURIComponent(options.order_no)
    }
    if (options.order_info) {
      this.orderInfo = decodeURIComponent(options.order_info)
    }
  },
  methods: {
    navigateBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    },
    viewOrderDetail() {
      if (this.orderNo) {
        uni.redirectTo({
          url: `/pages/order/detail?order_no=${encodeURIComponent(this.orderNo)}`
        })
      } else {
        uni.navigateTo({
          url: '/pages/order/index'
        })
      }
    },
    contactService() {
      showContactService()
    }
  }
}
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  padding-top: calc(env(safe-area-inset-top) + 108rpx);
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  border-bottom: 1rpx solid #f1f1f1;
  z-index: 999;
  box-sizing: border-box;
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
.success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 80rpx 40rpx 60rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}
.success-icon {
  margin-bottom: 40rpx;
}
.icon-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: #4169E1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkmark {
  color: #fff;
  font-size: 96rpx;
  font-weight: bold;
  line-height: 1;
}
.success-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}
.success-subtitle {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}
.action-buttons {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 40rpx;
}
.view-detail-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  background-color: #4169E1;
  color: #fff;
  border: none;
}
.view-detail-btn-hover {
  background-color: #3151B8;
}
.contact-service-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  background-color: #fff;
  color: #333;
  border: 1rpx solid #ddd;
}
</style>
