<template>
  <view class="recharge-page">
    <view class="form-card">
      <view class="section-title">充值金额（元）</view>
      <input
        class="amount-input"
        type="digit"
        v-model="amount"
        placeholder="请输入充值金额"
        placeholder-class="input-placeholder"
      />
      <view class="amount-tip">充值后将到账至账户余额，可用于订单支付</view>
    </view>
    <view class="footer-bar">
      <button class="btn-recharge" :disabled="!canSubmit" @click="submitRecharge">确认充值</button>
    </view>
  </view>
</template>

<script>
import { payRecharge } from '@/api/pay.js'

export default {
  data() {
    return {
      amount: ''
    }
  },
  computed: {
    canSubmit() {
      const n = Number(this.amount)
      return !isNaN(n) && n > 0
    }
  },
  methods: {
    async submitRecharge() {
      if (!this.canSubmit) {
        uni.showToast({ title: '请输入有效金额', icon: 'none' })
        return
      }
      const amountYuan = Number(this.amount)
      if (amountYuan <= 0) {
        uni.showToast({ title: '充值金额须大于 0', icon: 'none' })
        return
      }
      uni.showLoading({ title: '准备支付...', mask: true })
      try {
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })
        const code = loginRes.code || ''
        if (!code) {
          uni.hideLoading()
          uni.showToast({ title: '获取登录态失败，请重试', icon: 'none' })
          return
        }
        const res = await payRecharge({
          code,
          amount: amountYuan,
          gift_type: 2,
          gift_amount: 0
        })
        uni.hideLoading()
        if (res.data && res.data.code === 0 && res.data.data) {
          const data = res.data.data
          const payParams = data.pay_params
          if (payParams && payParams.timeStamp && payParams.package && payParams.paySign) {
            uni.requestPayment({
              ...payParams,
              success: () => {
                uni.showToast({ title: '充值成功', icon: 'success' })
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              },
              fail: (err) => {
                uni.showToast({
                  title: err.errMsg || '支付取消',
                  icon: 'none'
                })
              }
            })
          } else {
            uni.showToast({
              title: (res.data && res.data.message) || '支付参数异常',
              icon: 'none'
            })
          }
        } else {
          uni.showToast({
            title: (res.data && res.data.message) || '预下单失败',
            icon: 'none'
          })
        }
      } catch (err) {
        uni.hideLoading()
        uni.showToast({
          title: (err && err.message) || '充值失败，请重试',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
  padding-bottom: 160rpx;
}
.form-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.section-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}
.amount-input {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 36rpx;
  color: #333;
  background: #f8f8f8;
  border-radius: 8rpx;
  padding: 0 24rpx;
  margin-bottom: 16rpx;
}
.input-placeholder {
  color: #999;
}
.amount-tip {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
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
.btn-recharge {
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
.btn-recharge[disabled] {
  background: #ccc;
  color: #999;
}
.btn-recharge:active:not([disabled]) {
  background: #ffa726;
}
</style>
