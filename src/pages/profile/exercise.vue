<template>
  <view class="exercise-page">
    <view class="exercise-header">
      <view class="header-nav">
        <view class="nav-back" @click="goBack"><text>←</text></view>
        <text class="header-title">运动计划</text>
        <view class="nav-action" @click="sharePlan">📤</view>
      </view>
    </view>

    <view class="exercise-content">
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-title">本周运动进度</text>
          <text class="progress-percent">{{ weekProgress }}%</text>
        </view>
        <view class="progress-bar-bg">
          <view class="progress-bar-fill" :style="{ width: `${weekProgress}%` }"></view>
        </view>
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-value">{{ exerciseDays }}</text>
            <text class="stat-label">运动天数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ totalMinutes }}</text>
            <text class="stat-label">运动时长</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ totalCalories }}</text>
            <text class="stat-label">消耗热量</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">今日计划</text>
        <view class="today-plan">
          <view class="plan-item" v-for="(item, index) in todayPlan" :key="index">
            <view class="plan-check" :class="{ checked: item.completed }" @click="toggleComplete(item)">
              <text v-if="item.completed">✓</text>
            </view>
            <view class="plan-info">
              <text class="plan-name">{{ item.name }}</text>
              <text class="plan-detail">{{ item.duration }} · {{ item.calories }}kcal</text>
            </view>
            <view class="plan-icon">{{ item.icon }}</view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">推荐运动</text>
        <view class="exercise-grid">
          <view class="exercise-card" v-for="ex in exercises" :key="ex.name" @click="startExercise(ex)">
            <view class="ex-icon">{{ ex.icon }}</view>
            <text class="ex-name">{{ ex.name }}</text>
            <text class="ex-desc">{{ ex.desc }}</text>
            <view class="ex-tags">
              <text class="ex-tag">{{ ex.duration }}</text>
              <text class="ex-tag">{{ ex.level }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">运动小贴士</text>
        <view class="tip-list">
          <view class="tip-item" v-for="(tip, index) in tips" :key="index">
            <text class="tip-icon">{{ tip.icon }}</text>
            <text class="tip-text">{{ tip.text }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const exerciseDays = ref(0)
const totalMinutes = ref(0)
const totalCalories = ref(0)

const weekProgress = computed(() => {
  return Math.min(Math.round((exerciseDays.value / 7) * 100), 100)
})

const todayPlan = ref<{ name: string; duration: string; calories: number; icon: string; completed: boolean }[]>([])

const exercises = ref<{ name: string; icon: string; desc: string; duration: string; level: string }[]>([])

const tips = ref<{ icon: string; text: string }[]>([])

onMounted(() => {
  loadExerciseData()
})

async function loadExerciseData() {
  try {
    const result = uni.getStorageSync('screenResult')
    if (result) {
      const screenData = JSON.parse(result)
      
      if (screenData.category === '健康' || screenData.category === '轻度亚健康') {
        todayPlan.value = [
          { name: '晨间慢跑', duration: '30分钟', calories: 250, icon: '🏃', completed: false },
          { name: '力量训练', duration: '45分钟', calories: 320, icon: '🏋️', completed: false },
          { name: '瑜伽放松', duration: '20分钟', calories: 80, icon: '🧘', completed: false }
        ]
        
        exercises.value = [
          { name: '有氧运动', icon: '🏃', desc: '提升心肺功能', duration: '30-60分钟', level: '初级' },
          { name: '力量训练', icon: '🏋️', desc: '增强肌肉力量', duration: '45分钟', level: '中级' },
          { name: '瑜伽', icon: '🧘', desc: '身心放松', duration: '20-30分钟', level: '初级' },
          { name: '游泳', icon: '🏊', desc: '全身运动', duration: '40分钟', level: '中级' },
          { name: '骑行', icon: '🚴', desc: '减脂塑形', duration: '45分钟', level: '中级' },
          { name: '跳绳', icon: '🥊', desc: '高效燃脂', duration: '15分钟', level: '初级' }
        ]
      } else {
        todayPlan.value = [
          { name: '散步', duration: '20分钟', calories: 80, icon: '🚶', completed: false },
          { name: '拉伸运动', duration: '15分钟', calories: 30, icon: '🧘', completed: false },
          { name: '深呼吸练习', duration: '10分钟', calories: 20, icon: '💆', completed: false }
        ]
        
        exercises.value = [
          { name: '散步', icon: '🚶', desc: '轻松舒缓', duration: '20-30分钟', level: '初级' },
          { name: '瑜伽', icon: '🧘', desc: '身心放松', duration: '20分钟', level: '初级' },
          { name: '太极', icon: '🥋', desc: '修身养性', duration: '30分钟', level: '初级' },
          { name: '八段锦', icon: '🧘', desc: '调理身体', duration: '20分钟', level: '初级' },
          { name: '冥想', icon: '🧘', desc: '放松心神', duration: '15分钟', level: '初级' },
          { name: '深呼吸', icon: '💆', desc: '缓解压力', duration: '10分钟', level: '初级' }
        ]
      }
      
      const dims = screenData.dimensions || []
      const exerciseDim = dims.find(d => d.name === '运动情况')
      if (exerciseDim && exerciseDim.score < 60) {
        tips.value = [
          { icon: '💪', text: '建议从轻度运动开始，逐渐增加运动量' },
          { icon: '⏰', text: '每周运动3次，每次20-30分钟即可' },
          { icon: '🏥', text: '运动前做好热身，避免受伤' },
          { icon: '💧', text: '运动后及时补充水分和营养' }
        ]
      } else {
        tips.value = [
          { icon: '💪', text: '运动前热身5-10分钟，运动后拉伸5-10分钟' },
          { icon: '⏰', text: '每周建议运动3-5次，每次30分钟以上' },
          { icon: '🏥', text: '运动中感到不适请立即停止休息' },
          { icon: '💧', text: '运动期间及时补充水分' }
        ]
      }
      
      exerciseDays.value = 2
      totalMinutes.value = 120
      totalCalories.value = 600
    } else {
      todayPlan.value = [
        { name: '散步', duration: '20分钟', calories: 80, icon: '🚶', completed: false },
        { name: '拉伸运动', duration: '15分钟', calories: 30, icon: '🧘', completed: false }
      ]
      
      exercises.value = [
        { name: '有氧运动', icon: '🏃', desc: '提升心肺功能', duration: '30-60分钟', level: '初级' },
        { name: '瑜伽', icon: '🧘', desc: '身心放松', duration: '20-30分钟', level: '初级' },
        { name: '骑行', icon: '🚴', desc: '减脂塑形', duration: '45分钟', level: '中级' },
        { name: '跳绳', icon: '🥊', desc: '高效燃脂', duration: '15分钟', level: '初级' }
      ]
      
      tips.value = [
        { icon: '💪', text: '运动前热身5-10分钟' },
        { icon: '⏰', text: '每周建议运动3次以上' },
        { icon: '🏥', text: '量力而行，循序渐进' },
        { icon: '💧', text: '运动期间及时补充水分' }
      ]
    }
  } catch (e) {
    console.log('加载运动数据失败:', e)
  }
}

function goBack() {
  uni.navigateBack()
}

function sharePlan() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function toggleComplete(item: any) {
  item.completed = !item.completed
}

function startExercise(ex: any) {
  uni.showToast({ title: `开始${ex.name}`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.exercise-page { min-height: 100vh; background: #f5f7fa; }

.exercise-header {
  background: linear-gradient(135deg, #fb8c00 0%, #fdba74 100%); padding: 60rpx 24rpx 24rpx;
  
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
    font-size: 28rpx;
  }
}

.exercise-content { padding: 24rpx; }

.progress-card {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .progress-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx;
  }
  
  .progress-title { font-size: 28rpx; font-weight: 500; color: #1f2937; }
  
  .progress-percent { font-size: 36rpx; font-weight: 700; color: #fb8c00; }
  
  .progress-bar-bg {
    height: 16rpx; background: #f0f2f5; border-radius: 8rpx; overflow: hidden; margin-bottom: 24rpx;
  }
  
  .progress-bar-fill {
    height: 100%; background: linear-gradient(90deg, #fb8c00, #fdba74);
    border-radius: 8rpx;
  }
  
  .progress-stats {
    display: flex; justify-content: space-around;
  }
  
  .stat-item { text-align: center; }
  
  .stat-value { font-size: 40rpx; font-weight: 700; color: #1f2937; display: block; }
  
  .stat-label { font-size: 22rpx; color: #9ca3af; }
}

.section {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .section-title { font-size: 32rpx; font-weight: 600; color: #1f2937; margin-bottom: 24rpx; display: block; }
}

.today-plan { display: flex; flex-direction: column; gap: 16rpx; }

.plan-item {
  display: flex; align-items: center; gap: 20rpx;
  padding: 20rpx; background: #f5f7fa; border-radius: 16rpx;
  
  .plan-check {
    width: 44rpx; height: 44rpx; border: 3rpx solid #e5e7eb; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 24rpx; color: #fff;
    
    &.checked { background: #fb8c00; border-color: #fb8c00; }
  }
  
  .plan-info { flex: 1; }
  
  .plan-name { font-size: 28rpx; font-weight: 500; color: #1f2937; }
  
  .plan-detail { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; display: block; }
  
  .plan-icon { font-size: 40rpx; }
}

.exercise-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx;
}

.exercise-card {
  background: #f5f7fa; border-radius: 16rpx; padding: 20rpx;
  
  .ex-icon { font-size: 48rpx; margin-bottom: 12rpx; }
  
  .ex-name { font-size: 26rpx; font-weight: 500; color: #1f2937; display: block; }
  
  .ex-desc { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; display: block; }
  
  .ex-tags { display: flex; gap: 8rpx; margin-top: 12rpx; }
  
  .ex-tag {
    font-size: 20rpx; color: #6b7280; background: #e5e7eb;
    padding: 4rpx 12rpx; border-radius: 8rpx;
  }
}

.tip-list { display: flex; flex-direction: column; gap: 16rpx; }

.tip-item {
  display: flex; gap: 16rpx; padding: 16rpx;
  background: rgba(251,140,0,0.05); border-radius: 16rpx;
  
  .tip-icon { font-size: 32rpx; }
  
  .tip-text { font-size: 24rpx; color: #4b5563; line-height: 1.5; }
}
</style>
