<template>
  <view class="container">
    <view v-if="list.length > 0" class="address-list">
      <view
        v-for="item in list"
        :key="item.address_id || item.id"
        class="address-card"
        :class="{ default: item.is_default }"
      >
        <view class="card-main">
          <view class="row name-row">
            <text class="name">{{ item.recipient_name }}</text>
            <text class="phone">{{ item.recipient_phone }}</text>
            <text v-if="item.is_default" class="default-tag">默认</text>
          </view>
          <view class="row detail-row">{{ item.fullAddress }}</view>
        </view>
        <view class="card-actions">
          <button class="btn-text" @click="setDefault(item)">设为默认</button>
          <button class="btn-text" @click="edit(item)">编辑</button>
          <button class="btn-text danger" @click="remove(item)">删除</button>
        </view>
      </view>
    </view>
    <view v-else class="empty">
      <text class="empty-tip">暂无收货地址</text>
      <button class="btn-add" @click="add">新增收货地址</button>
    </view>
    <view class="footer-bar">
      <button class="btn-primary" @click="add">新增收货地址</button>
    </view>
  </view>
</template>

<script>
import { getAddressList, setDefaultAddress, deleteAddress } from '@/api/address.js'

export default {
  data() {
    return {
      list: [],
      from: ''
    }
  },
  onLoad(options) {
    this.from = options.from || ''
  },
  onShow() {
    this.loadList()
  },
  methods: {
    async loadList() {
      try {
        const res = await getAddressList()
        if (res.data && res.data.code === 0) {
          const raw = res.data.data
          const arr = Array.isArray(raw) ? raw : (raw && raw.list ? raw.list : [])
          this.list = arr.map(addr => ({
            ...addr,
            address_id: addr.address_id != null ? addr.address_id : addr.id,
            fullAddress: [addr.province, addr.city, addr.district, addr.detail].filter(Boolean).join(' ')
          }))
        } else {
          this.list = []
        }
      } catch (e) {
        this.list = []
      }
    },
    add() {
      uni.navigateTo({ url: '/pages/address/edit' })
    },
    edit(item) {
      uni.navigateTo({
        url: `/pages/address/edit?id=${item.address_id || item.id}`
      })
    },
    async setDefault(item) {
      const id = item.address_id || item.id
      if (!id) return
      try {
        const res = await setDefaultAddress(id)
        if (res.data && res.data.code === 0) {
          uni.showToast({ title: '已设为默认', icon: 'success' })
          this.loadList()
        } else {
          uni.showToast({ title: (res.data && res.data.message) || '设置失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '设置失败', icon: 'none' })
      }
    },
    remove(item) {
      const id = item.address_id || item.id
      if (!id) return
      uni.showModal({
        title: '提示',
        content: '确定删除该地址吗？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            const r = await deleteAddress(id)
            if (r.data && r.data.code === 0) {
              uni.showToast({ title: '已删除', icon: 'success' })
              this.loadList()
            } else {
              uni.showToast({ title: (r.data && r.data.message) || '删除失败', icon: 'none' })
            }
          } catch (e) {
            uni.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}
.address-list {
  padding: 20rpx;
}
.address-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.address-card.default {
  border-left: 4rpx solid #4169E1;
}
.card-main {
  margin-bottom: 20rpx;
}
.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}
.phone {
  font-size: 26rpx;
  color: #666;
  margin-right: 16rpx;
}
.default-tag {
  font-size: 22rpx;
  color: #4169E1;
  background: #e8eeff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}
.detail-row {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #eee;
}
.btn-text {
  font-size: 26rpx;
  color: #4169E1;
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
}
.btn-text.danger {
  color: #e93b3d;
}
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}
.empty-tip {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}
.btn-add {
  width: 320rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #4169E1;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
}
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.06);
}
.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #4169E1;
  color: #fff;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;
}
</style>
