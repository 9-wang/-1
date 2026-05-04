<template>
  <view class="page">
    <view class="header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="logo-section">
          <view class="logo"><text>🏥</text></view>
          <view class="brand">
            <text class="brand-title">亚健康助手</text>
            <text class="brand-subtitle">AI驱动的健康筛查与干预</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <view class="intro-card">
        <text class="intro-icon">📋</text>
        <view class="intro-text">
          <text class="intro-title">匿名健康筛查</text>
          <text class="intro-desc">3分钟完成全面健康评估，获取个性化健康建议</text>
        </view>
      </view>

      <view class="features">
        <view class="feature-item" v-for="(feature, index) in features" :key="index">
          <text class="feature-icon">{{ feature.icon }}</text>
          <text class="feature-name">{{ feature.name }}</text>
        </view>
      </view>

      <view class="quick-actions">
        <view class="action-btn screen-btn" @click="startScreen">
          <text class="action-icon">✅</text>
          <view class="action-info">
            <text class="action-title">开始筛查</text>
            <text class="action-desc">8道题，3分钟完成</text>
          </view>
          <text class="action-arrow">→</text>
        </view>

        <view class="action-btn camera-btn" @click="recognizeFood">
          <text class="action-icon">📷</text>
          <view class="action-info">
            <text class="action-title">拍照识餐</text>
            <text class="action-desc">AI识别食物营养成分</text>
          </view>
          <text class="action-arrow">→</text>
        </view>
      </view>

      <view class="stats-card">
        <view class="stats-header">
          <text class="stats-title">今日筛查数据</text>
          <text class="stats-date">{{ todayDate }}</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ stats.total }}</text>
            <text class="stat-label">总筛查人数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value healthy">{{ stats.healthy }}</text>
            <text class="stat-label">健康人数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value warning">{{ stats.subhealthy }}</text>
            <text class="stat-label">亚健康人数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value danger">{{ stats.risk }}</text>
            <text class="stat-label">高危人数</text>
          </view>
        </view>
      </view>
    </view>
    
    <TabBar ref="tabBarRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, ref as vueRef } from 'vue'
import TabBar from '@/components/TabBar.vue'

const tabBarRef = vueRef<InstanceType<typeof TabBar> | null>(null)

const features = [
  { icon: '🧠', name: 'AI智能研判' },
  { icon: '📊', name: '多维健康分析' },
  { icon: '💡', name: '个性化建议' },
  { icon: '🔒', name: '数据安全保密' }
]

const stats = ref({ total: 1256, healthy: 456, subhealthy: 680, risk: 120 })

const todayDate = computed(() => {
  const date = new Date()
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

function startScreen() {
  uni.navigateTo({ url: '/pages/index/screen' })
}

function recognizeFood() {
  uni.chooseImage({
    count: 1,
    success: () => {
      uni.showToast({ title: '识别成功', icon: 'success' })
    }
  })
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #f5f7fa; }

.header {
  position: relative;
  padding-top: 100rpx;
  padding-bottom: 80rpx;
  
  .header-bg {
    position: absolute;
    top: 0; left: 0; right: 0; height: 400rpx;
    background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .header-content { position: relative; z-index: 1; padding: 0 32rpx; }
  
  .logo-section { display: flex; align-items: center; gap: 24rpx; }
  
  .logo {
    width: 120rpx; height: 120rpx;
    background: rgba(255,255,255,0.2);
    border-radius: 32rpx; display: flex; align-items: center; justify-content: center;
    font-size: 60rpx;
  }
  
  .brand { display: flex; flex-direction: column; }
  
  .brand-title { font-size: 44rpx; font-weight: 700; color: #fff; }
  
  .brand-subtitle { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; }
}

.content { padding: 0 24rpx 160rpx; margin-top: -40rpx; position: relative; z-index: 1; }

.intro-card {
  background: #fff; border-radius: 32rpx; padding: 32rpx;
  display: flex; align-items: center; gap: 24rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
  
  .intro-icon { font-size: 64rpx; }
  
  .intro-text { flex: 1; display: flex; flex-direction: column; }
  
  .intro-title { font-size: 36rpx; font-weight: 600; color: #1f2937; }
  
  .intro-desc { font-size: 24rpx; color: #6b7280; margin-top: 8rpx; }
}

.features {
  display: flex; justify-content: space-between; margin-top: 24rpx;
  padding: 24rpx; background: #fff; border-radius: 24rpx;
  
  .feature-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
  
  .feature-icon { font-size: 40rpx; }
  
  .feature-name { font-size: 22rpx; color: #6b7280; }
}

.quick-actions { margin-top: 24rpx; display: flex; flex-direction: column; gap: 16rpx; }

.action-btn {
  background: #fff; border-radius: 24rpx; padding: 24rpx;
  display: flex; align-items: center; gap: 24rpx;
  
  &.screen-btn {
    background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
    .action-title, .action-desc { color: #fff; }
  }
  
  .action-icon {
    width: 80rpx; height: 80rpx;
    background: rgba(255,255,255,0.2);
    border-radius: 16rpx; display: flex; align-items: center; justify-content: center;
    font-size: 36rpx;
  }
  
  .action-info { flex: 1; display: flex; flex-direction: column; }
  
  .action-title { font-size: 32rpx; font-weight: 600; color: #1f2937; }
  
  .action-desc { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; }
  
  .action-arrow { font-size: 36rpx; color: #9ca3af; }
}

.stats-card {
  margin-top: 24rpx; background: #fff; border-radius: 24rpx; padding: 24rpx;
  
  .stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
  
  .stats-title { font-size: 32rpx; font-weight: 600; color: #1f2937; }
  
  .stats-date { font-size: 24rpx; color: #9ca3af; }
  
  .stats-grid { display: flex; justify-content: space-between; }
  
  .stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; }
  
  .stat-value {
    font-size: 44rpx; font-weight: 700; color: #1f2937;
    &.healthy { color: #34a853; }
    &.warning { color: #fbbc05; }
    &.danger { color: #ea4335; }
  }
  
  .stat-label { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; }
}
</style>
