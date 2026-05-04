<template>
  <view class="login-page">
    <view class="login-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="logo"><text>🏥</text></view>
        <text class="title">亚健康助手</text>
        <text class="subtitle">登录账号，开启健康之旅</text>
      </view>
    </view>

    <view class="login-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="form.username" 
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="form.password" 
          placeholder="请输入密码"
          password
          maxlength="20"
        />
      </view>

      <view class="error-msg" v-if="errorMsg">{{ errorMsg }}</view>

      <view class="login-btn" :class="{ active: canSubmit }" @click="handleLogin">
        <text>登 录</text>
      </view>

      <view class="register-link" @click="goToRegister">
        <text>还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const form = ref({
  username: '',
  password: ''
})

const errorMsg = ref('')

const canSubmit = computed(() => {
  return form.value.username.trim() && form.value.password.trim()
})

async function handleLogin() {
  if (!canSubmit.value) return
  
  errorMsg.value = ''
  
  try {
    const result = await uni.request({
      url: '/api/auth/login',
      method: 'POST',
      data: {
        username: form.value.username.trim(),
        password: form.value.password
      }
    })
    
    const data = result.data as any
    
    if (data.code === 0) {
      // Save token
      uni.setStorageSync('token', data.data.token)
      uni.setStorageSync('userInfo', data.data.user)
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/profile/profile' })
      }, 1500)
    } else {
      errorMsg.value = data.msg || '登录失败'
    }
  } catch {
    errorMsg.value = '网络错误，请稍后重试'
  }
}

function goToRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.login-header {
  position: relative;
  padding-top: 120rpx;
  padding-bottom: 80rpx;
  
  .header-bg {
    position: absolute;
    top: 0; left: 0; right: 0; height: 400rpx;
    background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .logo {
      width: 160rpx; height: 160rpx;
      background: rgba(255,255,255,0.2);
      border-radius: 40rpx;
      display: flex; align-items: center; justify-content: center;
      font-size: 80rpx;
      margin-bottom: 24rpx;
    }
    
    .title {
      font-size: 48rpx;
      font-weight: 700;
      color: #fff;
    }
    
    .subtitle {
      font-size: 28rpx;
      color: rgba(255,255,255,0.8);
      margin-top: 12rpx;
    }
  }
}

.login-form {
  margin: -40rpx 32rpx 0;
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
  
  .form-item {
    margin-bottom: 32rpx;
    
    .label {
      font-size: 28rpx;
      color: #1f2937;
      font-weight: 500;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .input {
      height: 88rpx;
      background: #f5f7fa;
      border-radius: 16rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #1f2937;
    }
  }
  
  .error-msg {
    color: #ea4335;
    font-size: 24rpx;
    text-align: center;
    margin-bottom: 24rpx;
  }
  
  .login-btn {
    height: 96rpx;
    background: #e5e7eb;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 48rpx;
    transition: all 0.3s ease;
    
    text {
      font-size: 32rpx;
      font-weight: 600;
      color: #9ca3af;
    }
    
    &.active {
      background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
      
      text { color: #fff; }
      
      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }
    }
  }
  
  .register-link {
    text-align: center;
    margin-top: 32rpx;
    
    text {
      font-size: 26rpx;
      color: #1a73e8;
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style>