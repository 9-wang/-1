<template>
  <view class="report-page">
    <view class="report-header">
      <view class="header-nav">
        <view class="nav-back" @click="goBack"><text>←</text></view>
        <text class="header-title">健康报告</text>
        <view class="nav-action" @click="shareReport">📤</view>
      </view>
    </view>

    <view class="report-content">
      <view class="summary-card">
        <view class="summary-header">
          <text class="summary-date">{{ currentDate }}</text>
          <view class="summary-tag" :style="{ background: tagBgColor, color: tagColor }">
            {{ healthStatus }}
          </view>
        </view>
        <view class="summary-score">
          <view class="score-circle">
            <text class="score-number">{{ healthScore }}</text>
            <text class="score-unit">分</text>
          </view>
          <text class="score-label">综合健康评分</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">健康维度详情</text>
        <view class="dimension-grid">
          <view class="dimension-card" v-for="dim in dimensions" :key="dim.name">
            <view class="dim-icon">{{ dim.icon }}</view>
            <text class="dim-name">{{ dim.name }}</text>
            <view class="dim-score-wrap">
              <text class="dim-score" :style="{ color: getScoreColor(dim.score) }">{{ dim.score }}</text>
              <text class="dim-max">/100</text>
            </view>
            <view class="dim-bar-bg">
              <view class="dim-bar-fill" :style="{ width: `${dim.score}%`, background: getScoreGradient(dim.score) }"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">健康建议</text>
        <view class="suggestion-list">
          <view class="suggestion-item" v-for="(item, index) in suggestions" :key="index">
            <text class="suggestion-num">{{ index + 1 }}</text>
            <text class="suggestion-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">健康趋势</text>
        <view class="trend-chart">
          <view class="trend-bars">
            <view class="trend-item" v-for="(item, index) in trendData" :key="index">
              <view class="trend-bar-bg">
                <view class="trend-bar-fill" :style="{ height: `${(item.score / 100) * 100}%`, background: getScoreGradient(item.score) }"></view>
              </view>
              <text class="trend-label">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const healthScore = ref(0)
const healthStatus = ref('')

onMounted(() => {
  loadScreenResult()
})

function loadScreenResult() {
  try {
    const storedResult = uni.getStorageSync('screenResult')
    if (storedResult) {
      const result: any = JSON.parse(storedResult)
      healthScore.value = result.health_score
      healthStatus.value = result.category
      if (result.dimensions) {
        dimensions.value = result.dimensions.map((d: any) => ({
          ...d,
          icon: getDimensionIcon(d.name)
        }))
      }
      if (result.suggestions) {
        suggestions.value = result.suggestions
      }
    }
  } catch (e) {
    console.log('加载筛查结果失败:', e)
  }
}

function getDimensionIcon(name: string): string {
  const icons: Record<string, string> = {
    '睡眠质量': '😴',
    '运动情况': '🏃',
    '饮食习惯': '🥗',
    '心理压力': '🧘',
    '身体症状': '❤️',
    '生活习惯': '🌱',
    '屏幕时间': '📱',
    '健康满意度': '😊'
  }
  return icons[name] || '📊'
}

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

const tagBgColor = computed(() => {
  const colors: Record<string, string> = {
    '健康': 'rgba(52,168,83,0.1)',
    '轻度亚健康': 'rgba(251,188,5,0.1)',
    '中度亚健康': 'rgba(251,140,0,0.1)',
    '重度亚健康': 'rgba(234,67,53,0.1)'
  }
  return colors[healthStatus.value] || colors['轻度亚健康']
})

const tagColor = computed(() => {
  const colors: Record<string, string> = {
    '健康': '#34a853',
    '轻度亚健康': '#fbbc05',
    '中度亚健康': '#fb8c00',
    '重度亚健康': '#ea4335'
  }
  return colors[healthStatus.value] || colors['轻度亚健康']
})

const dimensions = ref<{ name: string; icon: string; score: number }[]>([])

const suggestions = ref<string[]>([])

const trendData = ref([
  { label: '1周前', score: 0 },
  { label: '6天前', score: 0 },
  { label: '5天前', score: 0 },
  { label: '4天前', score: 0 },
  { label: '3天前', score: 0 },
  { label: '2天前', score: 0 },
  { label: '今天', score: 0 }
])

