<template>
	<view class="container">
		<!-- 收货地址区域：有地址点进列表，无地址点进新增 -->
		<view class="header address-header" @click="selectedAddress ? goAddressList() : goAddAddress()">
			<view v-if="selectedAddress" class="address-content">
				<view class="address-row">
					<text class="address-name">{{ selectedAddress.recipient_name }}</text>
					<text class="address-phone">{{ selectedAddress.recipient_phone }}</text>
				</view>
				<view class="address-detail">{{ selectedAddress.fullAddress }}</view>
				<view class="address-arrow">›</view>
			</view>
			<view v-else class="address-empty">
				<text class="address-empty-icon">📍</text>
				<view class="address-empty-text">
					<text class="address-empty-tip">您还没有收货地址</text>
					<text class="address-empty-action">点击新增地址</text>
				</view>
				<text class="address-arrow">›</text>
			</view>
		</view>

		<view class="list-title" v-if="cartItems.length > 0">
			<text>购物车</text>
		</view>

		<view v-if="cartItems.length > 0">
			<view v-for="item in cartItems" :key="item.id" class="cart-item">
				<view class="item-left">
					<checkbox :checked="item.selected" @click="toggleSelect(item)" />
					<image class="product-image" :src="item.product_image" mode="aspectFill" />
				</view>
				<view class="item-right">
					<view class="product-name-wrapper">
						<text class="product-name">{{ item.product_name }}</text>
						<text v-if="item.product_specification" class="product-specification">{{ item.product_specification }}</text>
					</view>
					<view class="price-container">
						<text class="price-label">单价：</text>
						<text class="product-price">¥{{ priceYuan(item.product_seller_price) }}</text>
						<text class="product-unit">/ {{ item.product_unit || '件' }}</text>
					</view>
					<view v-if="item.message" class="item-message">{{ item.message }}</view>
					<view class="quantity-control">
						<button class="btn-minus" :disabled="!item.can_purchase" @click="changeQuantity(item, -1)">-</button>
						<input
							class="quantity-input"
							type="digit"
							:value="item.quantity"
							:disabled="!item.can_purchase"
							@blur="onQuantityInputBlur(item, $event)"
							@input="onQuantityInput(item, $event)"
						/>
						<button class="btn-plus" :disabled="!item.can_purchase" @click="changeQuantity(item, 1)">+</button>
					</view>
					<button class="delete-btn" @click="deleteItem(item)">删除</button>
				</view>
			</view>

			<view class="submit-bar">
				<view class="select-all">
					<checkbox :checked="isAllSelected" @click="toggleSelectAll" />
					<text>全选</text>
				</view>
				<view class="total-info">
					<view class="total-row">
						<text class="total-label">合计：</text>
						<text class="total-price">¥{{ totalPrice }}</text>
					</view>
					<text class="total-tip">金额单位：元（支付以实际为准）</text>
				</view>
				<button
					class="submit-btn"
					@click="handleSubmit"
					@tap="handleSubmit"
					type="button"
				>
					去结算
				</button>
			</view>
		</view>

		<view v-else class="empty-cart">
			<image src="/static/images/empty-inquiry.png" mode="aspectFit"></image>
			<text class="tip">购物车还是空的</text>
			<button class="btn" @click="goToIndex">去逛逛</button>
		</view>
	</view>
</template>

