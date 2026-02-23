import { get } from './request'

/**
 * 获取店铺列表
 * @returns {Promise}
 */
export const getShopList = () => {
  return get('/api/shop/list', {}, false)
}
