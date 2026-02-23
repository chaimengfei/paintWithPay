import { get, post, del } from './request'

/**
 * 获取地址列表
 * @returns {Promise}
 */
export const getAddressList = () => {
  return get('/api/address/list')
}

/**
 * 获取地址详情
 * @param {number|string} id 地址ID
 * @returns {Promise}
 */
export const getAddressDetail = (id) => {
  return get(`/api/address/detail/${id}`)
}

/**
 * 创建地址
 * @param {Object} data 地址信息
 * @param {string} data.recipient_name 收货人姓名
 * @param {string} data.recipient_phone 收货人电话
 * @param {string} data.province 省
 * @param {string} data.city 市
 * @param {string} data.district 区
 * @param {string} data.detail 详细地址
 * @param {boolean} [data.is_default] 是否默认
 * @returns {Promise}
 */
export const createAddress = (data) => {
  return post('/api/address/create', { data })
}

/**
 * 设置默认地址
 * @param {number|string} id 地址ID
 * @returns {Promise}
 */
export const setDefaultAddress = (id) => {
  return post(`/api/address/set_default/${id}`)
}

/**
 * 更新地址
 * @param {Object} data 要更新的字段（含 address_id）
 * @param {number} data.address_id 地址ID
 * @param {string} [data.recipient_name]
 * @param {string} [data.recipient_phone]
 * @param {string} [data.province]
 * @param {string} [data.city]
 * @param {string} [data.district]
 * @param {string} [data.detail]
 * @param {boolean} [data.is_default]
 * @returns {Promise}
 */
export const updateAddress = (data) => {
  return post('/api/address/update', { data })
}

/**
 * 删除地址
 * @param {number|string} id 地址ID
 * @returns {Promise}
 */
export const deleteAddress = (id) => {
  return del(`/api/address/delete/${id}`)
}
