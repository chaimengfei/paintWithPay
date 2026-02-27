<script>
import { ENV_INFO } from '@/api/common.js'
import { trySilentLogin } from '@/api/silentLogin.js'

export default {
  onLaunch: function() {
    this.checkEnvConsistency()
    this.tryRestoreLoginOnLaunch()
    this.checkGlobalLoginStatus()
  },
  onShow: function() {
  },
  onHide: function() {
  },
  methods: {
    // 启动时若无 token 则尝试静默登录（仅 code 复登），实现多日未打开也能恢复登录
    tryRestoreLoginOnLaunch() {
      const token = uni.getStorageSync('token')
      if (token) return
      trySilentLogin().then(() => {
        // 静默登录成功，token 已写入 storage，后续请求会自动带 token
      })
    },
    // 检查环境一致性
    checkEnvConsistency() {
      const storedEnv = uni.getStorageSync('env')
      const currentEnv = ENV_INFO.env // 从 api/common.js 导入的当前环境
      
      if (storedEnv && storedEnv !== currentEnv) {
        // 环境已切换，清除所有登录相关缓存
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('hasStoredUserInfo')
        uni.removeStorageSync('env') // 清除旧的环境标识
      } else if (!storedEnv) {
        // 检查是否有旧版本的 token（有 token 但没有环境标识）
        const token = uni.getStorageSync('token')
        if (token) {
          // 检测到旧版本登录（有 token 但没有环境标识）
          
          // 先检查是否之前登录过（在清除之前检查）
          const hasStoredUserInfo = uni.getStorageSync('hasStoredUserInfo')
          
          // 清除登录数据
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.removeStorageSync('hasStoredUserInfo')
          
          // 提示用户重新登录
          uni.showModal({
            title: hasStoredUserInfo ? '登录已过期' : '提示',
            content: hasStoredUserInfo 
              ? '检测到旧版本登录信息，需要重新登录' 
              : '检测到旧版本登录信息，需要重新登录',
            confirmText: '去登录',
            cancelText: '稍后',
            showCancel: true,
            success: (res) => {
              if (res.confirm) {
                // 用户确认，跳转到登录页
                uni.navigateTo({
                  url: '/pages/user/login'
                })
              } else {
                // 用户取消，显示提示
                uni.showToast({
                  title: '部分功能需要登录后使用',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
      }
    },
    
    // 检查全局登录状态
    checkGlobalLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        // token已存储在本地，各个API会在调用时自动获取并添加到请求头
      }
    }
  }
}
</script>

<style>
/* 每个页面公共css */
page {
  height: 100%;
  box-sizing: border-box;
}
</style>