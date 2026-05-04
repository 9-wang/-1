<template>
  <view class="cockpit-page">
    <view v-if="!hasResult" class="empty-state">
      <view class="empty-icon">📋</view>
      <text class="empty-title">暂无健康报告</text>
      <text class="empty-desc">请先完成健康筛查，生成专属健康报告</text>
      <view class="empty-btn" @click="goToScreen">
        <text>开始筛查</text>
      </view>
    </view>
    
    <view v-else>
    <view class="cockpit-header">
      <view class="header-bg" :style="{ background: headerGradient }"></view>
      <view class="header-content">
        <text class="header-title">健康驾驶舱</text>
        <text class="header-subtitle">您的专属健康报告</text>
        
        <view class="score-card">
          <view class="score-ring">
            <view class="ring-bg"></view>
            <view class="ring-fill" :style="{ '--score': healthScore }"></view>
            <view class="score-content">
              <text class="score-value">{{ healthScore }}</text>
              <text class="score-label">健康评分</text>
            </view>
          </view>
          <view class="score-info">
            <view class="category-tag" :style="{ background: categoryColor + '20', color: categoryColor }">
              {{ category }}
            </view>
            <text class="category-desc">{{ categoryDesc }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="cockpit-content">
      <view class="section">
        <text class="section-title">健康维度分析</text>
        <view class="dimension-list">
          <view class="dimension-item" v-for="(dim, index) in dimensions" :key="index">
            <view class="dim-header">
              <text class="dim-name">{{ dim.name }}</text>
              <text class="dim-score" :style="{ color: getScoreColor(dim.score) }">{{ dim.score }}分</text>
            </view>
            <view class="dim-bar-bg">
              <view class="dim-bar-fill" :style="{ width: `${dim.score}%`, background: getScoreGradient(dim.score) }"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">健康建议</text>
          <text class="section-badge">{{ suggestions.length }}条</text>
        </view>
        <view class="suggestion-list">
          <view class="suggestion-item" v-for="(suggestion, index) in suggestions" :key="index">
            <text class="suggestion-icon">💡</text>
            <text class="suggestion-text">{{ suggestion }}</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="risks.length > 0">
        <view class="section-header">
          <text class="section-title">风险预警</text>
          <text class="risk-badge">⚠️ {{ risks.length }}项</text>
        </view>
        <view class="risk-list">
          <view class="risk-item" v-for="(risk, index) in risks" :key="index">
            <view class="risk-indicator"></view>
            <text class="risk-text">{{ risk }}</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="aiAnalysis">
        <view class="section-header">
          <text class="section-title">AI深度分析</text>
          <text class="section-badge">🤖</text>
        </view>
        <view class="ai-analysis">
          <text class="analysis-text">{{ aiAnalysis }}</text>
        </view>
      </view>

      <view class="section">
        <view class="action-buttons">
          <view class="action-btn" @click="goToChat">
            <text class="btn-icon">💬</text>
            <text class="btn-text">咨询AI助手</text>
          </view>
          <view class="action-btn primary" @click="retryScreen">
            <text class="btn-icon">🔄</text>
            <text class="btn-text">重新筛查</text>
          </view>
        </view>
      </view>
    </view>
    </view>
    
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { healthCategories } from '@/data/questions'
import TabBar from '@/components/TabBar.vue'

const healthScore = ref(0)
const category = ref('')
const dimensions = ref<{ name: string; score: number }[]>([])
const suggestions = ref<string[]>([])
const risks = ref<string[]>([])
const aiAnalysis = ref('')
const hasResult = ref(false)

onMounted(() => {
  loadScreenResult()
})

function loadScreenResult() {
  try {
    const storedResult = uni.getStorageSync('screenResult')
    if (storedResult) {
      const result: any = JSON.parse(storedResult)
      healthScore.value = result.health_score
      category.value = result.category
      dimensions.value = result.dimensions
      suggestions.value = result.suggestions
      risks.value = result.risks || []
      
      if (result.ai_analysis) {
        aiAnalysis.value = result.ai_analysis
      }
      
      hasResult.value = true
    }
  } catch {
    console.log('使用默认数据')
  }
}

function goToScreen() {
  uni.redirectTo({ url: '/pages/index/screen' })
}

const categoryInfo = computed(() => healthCategories[category.value as keyof typeof healthCategories] || { color: '#1a73e8', description: '' })
const categoryColor = computed(() => categoryInfo.value.color)
const categoryDesc = computed(() => categoryInfo.value.description)

function goToChat() {
  uni.redirectTo({ url: '/pages/chat/chat' })
}

function retryScreen() {
  uni.navigateTo({ url: '/pages/index/screen' })
}

const headerGradient = computed(() => {
  const colors: Record<string, string> = {
    '健康': 'linear-gradient(135deg, #34a853 0%, #43d060 100%)',
    '轻度亚健康': 'linear-gradient(135deg, #fbbc05 0%, #fcd34d 100%)',
    '中度亚健康': 'linear-gradient(135deg, #fb8c00 0%, #fdba74 100%)',
    '重度亚健康': 'linear-gradient(135deg, #ea4335 0%, #f87171 100%)'
  }
  return colors[category.value] || colors['轻度亚健康']
})

function getScoreColor(score: number) {
  if (score >= 80) return '#34a853'
  if (score >= 60) return '#fbbc05'
  return '#ea4335'
}

function getScoreGradient(score: number) {
  if (score >= 80) return 'linear-gradient(90deg, #34a853, #43d060)'
  if (score >= 60) return 'linear-gradient(90deg, #fbbc05, #fcd34d)'
  return 'linear-gradient(90deg, #ea4335, #f87171)'
}
</script>

<style lang="scss" scoped>
.cockpit-page { min-height: 100vh; background: #f5f7fa; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100vh; padding: 48rpx;
  
  .empty-icon { font-size: 120rpx; margin-bottom: 24rpx; }
  
  .empty-title { font-size: 36rpx; font-weight: 600; color: #1f2937; margin-bottom: 16rpx; }
  
  .empty-desc { font-size: 26rpx; color: #9ca3af; text-align: center; margin-bottom: 48rpx; }
  
  .empty-btn {
    padding: 24rpx 80rpx; background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
    border-radius: 44rpx;
    
    text { font-size: 32rpx; font-weight: 500; color: #fff; }
  }
}

.cockpit-header {
  position: relative; padding-top: 80rpx; padding-bottom: 60rpx;
  
  .header-bg {
    position: absolute; top: 0; left: 0; right: 0; height: 500rpx;
    border-radius: 0 0 60rpx 60rpx;
  }
  
  .header-content { position: relative; z-index: 1; padding: 0 32rpx; }
  
  .header-title { font-size: 44rpx; font-weight: 700; color: #fff; display: block; }
  
  .header-subtitle { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; display: block; }
  
  .score-card { display: flex; align-items: center; gap: 32rpx; margin-top: 32rpx; }
  
  .score-ring {
    position: relative; width: 200rpx; height: 200rpx;
    
    .ring-bg {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%; border: 16rpx solid rgba(255,255,255,0.3);
    }
    
    .ring-fill {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%; border: 16rpx solid transparent;
      border-top-color: rgba(255,255,255,0.9);
      border-right-color: rgba(255,255,255,0.9);
      transform: rotate(calc(var(--score) * 3.6deg - 90deg));
    }
    
    .score-content {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      text-align: center;
      
      .score-value { font-size: 56rpx; font-weight: 700; color: #fff; display: block; }
      
      .score-label { font-size: 22rpx; color: rgba(255,255,255,0.8); }
    }
  }
  
  .score-info { display: flex; flex-direction: column; gap: 16rpx; }
  
  .category-tag {
    display: inline-block; padding: 8rpx 24rpx; border-radius: 20rpx;
    font-size: 24rpx; font-weight: 500;
  }
  
  .category-desc { font-size: 24rpx; color: rgba(255,255,255,0.9); }
}

.cockpit-content { padding: 0 24rpx 160rpx; margin-top: -40rpx; position: relative; z-index: 1; }

.section {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .section-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
  }
  
  .section-title { font-size: 32rpx; font-weight: 600; color: #1f2937; }
  
  .section-badge {
    font-size: 22rpx; color: #1a73e8; background: rgba(26,115,232,0.1);
    padding: 4rpx 16rpx; border-radius: 16rpx;
  }
  
  .risk-badge {
    font-size: 22rpx; color: #ea4335; background: rgba(234,67,53,0.1);
    padding: 4rpx 16rpx; border-radius: 16rpx;
  }
}

.dimension-list { display: flex; flex-direction: column; gap: 16rpx; }

.dimension-item {
  .dim-header { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
  
  .dim-name { font-size: 24rpx; color: #6b7280; }
  
  .dim-score { font-size: 24rpx; font-weight: 600; }
  
  .dim-bar-bg { height: 12rpx; background: #f0f2f5; border-radius: 6rpx; overflow: hidden; }
  
  .dim-bar-fill { height: 100%; border-radius: 6rpx; }
}

.suggestion-list { display: flex; flex-direction: column; gap: 16rpx; }

.suggestion-item {
  display: flex; gap: 16rpx; padding: 16rpx; background: rgba(26,115,232,0.05);
  border-radius: 16rpx;
  
  .suggestion-icon { font-size: 32rpx; }
  
  .suggestion-text { font-size: 24rpx; color: #6b7280; line-height: 1.5; }
}

.risk-list { display: flex; flex-direction: column; gap: 16rpx; }

.risk-item {
  display: flex; gap: 16rpx; padding: 16rpx; background: rgba(234,67,53,0.05);
  border-radius: 16rpx;
  
  .risk-indicator { width: 8rpx; height: 8rpx; background: #ea4335; border-radius: 50%; margin-top: 12rpx; }
  
  .risk-text { font-size: 24rpx; color: #6b7280; line-height: 1.5; }
}

.ai-analysis {
  padding: 20rpx; background: linear-gradient(135deg, rgba(26,115,232,0.08) 0%, rgba(139,92,246,0.08) 100%);
  border-radius: 16rpx; border-left: 6rpx solid #1a73e8;
  
  .analysis-text { font-size: 26rpx; color: #4b5563; line-height: 1.7; }
}

.action-buttons {
  display: flex; gap: 20rpx;
  
  .action-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    padding: 24rpx; background: #f5f7fa; border-radius: 16rpx;
    
    &.primary { background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%); }
    
    .btn-icon { font-size: 48rpx; margin-bottom: 8rpx; }
    
    .btn-text { 
      font-size: 24rpx; color: #6b7280; 
      .primary & { color: #fff; }
    }
  }
}
</style>