function getScoreColor(score: number) {
  if (score >= 80) return '#34a853'
  if (score >= 60) return '#fbbc05'
  return '#ea4335'
}

function getScoreGradient(score: number) {
  if (score >= 80) return 'linear-gradient(180deg, #34a853, #43d060)'
  if (score >= 60) return 'linear-gradient(180deg, #fbbc05, #fcd34d)'
  return 'linear-gradient(180deg, #ea4335, #f87171)'
}

function goBack() {
  uni.navigateBack()
}

function shareReport() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.report-page { min-height: 100vh; background: #f5f7fa; }

.report-header {
  background: #1a73e8; padding: 60rpx 24rpx 24rpx;
  
  .header-nav { display: flex; align-items: center; justify-content: space-between; }
  
  .nav-back {
    width: 60rpx; height: 60rpx;
    background: rgba(255,255,255,0.2); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 36rpx; color: #fff;
  }
  
  .header-title { font-size: 36rpx; font-weight: 600; color: #fff; }
  
  .nav-action {
    width: 60rpx; height: 60rpx;
    background: rgba(255,255,255,0.2); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 32rpx;
  }
}

.report-content { padding: 24rpx; }

.summary-card {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  border-radius: 24rpx; padding: 32rpx; margin-bottom: 24rpx;
  
  .summary-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 32rpx;
  }
  
  .summary-date { font-size: 24rpx; color: rgba(255,255,255,0.8); }
  
  .summary-tag {
    padding: 8rpx 24rpx; border-radius: 20rpx; font-size: 24rpx; font-weight: 500;
  }
  
  .summary-score { text-align: center; }
  
  .score-circle {
    width: 200rpx; height: 200rpx;
    background: rgba(255,255,255,0.2); border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    margin: 0 auto 24rpx;
    
    .score-number { font-size: 72rpx; font-weight: 700; color: #fff; }
    
    .score-unit { font-size: 28rpx; color: rgba(255,255,255,0.8); }
  }
  
  .score-label { font-size: 26rpx; color: rgba(255,255,255,0.9); }
}

.section {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .section-title { font-size: 32rpx; font-weight: 600; color: #1f2937; margin-bottom: 24rpx; display: block; }
}

.dimension-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx;
}

.dimension-card {
  background: #f5f7fa; border-radius: 16rpx; padding: 20rpx;
  
  .dim-icon { font-size: 40rpx; margin-bottom: 8rpx; }
  
  .dim-name { font-size: 24rpx; color: #6b7280; margin-bottom: 8rpx; display: block; }
  
  .dim-score-wrap { display: flex; align-items: baseline; }
  
  .dim-score { font-size: 36rpx; font-weight: 700; }
  
  .dim-max { font-size: 22rpx; color: #9ca3af; margin-left: 4rpx; }
  
  .dim-bar-bg {
    height: 8rpx; background: #e5e7eb; border-radius: 4rpx; margin-top: 12rpx;
    overflow: hidden;
  }
  
  .dim-bar-fill { height: 100%; border-radius: 4rpx; }
}

.suggestion-list { display: flex; flex-direction: column; gap: 16rpx; }

.suggestion-item {
  display: flex; gap: 16rpx; padding: 16rpx;
  background: rgba(26,115,232,0.05); border-radius: 16rpx;
  
  .suggestion-num {
    width: 40rpx; height: 40rpx;
    background: #1a73e8; color: #fff;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 24rpx; font-weight: 600; flex-shrink: 0;
  }
  
  .suggestion-text { font-size: 24rpx; color: #4b5563; line-height: 1.5; }
}

.trend-chart {
  padding: 24rpx 0;
  
  .trend-bars {
    display: flex; justify-content: space-between; align-items: flex-end;
    height: 200rpx;
  }
  
  .trend-item {
    display: flex; flex-direction: column; align-items: center; flex: 1;
    
    .trend-bar-bg {
      width: 32rpx; height: 160rpx; background: #f0f2f5; border-radius: 16rpx;
      display: flex; align-items: flex-end; overflow: hidden;
    }
    
    .trend-bar-fill { width: 100%; border-radius: 16rpx; }
    
    .trend-label { font-size: 20rpx; color: #9ca3af; margin-top: 12rpx; }
  }
}
</style>
