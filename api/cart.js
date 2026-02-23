import { get, post, del } from './request'

/**
 * 获取购物车列表
 * @returns {Promise}
 */
export const getCartList = () => {
  return get('/api/cart/list')
}

/**
 * 加入购物车
 * @param {Object} data
 * @param {number} data.product_id 商品ID
 * @param {number} [data.quantity=1] 数量
 * @param {number} [data.shop_id] 店铺ID（可选，后端可能按用户默认店铺）
 * @returns {Promise}
 */
export const addToCart = (data) => {
  return post('/api/cart/add', data)
}

/**
 * 更新购物车项
 * @param {Object} data
 * @param {number} data.cart_id 购物车项ID
 * @param {number} data.quantity 数量
 * @returns {Promise}
 */
export const updateCartItem = (data) => {
  return post('/api/cart/update', data)
}

/**
 * 删除购物车项
 * @param {number|string} id 购物车项ID
 * @returns {Promise}
 */
export const deleteCartItem = (id) => {
  return del(`/api/cart/delete/${id}`)
}