<script>
	import {
		getCartList,
		updateCartItem,
		deleteCartItem
	} from '@/api/cart.js'
	import { orderCheckout } from '@/api/order.js'
	import { getAddressList } from '@/api/address.js'

	export default {
		data() {
			return {
				cartItems: [],
				addressList: [],
				selectedAddress: null
			}
		},
		onShow() {
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.showModal({
					title: '提示',
					content: '您还未登录，是否注册登录？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pages/user/login' })
						} else {
							this.cartItems = []
							this.selectedAddress = null
						}
					}
				})
				return
			}
			this.loadCartData()
			this.loadAddressList()
		},
		computed: {
			isAllSelected() {
				return this.cartItems.length > 0 && this.cartItems.every(item => item.selected)
			},
			totalPrice() {
				const total = this.cartItems
					.filter(item => item.selected)
					.reduce((sum, item) => sum + (this.priceFen(item.product_seller_price) || 0) * Number(item.quantity), 0)
				return (total / 100).toFixed(2)
			},
			selectedCartIds() {
				return this.cartItems
					.filter(item => item.selected)
					.map(item => item.id)
			}
		},
		methods: {
			priceFen(v) {
				if (v == null || v === '') return 0
				return Number(v)
			},
			priceYuan(v) {
				const n = this.priceFen(v)
				return n ? (n / 100).toFixed(2) : '0.00'
			},
			async loadCartData() {
				try {
					const res = await getCartList()
					if (res.data && res.data.code === 0) {
						const list = res.data.data
						this.cartItems = (Array.isArray(list) ? list : []).map(item => ({
							...item,
							product_specification: item.product_specification || item.specification || item.spec || null,
							selected: item.selected === true || item.selected === 1,
							product_seller_price: item.product_seller_price != null ? item.product_seller_price : 0
						}))
						this.updateCartBadge()
					} else {
						this.cartItems = []
					}
				} catch (err) {
					uni.showToast({ title: '获取购物车失败', icon: 'none' })
				}
			},
			updateCartBadge() {
				try {
					const count = this.cartItems.length
					if (count > 0) {
						uni.setTabBarBadge({ index: 2, text: String(count) })
					} else {
						uni.removeTabBarBadge({ index: 2 })
					}
				} catch (e) {}
			},
			async loadAddressList() {
				try {
					const res = await getAddressList()
					if (res.data && res.data.code === 0) {
						const raw = res.data.data
						const list = Array.isArray(raw) ? raw : (raw && raw.list ? raw.list : [])
						this.addressList = list.map(addr => ({
							...addr,
							address_id: addr.address_id != null ? addr.address_id : addr.id,
							fullAddress: [addr.province, addr.city, addr.district, addr.detail].filter(Boolean).join(' ')
						}))
						// 默认地址优先，否则取第一个
						const defaultAddr = this.addressList.find(a => a.is_default === true || a.is_default === 1)
						this.selectedAddress = defaultAddr || this.addressList[0] || null
					} else {
						this.addressList = []
						this.selectedAddress = null
					}
				} catch (e) {
					this.addressList = []
					this.selectedAddress = null
				}
			},
			goAddressList() {
				uni.navigateTo({
					url: '/pages/address/list?from=cart'
				})
			},
			goAddAddress() {
				uni.navigateTo({
					url: '/pages/address/edit'
				})
			},
			goToIndex() {
				uni.switchTab({ url: '/pages/index/index' })
			},
			handleSubmit(e) {
				if (e) {
					e.stopPropagation && e.stopPropagation()
					e.preventDefault && e.preventDefault()
				}
				this.submitCheckout()
			},
			submitCheckout() {
				const cartIds = this.selectedCartIds
				if (!cartIds || cartIds.length === 0) {
					uni.showToast({ title: '请至少选择一件商品', icon: 'none' })
					return
				}
				// 只结算可购买项
				const cannotPurchase = this.cartItems.filter(item => item.selected && item.can_purchase === false)
				if (cannotPurchase.length > 0) {
					uni.showToast({ title: '请移除不可购买的商品后再结算', icon: 'none' })
					return
				}
				// 有选中地址则传给后端，不传则使用默认地址
				const payload = { cart_ids: cartIds }
				if (this.selectedAddress && this.selectedAddress.address_id) {
					payload.address_id = this.selectedAddress.address_id
				}
				uni.showLoading({ title: '提交中...', mask: true })
				orderCheckout(payload)
					.then(res => {
						uni.hideLoading()
						if (res.data && res.data.code === 0) {
							const orderNo = res.data.data && res.data.data.order_no
							if (orderNo) {
								uni.redirectTo({
									url: `/pages/order/success?order_no=${encodeURIComponent(orderNo)}&order_info=订单已创建，请支付或联系客服`
								})
							} else {
								uni.showToast({ title: res.data.message || '提交成功', icon: 'none' })
								this.loadCartData()
							}
						} else {
							uni.showToast({ title: (res.data && res.data.message) || '提交失败', icon: 'none' })
						}
					})
					.catch(err => {
						uni.hideLoading()
						uni.showToast({ title: (err && err.message) || '提交失败，请重试', icon: 'none' })
					})
			},
			toggleSelect(item) {
				item.selected = !item.selected
			},
			toggleSelectAll() {
				const next = !this.isAllSelected
				this.cartItems.forEach(item => { item.selected = next })
			},
			async changeQuantity(item, delta) {
				const newQty = Number(item.quantity) + delta
				if (newQty < 0.01) return
				await this.updateQuantity(item, newQty)
			},
			onQuantityInput(item, event) {
				const val = event.detail.value
				if (val === '' || /^\d*\.?\d*$/.test(val)) {
					item.quantity = val === '' ? 1 : (parseFloat(val) || 1)
				}
			},
			async onQuantityInputBlur(item, event) {
				let newQty = parseFloat(event.detail.value) || 1
				if (newQty < 0.01) {
					newQty = 1
					item.quantity = 1
				}
				await this.updateQuantity(item, newQty)
			},
			async updateQuantity(item, newQuantity) {
				try {
					const res = await updateCartItem({ cart_id: item.id, quantity: newQuantity })
					if (res.data && res.data.code === 0) {
						item.quantity = newQuantity
						this.updateCartBadge()
					} else {
						uni.showToast({ title: (res.data && res.data.message) || '修改数量失败', icon: 'none' })
						this.loadCartData()
					}
				} catch (err) {
					uni.showToast({ title: (err.data && err.data.message) || '修改数量失败', icon: 'none' })
					this.loadCartData()
				}
			},
			async deleteItem(item) {
				try {
					const res = await deleteCartItem(item.id)
					if (res.data && res.data.code === 0) {
						this.cartItems = this.cartItems.filter(c => c.id !== item.id)
						this.updateCartBadge()
						uni.showToast({ title: '删除成功', icon: 'success' })
					} else {
						uni.showToast({ title: (res.data && res.data.message) || '删除失败', icon: 'none' })
					}
				} catch (err) {
					uni.showToast({ title: '删除失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 120rpx;
	}
	.address-header {
		padding: 24rpx;
		background-color: #fff;
		margin-bottom: 16rpx;
		border-radius: 0 0 16rpx 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
	}
	.address-content {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		position: relative;
		padding-right: 40rpx;
	}
	.address-row {
		width: 100%;
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}
	.address-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-right: 20rpx;
	}
	.address-phone {
		font-size: 26rpx;
		color: #666;
	}
	.address-detail {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		flex: 1;
	}
	.address-arrow {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		font-size: 36rpx;
		color: #999;
	}
	.address-empty {
		display: flex;
		align-items: center;
		padding: 16rpx 0;
	}
	.address-empty-icon {
		font-size: 40rpx;
		margin-right: 20rpx;
	}
	.address-empty-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}
	.address-empty-tip {
		font-size: 28rpx;
		color: #666;
	}
	.address-empty-action {
		font-size: 26rpx;
		color: #4169E1;
	}
	.address-empty .address-arrow {
		position: static;
		transform: none;
	}
	.list-title {
		padding: 20rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		font-size: 28rpx;
		font-weight: bold;
	}
	.cart-item {
		display: flex;
		padding: 20rpx;
		margin: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	.item-left {
		display: flex;
		align-items: center;
	}
	.product-image {
		width: 200rpx;
		height: 200rpx;
		margin-left: 30rpx;
		border-radius: 8rpx;
	}
	.item-right {
		flex: 1;
		margin-left: 30rpx;
		display: flex;
		flex-direction: column;
	}
	.product-name-wrapper {
		display: flex;
		align-items: baseline;
		margin-bottom: 10rpx;
		line-height: 1.4;
	}
	.product-name {
		font-size: 28rpx;
	}
	.product-specification {
		font-size: 22rpx;
		color: #666;
		margin-left: 8rpx;
		font-weight: normal;
	}
	.price-container {
		display: flex;
		align-items: baseline;
		margin-bottom: 10rpx;
	}
	.item-message {
		font-size: 22rpx;
		color: #e93b3d;
		margin-bottom: 10rpx;
	}
	.product-price {
		font-size: 32rpx;
		color: #e93b3d;
		font-weight: bold;
	}
	.product-unit {
		font-size: 22rpx;
		color: #333;
		margin-left: 0;
	}
	.price-label {
		color: #666;
		font-size: 24rpx;
		margin-right: 4rpx;
	}
	.quantity-control {
		display: flex;
		align-items: center;
		margin-bottom: 15rpx;
	}
	.quantity-control button {
		width: 50rpx;
		height: 50rpx;
		line-height: 50rpx;
		text-align: center;
		padding: 0;
		font-size: 30rpx;
		background-color: #f5f5f5;
		border-radius: 4rpx;
	}
	.quantity-control button:disabled {
		background-color: #e0e0e0;
		color: #666;
		opacity: 0.6;
	}
	.quantity-input {
		margin: 0 20rpx;
		width: 80rpx;
		height: 50rpx;
		text-align: center;
		font-size: 28rpx;
		border: 1rpx solid #e0e0e0;
		border-radius: 4rpx;
		background-color: #fff;
	}
	.quantity-input:disabled {
		background-color: #f5f5f5;
		color: #666;
	}
	.delete-btn {
		background-color: #f5f5f5;
		color: #666;
		height: 50rpx;
		line-height: 50rpx;
		font-size: 24rpx;
		border-radius: 25rpx;
	}
	.submit-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		border-top: 1rpx solid #eee;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	.select-all {
		display: flex;
		align-items: center;
	}
	.select-all text {
		margin-left: 10rpx;
		font-size: 28rpx;
	}
	.total-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		margin-bottom: 10rpx;
	}
	.total-row {
		display: flex;
		align-items: baseline;
		margin-bottom: 4rpx;
	}
	.total-label {
		font-size: 26rpx;
		color: #333;
		margin-right: 4rpx;
	}
	.total-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #e93b3d;
	}
	.total-tip {
		font-size: 22rpx;
		color: #666;
		line-height: 1.4;
	}
	.submit-btn {
		background-color: #4169E1;
		color: white;
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 30rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		font-weight: bold;
		width: 100%;
		border: none;
	}
	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 100rpx;
	}
	.empty-cart image {
		width: 300rpx;
		height: 300rpx;
		margin-bottom: 40rpx;
	}
	.tip {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 40rpx;
	}
	.btn {
		background-color: #4169E1;
		color: white;
		width: 200rpx;
		height: 70rpx;
		line-height: 70rpx;
		font-size: 28rpx;
		border-radius: 35rpx;
	}
</style>
