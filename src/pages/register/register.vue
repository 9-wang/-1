<template>
  <view class="register-page">
    <view class="register-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="logo"><text>🏥</text></view>
        <text class="title">创建账号</text>
        <text class="subtitle">加入我们，开启健康管理</text>
      </view>
    </view>

    <view class="register-form">
      <view class="form-item">
        <text class="label">用户名</text>
        <input 
          class="input" 
          v-model="form.username" 
          placeholder="请输入用户名（2-20位）"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">昵称</text>
        <input 
          class="input" 
          v-model="form.nickname" 
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <input 
          class="input" 
          v-model="form.password" 
          placeholder="请输入密码（6-20位）"
          password
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="label">确认密码</text>
        <input 
          class="input" 
          v-model="form.confirmPassword" 
          placeholder="请再次输入密码"
          password
          maxlength="20"
        />
      </view>

      <view class="error-msg" v-if="errorMsg">{{ errorMsg }}</view>

      <view class="register-btn" :class="{ active: canSubmit }" @click="handleRegister">
        <text>注 册</text>
      </view>

      <view class="login-link" @click="goToLogin">
        <text>已有账号？立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const form = ref({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const errorMsg = ref('')

const canSubmit = computed(() => {
  return form.value.username.trim() && 
         form.value.nickname.trim() && 
         form.value.password && 
         form.value.confirmPassword
})

async function handleRegister() {
  if (!canSubmit.value) return
  
  errorMsg.value = ''
  
  // Validation
  if (form.value.username.trim().length < 2) {
    errorMsg.value = '用户名至少2位'
    return
  }
  
  if (form.value.password.length < 6) {
    errorMsg.value = '密码至少6位'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = '两次密码不一致'
    return
  }
  
  try {
    const result = await uni.request({
      url: '/api/auth/register',
      method: 'POST',
      data: {
        username: form.value.username.trim(),
        nickname: form.value.nickname.trim(),
        password: form.value.password
      }
    })
    
    const data = result.data as any
    
    if (data.code === 0) {
      uni.showToast({
        title: '注册成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      errorMsg.value = data.msg || '注册失败'
    }
  } catch {
    errorMsg.value = '网络错误，请稍后重试'
  }
}

function goToLogin() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.register-header {
  position: relative;
  padding-top: 100rpx;
  padding-bottom: 60rpx;
  
  .header-bg {
    position: absolute;
    top: 0; left: 0; right: 0; height: 380rpx;
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
      width: 140rpx; height: 140rpx;
      background: rgba(255,255,255,0.2);
      border-radius: 36rpx;
      display: flex; align-items: center; justify-content: center;
      font-size: 72rpx;
      margin-bottom: 20rpx;
    }
    
    .title {
      font-size: 44rpx;
      font-weight: 700;
      color: #fff;
    }
    
    .subtitle {
      font-size: 26rpx;
      color: rgba(255,255,255,0.8);
      margin-top: 10rpx;
    }
  }
}

.register-form {
  margin: -30rpx 32rpx 0;
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
  
  .form-item {
    margin-bottom: 28rpx;
    
    .label {
      font-size: 28rpx;
      color: #1f2937;
      font-weight: 500;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .input {
      height: 84rpx;
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
    margin-bottom: 20rpx;
  }
  
  .register-btn {
    height: 92rpx;
    background: #e5e7eb;
    border-radius: 46rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
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
  
  .login-link {
    text-align: center;
    margin-top: 28rpx;
    
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