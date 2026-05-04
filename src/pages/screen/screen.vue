<template>
  <view class="screen-page">
    <view class="screen-header">
      <view class="header-top">
        <text class="header-title">校园健康数据大屏</text>
        <text class="header-time">{{ currentTime }}</text>
      </view>
      <view class="header-stats">
        <view class="stat-card main">
          <text class="stat-icon">👥</text>
          <view class="stat-content">
            <text class="stat-value">{{ totalStudents }}</text>
            <text class="stat-label">在校学生</text>
          </view>
        </view>
        <view class="stat-card">
          <text class="stat-icon">✅</text>
          <view class="stat-content">
            <text class="stat-value healthy">{{ healthyCount }}</text>
            <text class="stat-label">健康人数</text>
          </view>
        </view>
        <view class="stat-card">
          <text class="stat-icon">⚠️</text>
          <view class="stat-content">
            <text class="stat-value warning">{{ subHealthCount }}</text>
            <text class="stat-label">亚健康人数</text>
          </view>
        </view>
        <view class="stat-card">
          <text class="stat-icon">🚨</text>
          <view class="stat-content">
            <text class="stat-value danger">{{ riskCount }}</text>
            <text class="stat-label">高危人数</text>
          </view>
        </view>
      </view>
    </view>

    <view class="screen-body">
      <view class="left-panel">
        <view class="panel-card">
          <text class="panel-title">健康分布</text>
          <view class="distribution-chart">
            <view class="pie-chart">
              <view class="pie-center">
                <text class="pie-total">{{ totalStudents }}</text>
                <text class="pie-label">总人数</text>
              </view>
            </view>
            <view class="legend-list">
              <view class="legend-item" v-for="(item, index) in legendItems" :key="index">
                <view class="legend-dot" :class="item.class"></view>
                <text class="legend-text">{{ item.label }}</text>
                <text class="legend-value">{{ item.value }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="panel-card">
          <text class="panel-title">近期筛查趋势</text>
          <view class="trend-chart">
            <view class="chart-bars">
              <view class="bar-item" v-for="(item, index) in trendData" :key="index">
                <view class="bar-fill" :style="{ height: `${(item.value / maxTrendValue) * 100}%` }"></view>
                <text class="bar-label">{{ item.label }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="right-panel">
        <view class="panel-card">
          <text class="panel-title">健康维度排行</text>
          <view class="dimension-ranking">
            <view class="ranking-item" v-for="(item, index) in dimensionData" :key="index">
              <view class="ranking-number">{{ index + 1 }}</view>
              <view class="ranking-info">
                <text class="ranking-name">{{ item.name }}</text>
                <view class="ranking-bar">
                  <view class="ranking-fill" :style="{ width: `${item.score}%` }" :class="getScoreClass(item.score)"></view>
                </view>
              </view>
              <text class="ranking-score" :class="getScoreClass(item.score)">{{ item.score }}</text>
            </view>
          </view>
        </view>

        <view class="panel-card">
          <text class="panel-title">高频健康问题</text>
          <view class="issue-list">
            <view class="issue-item" v-for="(issue, index) in healthIssues" :key="index">
              <text class="issue-icon">{{ issue.icon }}</text>
              <view class="issue-info">
                <text class="issue-name">{{ issue.name }}</text>
                <text class="issue-count">影响人数: {{ issue.count }}</text>
              </view>
              <text class="percent-value">{{ issue.percent }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="screen-footer">
      <text class="footer-text">数据更新时间: {{ updateTime }}</text>
      <text class="footer-brand">亚健康智能筛查系统 | 腾讯云AI赋能</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const totalStudents = ref(12560)
const healthyCount = ref(4680)
const subHealthCount = ref(6820)
const riskCount = ref(1060)

const currentTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
})

const updateTime = computed(() => {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
})

const legendItems = [
  { label: '健康', value: healthyCount.value, class: 'healthy' },
  { label: '亚健康', value: subHealthCount.value, class: 'warning' },
  { label: '高危', value: riskCount.value, class: 'danger' }
]

const trendData = [
  { label: '周一', value: 856 },
  { label: '周二', value: 923 },
  { label: '周三', value: 789 },
  { label: '周四', value: 1056 },
  { label: '周五', value: 892 },
  { label: '周六', value: 654 },
  { label: '周日', value: 523 }
]

const maxTrendValue = computed(() => Math.max(...trendData.map(item => item.value)))

const dimensionData = [
  { name: '睡眠质量', score: 65 },
  { name: '运动情况', score: 78 },
  { name: '饮食习惯', score: 70 },
  { name: '心理压力', score: 55 },
  { name: '身体症状', score: 80 }
]

const healthIssues = [
  { icon: '😴', name: '睡眠不足', count: 5230, percent: 41.6 },
  { icon: '📱', name: '屏幕时间过长', count: 4180, percent: 33.3 },
  { icon: '😰', name: '心理压力大', count: 3650, percent: 29.1 },
  { icon: '🍔', name: '饮食不规律', count: 3120, percent: 24.8 },
  { icon: '🏃', name: '缺乏运动', count: 2890, percent: 23.0 }
]

function getScoreClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}
</script>

<style lang="scss" scoped>
.screen-page { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; }

.screen-header { padding: 40rpx 60rpx; }

.header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; }

