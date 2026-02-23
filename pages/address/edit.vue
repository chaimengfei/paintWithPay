<template>
  <view class="container">
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input
          class="input"
          v-model="form.recipient_name"
          placeholder="请输入收货人姓名"
          placeholder-class="placeholder"
        />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input
          class="input"
          type="number"
          maxlength="11"
          v-model="form.recipient_phone"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
        />
      </view>
      <view class="form-item">
        <text class="label">省市区</text>
        <input
          class="input"
          v-model="regionText"
          placeholder="请输入省、市、区"
          placeholder-class="placeholder"
          @click="showRegionPicker = true"
        />
      </view>
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          class="textarea"
          v-model="form.detail"
          placeholder="街道、楼栋、门牌等"
          placeholder-class="placeholder"
          maxlength="200"
        />
      </view>
      <view class="form-item row-item">
        <text class="label">设为默认地址</text>
        <switch :checked="form.is_default" @change="onDefaultChange" color="#4169E1" />
      </view>
    </view>
    <view class="footer-bar">
      <button class="btn-primary" @click="submit">保存</button>
    </view>
  </view>
</template>

<script>
import { getAddressDetail, createAddress, updateAddress } from '@/api/address.js'

export default {
  data() {
    return {
      id: '',
      form: {
        recipient_name: '',
        recipient_phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        is_default: false
      },
      showRegionPicker: false
    }
  },
  computed: {
    regionText() {
      const { province, city, district } = this.form
      return [province, city, district].filter(Boolean).join(' ')
    }
  },
  onLoad(options) {
    this.id = options.id || ''
    if (this.id) {
      this.loadDetail()
    }
  },
  methods: {
    async loadDetail() {
      try {
        const res = await getAddressDetail(this.id)
        if (res.data && res.data.code === 0 && res.data.data) {
          const d = res.data.data
          this.form = {
            recipient_name: d.recipient_name || '',
            recipient_phone: d.recipient_phone || '',
            province: d.province || '',
            city: d.city || '',
            district: d.district || '',
            detail: d.detail || '',
            is_default: !!d.is_default
          }
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    onDefaultChange(e) {
      this.form.is_default = e.detail.value
    },
    async submit() {
      const { recipient_name, recipient_phone, province, city, district, detail, is_default } = this.form
      if (!recipient_name || !recipient_name.trim()) {
        uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
        return
      }
      if (!recipient_phone || !/^1\d{10}$/.test(recipient_phone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
        return
      }
      if (!detail || !detail.trim()) {
        uni.showToast({ title: '请输入详细地址', icon: 'none' })
        return
      }
      const payload = {
        recipient_name: recipient_name.trim(),
        recipient_phone: recipient_phone.trim(),
        province: province || '',
        city: city || '',
        district: district || '',
        detail: detail.trim(),
        is_default: !!is_default
      }
      uni.showLoading({ title: '保存中...', mask: true })
      try {
        if (this.id) {
          const res = await updateAddress({ address_id: Number(this.id), ...payload })
          if (res.data && res.data.code === 0) {
            uni.hideLoading()
            uni.showToast({ title: '保存成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            uni.hideLoading()
            uni.showToast({ title: (res.data && res.data.message) || '保存失败', icon: 'none' })
          }
        } else {
          const res = await createAddress(payload)
          if (res.data && res.data.code === 0) {
            uni.hideLoading()
            uni.showToast({ title: '添加成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            uni.hideLoading()
            uni.showToast({ title: (res.data && res.data.message) || '添加失败', icon: 'none' })
          }
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}
.form {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.form-item.row-item {
  justify-content: space-between;
}
.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}
.input,
.textarea {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.textarea {
  min-height: 120rpx;
  padding: 0;
}
.placeholder {
  color: #ccc;
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
