<template>
  <view class="profile-page">
    <view class="profile-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="user-info" v-if="isLoggedIn">
          <view class="avatar-wrapper">
            <view class="avatar"><text>👤</text></view>
            <view class="edit-avatar">📷</view>
          </view>
          <view class="user-detail">
            <text class="user-name">{{ userInfo.nickname || userInfo.username || '健康用户' }}</text>
            <text class="user-id">ID: {{ userInfo.id || '88888888' }}</text>
          </view>
        </view>
        
        <view class="user-info" v-else @click="goToLogin">
          <view class="avatar-wrapper">
            <view class="avatar"><text>👤</text></view>
          </view>
          <view class="user-detail">
            <text class="user-name">点击登录</text>
            <text class="user-id">登录后享受更多功能</text>
          </view>
          <text class="login-arrow">→</text>
        </view>
        
        <view class="stats-row" v-if="isLoggedIn">
          <view class="stat-box">
            <text class="stat-value">{{ screenCount }}</text>
            <text class="stat-label">筛查次数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-box">
            <text class="stat-value">{{ avgScore }}</text>
            <text class="stat-label">平均评分</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-box">
            <text class="stat-value">{{ adviceCount }}</text>
            <text class="stat-label">健康建议</text>
          </view>
        </view>
      </view>
    </view>

    <view class="profile-content">
      <view class="section" v-if="isLoggedIn">
        <view class="section-header">
          <text class="section-title">健康档案</text>
          <text class="section-arrow">→</text>
        </view>
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in records" :key="index">
            <view class="record-date">
              <text class="date-month">{{ record.month }}</text>
              <text class="date-day">{{ record.day }}</text>
            </view>
            <view class="record-info">
              <text class="record-score" :style="{ color: getScoreColor(record.score) }">{{ record.score }}分</text>
              <text class="record-status">{{ record.status }}</text>
            </view>
            <text class="record-trend" :class="record.trend">{{ record.trend === 'up' ? '↑' : record.trend === 'down' ? '↓' : '→' }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="menu-list">
          <view class="menu-item" v-for="(menu, index) in menuItems" :key="index" @click="handleMenuClick(menu)">
            <text class="menu-icon">{{ menu.icon }}</text>
            <text class="menu-name">{{ menu.name }}</text>
            <text class="menu-desc">{{ menu.desc }}</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="menu-list">
          <view class="menu-item" v-for="(menu, index) in settingItems" :key="index" @click="handleMenuClick(menu)">
            <text class="menu-icon">{{ menu.icon }}</text>
            <text class="menu-name">{{ menu.name }}</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="isLoggedIn">
        <view class="menu-list">
          <view class="menu-item logout-item" @click="handleLogout">
            <text class="menu-icon">🚪</text>
            <text class="menu-name">退出登录</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="version-info">
        <text class="version-text">亚健康助手 v1.0.0</text>
        <text class="copyright">© 2024 健康科技</text>
      </view>
    </view>
    
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { isLoggedIn, logout } from '@/utils/request'

const screenCount = ref(5)
const avgScore = ref(78)
const adviceCount = ref(23)
const userInfo = ref<any>({})

onMounted(() => {
  checkLoginStatus()
})

function checkLoginStatus() {
  const loggedIn = isLoggedIn()
  if (loggedIn) {
    const storedUserInfo = uni.getStorageSync('userInfo')
    if (storedUserInfo) {
      userInfo.value = storedUserInfo
    }
  }
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
      }
    }
  })
}

const records = ref([
  { month: '4月', day: '28', score: 72, status: '轻度亚健康', trend: 'up' },
  { month: '4月', day: '20', score: 68, status: '轻度亚健康', trend: 'up' },
  { month: '4月', day: '12', score: 65, status: '轻度亚健康', trend: 'down' },
  { month: '4月', day: '5', score: 70, status: '轻度亚健康', trend: '→' }
])

const menuItems = [
  { icon: '📊', name: '健康报告', desc: '查看详细健康分析报告', path: '/pages/profile/report' },
  { icon: '🏃', name: '运动计划', desc: '个性化运动建议', path: '/pages/profile/exercise' },
  { icon: '🥗', name: '饮食推荐', desc: '营养均衡食谱', path: '/pages/profile/food' },
  { icon: '👥', name: '健康社区', desc: '与其他用户交流', path: '/pages/profile/community' }
]