.header-title { font-size: 56rpx; font-weight: 700; color: #fff; }

.header-time { font-size: 28rpx; color: rgba(255,255,255,0.6); font-family: 'Courier New', monospace; }

.header-stats { display: flex; gap: 32rpx; }

.stat-card {
  flex: 1; background: rgba(255,255,255,0.08); border-radius: 24rpx; padding: 32rpx;
  display: flex; align-items: center; gap: 24rpx; border: 1rpx solid rgba(255,255,255,0.1);
  
  &.main {
    flex: 1.2;
    background: linear-gradient(135deg, rgba(26,115,232,0.3) 0%, rgba(77,148,240,0.3) 100%);
    border-color: rgba(26,115,232,0.3);
  }
  
  .stat-icon { font-size: 48rpx; }
  
  .stat-content { display: flex; flex-direction: column; }
  
  .stat-value {
    font-size: 48rpx; font-weight: 700; color: #fff;
    &.healthy { color: #34a853; }
    &.warning { color: #fbbc05; }
    &.danger { color: #ea4335; }
  }
  
  .stat-label { font-size: 24rpx; color: rgba(255,255,255,0.6); margin-top: 8rpx; }
}

.screen-body { display: flex; gap: 32rpx; padding: 0 60rpx 40rpx; }

.left-panel, .right-panel { flex: 1; display: flex; flex-direction: column; gap: 32rpx; }

.panel-card {
  background: rgba(255,255,255,0.08); border-radius: 24rpx; padding: 32rpx;
  border: 1rpx solid rgba(255,255,255,0.1);
  
  .panel-title { font-size: 32rpx; font-weight: 600; color: #fff; margin-bottom: 32rpx; display: block; }
}

.distribution-chart { display: flex; align-items: center; gap: 48rpx; }

.pie-chart {
  position: relative; width: 320rpx; height: 320rpx;
  
  .pie-center {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 160rpx; height: 160rpx; background: #1e293b; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    
    .pie-total { font-size: 36rpx; font-weight: 700; color: #fff; }
    
    .pie-label { font-size: 20rpx; color: rgba(255,255,255,0.6); }
  }
}

.legend-list { display: flex; flex-direction: column; gap: 20rpx; }

.legend-item { display: flex; align-items: center; gap: 16rpx; }

.legend-dot {
  width: 24rpx; height: 24rpx; border-radius: 8rpx;
  &.healthy { background: #34a853; }
  &.warning { background: #fbbc05; }
  &.danger { background: #ea4335; }
}

.legend-text { flex: 1; font-size: 26rpx; color: rgba(255,255,255,0.8); }

.legend-value { font-size: 28rpx; font-weight: 600; color: #fff; }

.trend-chart {
  .chart-bars {
    display: flex; justify-content: space-between; align-items: flex-end; height: 280rpx;
    
    .bar-item {
      display: flex; flex-direction: column; align-items: center; gap: 16rpx; width: 10%;
      
      .bar-fill {
        width: 100%; background: linear-gradient(180deg, #1a73e8 0%, #4d94f0 100%);
        border-radius: 8rpx 8rpx 0 0; min-height: 10rpx;
      }
      
      .bar-label { font-size: 22rpx; color: rgba(255,255,255,0.6); }
    }
  }
}

.dimension-ranking { display: flex; flex-direction: column; gap: 24rpx; }

.ranking-item { display: flex; align-items: center; gap: 20rpx; }

.ranking-number {
  width: 48rpx; height: 48rpx; background: rgba(255,255,255,0.1); border-radius: 12rpx;
  display: flex; align-items: center; justify-content: center; font-size: 26rpx; font-weight: 600; color: #fff;
}

.ranking-info { flex: 1; }

.ranking-name { font-size: 26rpx; color: rgba(255,255,255,0.8); display: block; margin-bottom: 12rpx; }

.ranking-bar { height: 12rpx; background: rgba(255,255,255,0.1); border-radius: 6rpx; overflow: hidden; }

.ranking-fill {
  height: 100%; border-radius: 6rpx;
  &.high { background: #34a853; }
  &.medium { background: #fbbc05; }
  &.low { background: #ea4335; }
}

.ranking-score {
  font-size: 28rpx; font-weight: 600; width: 60rpx; text-align: right;
  &.high { color: #34a853; }
  &.medium { color: #fbbc05; }
  &.low { color: #ea4335; }
}

.issue-list { display: flex; flex-direction: column; gap: 24rpx; }

.issue-item {
  display: flex; align-items: center; gap: 20rpx; padding: 20rpx;
  background: rgba(255,255,255,0.05); border-radius: 16rpx;
  
  .issue-icon { font-size: 40rpx; }
  
  .issue-info { flex: 1; }
  
  .issue-name { font-size: 28rpx; color: #fff; display: block; }
  
  .issue-count { font-size: 22rpx; color: rgba(255,255,255,0.5); margin-top: 8rpx; display: block; }
  
  .percent-value { font-size: 32rpx; font-weight: 700; color: #4d94f0; }
}

.screen-footer {
  padding: 32rpx 60rpx; display: flex; justify-content: space-between; align-items: center;
  border-top: 1rpx solid rgba(255,255,255,0.1);
  
  .footer-text { font-size: 24rpx; color: rgba(255,255,255,0.5); }
  
  .footer-brand { font-size: 24rpx; color: rgba(255,255,255,0.5); }
}
</style>
