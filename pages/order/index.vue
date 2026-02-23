<template>
  <view class="container">
    <scroll-view class="order-list" scroll-y>
      <view v-if="orders.length > 0">
        <view
          v-for="order in orders"
          :key="order.id"
          class="order-item"
          @click="viewOrderDetail(order.order_no)"
        >
          <view class="order-header">
            <text class="order-no">{{ order.order_no }}</text>
            <text class="time-value">{{ formatTime(order.created_at) }}</text>
          </view>

          <view class="order-body">
            <view v-if="order.items && order.items.length > 0">
              <view v-for="item in getDisplayItems(order.items)" :key="item.id" class="order-product">
                <image class="product-image" :src="item.product_image || '/static/images/empty-inquiry.png'" mode="aspectFill" />
                <view class="product-info">
                  <view class="product-name-wrapper">
                    <text class="product-name">{{ item.product_name }}</text>
                    <view class="price-quantity">
                      <text class="product-price">¥{{ priceYuan(item.unit_price) }}</text>
                      <text class="product-quantity">×{{ item.quantity }}</text>
                    </view>
                  </view>
                </view>
              </view>
              <view v-if="order.items.length > 2" class="more-products-tip">
                <text class="more-text">还有 {{ order.items.length - 2 }} 件商品，点击查看详情</text>
              </view>
            </view>
          </view>

          <view class="order-footer">
            <view class="total-amount">
              <text class="amount-label">实付：</text>
              <text class="amount-value">¥{{ priceYuan(order.payment_amount) }}</text>
            </view>
            <view class="order-status-text">{{ orderStatusText(order.order_status) }}</view>
            <view class="action-buttons">
              <button
                class="action-btn view-quote-btn"
                @click.stop="viewOrderDetail(order.order_no)"
              >
                查看详情
              </button>
              <button
                class="action-btn contact-btn"
                @click.stop="contactService"
              >
                联系客服
              </button>
            </view>
          </view>
        </view>

        <view class="load-more" v-if="hasMore">
          {{ loading ? '加载中...' : '上拉加载更多' }}
        </view>
        <view class="load-more" v-else-if="orders.length > 0">
          没有更多了
        </view>
      </view>

      <view v-else class="empty-order">
        <image src="/static/images/empty-inquiry.png" mode="aspectFit"></image>
        <text class="tip">暂无订单</text>
        <button class="btn" @click="goToIndex">去逛逛</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrderList } from '@/api/order.js'
import { showContactService } from '@/api/common.js'

export default {
  data() {
    return {
      orders: [],
      page: 1,
      pageSize: 10,
      loading: false,
      hasMore: true,
      status: 0
    }
  },
  onLoad() {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showModal({
        title: '提示',
        content: '您还未登录，是否注册登录？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: '/pages/user/login' })
          } else {
            this.orders = []
          }
        }
      })
      return
    }
    this.loadOrders()
  },
  onShow() {
    const token = uni.getStorageSync('token')
    if (!token) {
      this.orders = []
      return
    }
    this.refreshOrders()
  },
  onReachBottom() {
    if (!this.loading && this.hasMore) {
      this.loadOrders()
    }
  },
  methods: {
    priceYuan(fen) {
      const n = Number(fen)
      return isNaN(n) ? '0.00' : (n / 100).toFixed(2)
    },
    orderStatusText(orderStatus) {
      if (orderStatus === 1) return '待付款'
      if (orderStatus === 2) return '已完成'
      return '未知'
    },
    async loadOrders() {
      if (this.loading || !this.hasMore) return
      this.loading = true
      try {
        const res = await getOrderList({
          status: this.status,
          page: this.page,
          page_size: this.pageSize
        })
        const data = res.data
        if (data && data.code === 0 && data.data) {
          const list = data.data.list || []
          const total = data.data.total || 0
          if (this.page === 1) {
            this.orders = list
          } else {
            this.orders = [...this.orders, ...list]
          }
          this.hasMore = list.length >= this.pageSize && this.orders.length < total
          this.page++
        } else {
          if (this.page === 1) this.orders = []
        }
      } catch (err) {
        uni.showToast({ title: err.message || '获取订单列表失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async refreshOrders() {
      this.page = 1
      this.hasMore = true
      this.orders = []
      await this.loadOrders()
    },
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      return `${y}/${m}/${d} ${h}:${min}`
    },
    contactService() {
      showContactService()
    },
    getDisplayItems(items) {
      if (!items || items.length === 0) return []
      return items.slice(0, 2)
    },
    goToIndex() {
      uni.switchTab({ url: '/pages/index/index' })
    },
    viewOrderDetail(orderNo) {
      uni.navigateTo({
        url: `/pages/order/detail?order_no=${encodeURIComponent(orderNo)}`
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.order-list {
  flex: 1;
  overflow: hidden;
}
.order-item {
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.order-header {
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.order-no {
  font-size: 26rpx;
  color: #666;
  font-weight: bold;
  margin-right: 10rpx;
}
.time-value {
  font-size: 24rpx;
  color: #666;
  font-weight: normal;
}
.order-body {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.order-product {
  display: flex;
  margin-bottom: 20rpx;
}
.order-product:last-child {
  margin-bottom: 0;
}
.more-products-tip {
  padding: 15rpx 0;
  text-align: center;
  border-top: 1rpx dashed #e5e5e5;
  margin-top: 15rpx;
  background-color: #fafafa;
  border-radius: 8rpx;
}
.more-text {
  font-size: 24rpx;
  color: #666;
}
.product-image {
  width: 280rpx;
  height: 240rpx;
  border-radius: 8rpx;
  margin-right: 30rpx;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 30rpx;
}
.product-name-wrapper {
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: 8rpx;
  line-height: 1.4;
}
.product-name {
  font-size: 32rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  padding-right: 120rpx;
}
.price-quantity {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  position: absolute;
  right: 0;
  bottom: -12rpx;
}
.product-price {
  font-size: 28rpx;
  color: #e93b3d;
  font-weight: bold;
}
.product-quantity {
  font-size: 24rpx;
  color: #666;
  margin-left: 4rpx;
}
.order-footer {
  padding-top: 20rpx;
}
.order-status-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}
.total-amount {
  display: block;
  text-align: right;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}
.amount-label {
  color: #666;
}
.amount-value {
  color: #e93b3d;
  font-weight: bold;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}
.action-btn {
  height: 60rpx;
  line-height: 60rpx;
  font-size: 26rpx;
  padding: 0 30rpx;
  border-radius: 30rpx;
  border: none;
}
.view-quote-btn {
  background-color: transparent;
  color: #333;
  border: 1rpx solid #ddd;
}
.contact-btn {
  background-color: #ffd700;
  color: #333;
  border: none;
}
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
}
.empty-order image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
}
.tip {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}
.btn {
  width: 200rpx;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #e93b3d;
  color: #fff;
  font-size: 28rpx;
  border: none;
  border-radius: 35rpx;
}
.load-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
}
</style>