const settingItems = [
  { icon: '🔔', name: '消息通知' },
  { icon: '🔒', name: '隐私设置' },
  { icon: '📱', name: '设备管理' },
  { icon: 'ℹ️', name: '关于我们' }
]

function getScoreColor(score: number) {
  if (score >= 80) return '#34a853'
  if (score >= 60) return '#fbbc05'
  return '#ea4335'
}

function handleMenuClick(menu: { name: string; path?: string }) {
  if (!isLoggedIn() && menu.path) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1500)
    return
  }
  
  if (menu.path) {
    uni.navigateTo({ url: menu.path })
  } else {
    uni.showToast({ title: `${menu.name}功能开发中`, icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.profile-page { min-height: 100vh; background: #f5f7fa; }

.profile-header {
  position: relative; padding-top: 80rpx; padding-bottom: 32rpx;
  
  .header-bg {
    position: absolute; top: 0; left: 0; right: 0; height: 400rpx;
    background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .header-content { position: relative; z-index: 1; padding: 0 32rpx; }
  
  .user-info { display: flex; align-items: center; gap: 24rpx; }
  
  .avatar-wrapper { position: relative; }
  
  .avatar {
    width: 160rpx; height: 160rpx; background: rgba(255,255,255,0.2);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 80rpx;
  }
  
  .edit-avatar {
    position: absolute; bottom: 0; right: 0; width: 48rpx; height: 48rpx;
    background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 24rpx;
  }
  
  .user-detail { display: flex; flex-direction: column; }
  
  .user-name { font-size: 44rpx; font-weight: 700; color: #fff; }
  
  .user-id { font-size: 22rpx; color: rgba(255,255,255,0.7); margin-top: 8rpx; }
  
  .stats-row {
    display: flex; justify-content: space-around; margin-top: 32rpx;
    background: rgba(255,255,255,0.15); border-radius: 24rpx; padding: 24rpx;
    
    .stat-box { display: flex; flex-direction: column; align-items: center; }
    
    .stat-value { font-size: 44rpx; font-weight: 700; color: #fff; }
    
    .stat-label { font-size: 22rpx; color: rgba(255,255,255,0.8); margin-top: 4rpx; }
    
    .stat-divider { width: 1rpx; background: rgba(255,255,255,0.3); }
  }
}

.profile-content { padding: 0 24rpx 160rpx; margin-top: -40rpx; position: relative; z-index: 1; }

.section {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .section-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
  }
  
  .section-title { font-size: 32rpx; font-weight: 600; color: #1f2937; }
  
  .section-arrow { font-size: 36rpx; color: #9ca3af; }
}

.record-list { display: flex; flex-direction: column; gap: 16rpx; }

.record-item {
  display: flex; align-items: center; gap: 24rpx; padding: 16rpx;
  background: #f5f7fa; border-radius: 16rpx;
  
  .record-date { display: flex; flex-direction: column; align-items: center; }
  
  .date-month { font-size: 22rpx; color: #9ca3af; }
  
  .date-day { font-size: 36rpx; font-weight: 700; color: #1f2937; }
  
  .record-info { flex: 1; display: flex; flex-direction: column; }
  
  .record-score { font-size: 32rpx; font-weight: 600; }
  
  .record-status { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; }
  
  .record-trend { font-size: 36rpx; font-weight: 600; &.up { color: #34a853; } &.down { color: #ea4335; } & { color: #9ca3af; } }
}

.menu-list { display: flex; flex-direction: column; }

.menu-item {
  display: flex; align-items: center; gap: 24rpx; padding: 24rpx 0;
  
  &:not(:last-child) { border-bottom: 1rpx solid #e5e7eb; }
  
  .menu-icon {
    width: 64rpx; height: 64rpx; background: rgba(26,115,232,0.1);
    border-radius: 16rpx; display: flex; align-items: center; justify-content: center;
    font-size: 32rpx;
  }
  
  .menu-name { flex: 1; font-size: 28rpx; color: #1f2937; }
  
  .menu-desc { font-size: 22rpx; color: #9ca3af; margin-right: 16rpx; }
  
  .menu-arrow { font-size: 32rpx; color: #9ca3af; }
}

.version-info {
  display: flex; flex-direction: column; align-items: center; padding: 48rpx;
  
  .version-text { font-size: 22rpx; color: #9ca3af; }
  
  .copyright { font-size: 22rpx; color: #9ca3af; margin-top: 8rpx; }
}
</style>
