import { get, post, del } from './request'

/**
 * 订单结算（创建订单）
 * @param {Object} data
 * @param {number[]} [data.cart_ids] 购物车ID列表（从购物车创建时使用）
 * @param {number} [data.product_id] 商品ID（立即购买时使用）
 * @param {number} [data.quantity] 数量（立即购买时使用）
 * @param {number} [data.address_id] 收货地址ID（不传则使用默认地址）
 * @param {string} [data.remark] 订单备注
 * @returns {Promise}
 */
export const orderCheckout = (data) => {
  return post('/api/order/checkout', data)
}

/**
 * 获取订单列表
 * @param {Object} [params]
 * @param {number} [params.status] 0-全部 1-待付款 2-已完成
 * @param {number} [params.page=1]
 * @param {number} [params.page_size=10]
 * @param {number} [params.start_time] Unix 秒
 * @param {number} [params.end_time] Unix 秒
 * @returns {Promise}
 */
export const getOrderList = (params = {}) => {
  return get('/api/order/list', params)
}

/**
 * 获取订单详情
 * @param {string} orderNo 订单号
 * @returns {Promise}
 */
export const getOrderDetail = (orderNo) => {
  return get('/api/order/detail', { order_no: orderNo })
}

/**
 * 删除订单（软删除）
 * @param {string} orderNo 订单号（必填，query 以 order_no 为准）
 * @param {number|string} [id=0] 路径占位，可传 0
 * @returns {Promise}
 */
export const deleteOrder = (orderNo, id = 0) => {
  return del(`/api/order/delete/${id}?order_no=${encodeURIComponent(orderNo)}`)
}

/**
 * 再次购买（将订单商品加入购物车）
 * @param {string} orderNo 订单号
 * @returns {Promise}
 */
export const orderRebuy = (orderNo) => {
  return post(`/api/order/rebuy?order_no=${encodeURIComponent(orderNo)}`)
}
