const baseURL = process.env.NODE_ENV === 'development' ? '/api' : 'https://your-production-server.com/api'

function getToken(): string {
  return uni.getStorageSync('token') || ''
}

export async function get(url: string, params?: Record<string, any>): Promise<any> {
  const fullUrl = params ? `${baseURL}${url}?${new URLSearchParams(params)}` : `${baseURL}${url}`
  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // Token expired or invalid
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({ title: '请重新登录', icon: 'none' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('Unauthorized'))
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

export async function post(url: string, data?: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${baseURL}${url}`,
      method: 'POST',
      data,
      header: {
        'Authorization': `Bearer ${getToken()}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // Token expired or invalid
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({ title: '请重新登录', icon: 'none' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('Unauthorized'))
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function logout(): void {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  uni.showToast({ title: '已退出登录', icon: 'success' })
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' })
  }, 1500)
}