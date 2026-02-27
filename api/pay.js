import { post } from './request'

/**
 * 支付确认（余额+线下，取消微信后使用）
 * @param {Object} data
 * @param {string} data.order_no 订单号
 * @param {number} [data.balance_amount] 使用余额金额（元）
 * @param {number} [data.offline_amount] 线下支付金额（元）
 * @returns {Promise}
 */
export const payConfirm = (data) => {
  return post('/api/pay/confirm', data)
}

/**
 * 组合支付（余额+微信，后端自动判断）
 * @param {Object} data
 * @param {string} data.order_no 订单号（必填）
 * @param {string} [data.code] 微信 wx.login 返回的 code（有微信支付部分时必填）
 * @param {number} [data.total] 应付总额（元），用于校验，不传则按订单应付金额
 * @param {string} [data.note] 订单备注
 * @returns {Promise}
 */
export const payCombined = (data) => {
  return post('/api/pay/combined', data)
}

/**
 * 小程序充值预下单（微信支付）
 * @param {Object} data
 * @param {string} data.code 微信 wx.login 返回的 code（必填）
 * @param {number} data.amount 充值金额（元），必须大于 0
 * @param {number} [data.gift_type] 赠送类型：1-额外赠送余额, 2-送虚拟物品
 * @param {number} [data.gift_amount] 赠送金额（元），gift_type=1 时必填
 * @returns {Promise} 返回 data.pay_params 用于 uni.requestPayment
 */
export const payRecharge = (data) => {
  return post('/api/pay/recharge', data)
}
