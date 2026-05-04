<template>
  <view class="food-page">
    <view class="food-header">
      <view class="header-nav">
        <view class="nav-back" @click="goBack"><text>←</text></view>
        <text class="header-title">饮食推荐</text>
        <view class="nav-action">⋮</view>
      </view>
    </view>

    <view class="food-content">
      <view class="today-plan">
        <view class="plan-header">
          <text class="plan-title">今日饮食计划</text>
          <text class="plan-date">{{ currentDate }}</text>
        </view>
        <view class="meal-list">
          <view class="meal-card" v-for="meal in todayMeals" :key="meal.name">
            <view class="meal-icon">{{ meal.icon }}</view>
            <view class="meal-info">
              <text class="meal-name">{{ meal.name }}</text>
              <text class="meal-time">{{ meal.time }}</text>
            </view>
            <view class="meal-cal">
              <text class="cal-value">{{ meal.calories }}</text>
              <text class="cal-unit">kcal</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">推荐食谱</text>
        <view class="recipe-list">
          <view class="recipe-card" v-for="recipe in recipes" :key="recipe.name" @click="viewRecipe(recipe)">
            <view class="recipe-image">{{ recipe.icon }}</view>
            <view class="recipe-info">
              <text class="recipe-name">{{ recipe.name }}</text>
              <text class="recipe-desc">{{ recipe.desc }}</text>
              <view class="recipe-meta">
                <text class="meta-item">⏱️ {{ recipe.time }}</text>
                <text class="meta-item">🔥 {{ recipe.calories }}kcal</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">饮食小贴士</text>
        <view class="tip-list">
          <view class="tip-item" v-for="(tip, index) in tips" :key="index">
            <text class="tip-icon">{{ tip.icon }}</text>
            <text class="tip-text">{{ tip.text }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">营养目标</text>
        <view class="goal-list">
          <view class="goal-item" v-for="goal in goals" :key="goal.name">
            <view class="goal-info">
              <text class="goal-name">{{ goal.name }}</text>
              <text class="goal-progress">{{ goal.current }}/{{ goal.target }} {{ goal.unit }}</text>
            </view>
            <view class="goal-bar-bg">
              <view class="goal-bar-fill" :style="{ width: `${(goal.current / goal.target) * 100}%` }"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const todayMeals = ref<{ name: string; icon: string; time: string; calories: number }[]>([])

const recipes = ref<{ name: string; icon: string; desc: string; time: string; calories: number }[]>([])

const tips = ref<{ icon: string; text: string }[]>([])

const goals = ref<{ name: string; current: number; target: number; unit: string }[]>([])

onMounted(() => {
  loadFoodData()
})

async function loadFoodData() {
  try {
    const result = uni.getStorageSync('screenResult')
    if (result) {
      const screenData = JSON.parse(result)
      if (screenData.category === '健康') {
        recipes.value = [
          { name: '西兰花炒虾仁', icon: '🥦', desc: '高蛋白低脂肪，营养均衡', time: '15分钟', calories: 280 },
          { name: '清蒸鲈鱼', icon: '🐟', desc: '鲜嫩可口，富含优质蛋白', time: '20分钟', calories: 320 },
          { name: '杂粮蔬菜沙拉', icon: '🥗', desc: '丰富膳食纤维，促进消化', time: '10分钟', calories: 250 },
          { name: '鸡胸肉荞麦面', icon: '🍜', desc: '低脂饱腹，适合健身人群', time: '15分钟', calories: 420 }
        ]
      } else {
        recipes.value = [
          { name: '小米粥', icon: '🍚', desc: '易于消化，养胃健脾', time: '30分钟', calories: 180 },
          { name: '清蒸鱼', icon: '🐟', desc: '清淡营养，减轻肠胃负担', time: '20分钟', calories: 250 },
          { name: '蔬菜豆腐汤', icon: '🥣', desc: '清淡少油，营养丰富', time: '15分钟', calories: 150 },
          { name: '蒸红薯', icon: '🍠', desc: '粗粮主食，饱腹感强', time: '25分钟', calories: 120 }
        ]
      }
    }
    
    todayMeals.value = [
      { name: '早餐', icon: '🌅', time: '07:00-09:00', calories: 350 },
      { name: '午餐', icon: '☀️', time: '11:30-13:30', calories: 550 },
      { name: '晚餐', icon: '🌙', time: '17:30-19:30', calories: 450 },
      { name: '加餐', icon: '🍎', time: '10:00/15:00', calories: 150 }
    ]
    
    tips.value = [
      { icon: '💧', text: '每天饮水量建议1500-2000ml，分多次小口饮用' },
      { icon: '🥕', text: '每日蔬菜摄入量建议300-500克，种类尽量多样化' },
      { icon: '🍳', text: '烹饪方式推荐蒸、煮、炖、凉拌，减少油炸' },
      { icon: '⏰', text: '每餐进食时间建议20-30分钟，细嚼慢咽' }
    ]
    
    goals.value = [
      { name: '热量摄入', current: 1400, target: 1800, unit: 'kcal' },
      { name: '蛋白质', current: 65, target: 80, unit: 'g' },
      { name: '碳水化合物', current: 170, target: 225, unit: 'g' },
      { name: '膳食纤维', current: 23, target: 30, unit: 'g' }
    ]
  } catch (e) {
    console.log('加载饮食数据失败:', e)
  }
}

function goBack() {
  uni.navigateBack()
}

function viewRecipe(recipe: any) {
  uni.showToast({ title: `查看${recipe.name}`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.food-page { min-height: 100vh; background: #f5f7fa; }

.food-header {
  background: linear-gradient(135deg, #34a853 0%, #43d060 100%); padding: 60rpx 24rpx 24rpx;
  
  .header-nav { display: flex; align-items: center; justify-content: space-between; }
  
  .nav-back {
    width: 60rpx; height: 60rpx;
    background: rgba(255,255,255,0.2); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 36rpx; color: #fff;
  }
  
  .header-title { font-size: 36rpx; font-weight: 600; color: #fff; }
  
  .nav-action { font-size: 36rpx; color: #fff; }
}

.food-content { padding: 24rpx; }

.today-plan {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .plan-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx;
  }
  
  .plan-title { font-size: 32rpx; font-weight: 600; color: #1f2937; }
  
  .plan-date { font-size: 24rpx; color: #9ca3af; }
}

.meal-list { display: flex; flex-direction: column; gap: 16rpx; }

.meal-card {
  display: flex; align-items: center; gap: 20rpx;
  padding: 20rpx; background: #f5f7fa; border-radius: 16rpx;
  
  .meal-icon { font-size: 48rpx; }
  
  .meal-info { flex: 1; }
  
  .meal-name { font-size: 28rpx; font-weight: 500; color: #1f2937; }
  
  .meal-time { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; display: block; }
  
  .meal-cal { text-align: right; }
  
  .cal-value { font-size: 32rpx; font-weight: 700; color: #34a853; }
  
  .cal-unit { font-size: 20rpx; color: #9ca3af; }
}

.section {
  background: #fff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 24rpx;
  
  .section-title { font-size: 32rpx; font-weight: 600; color: #1f2937; margin-bottom: 24rpx; display: block; }
}

.recipe-list { display: flex; flex-direction: column; gap: 16rpx; }

.recipe-card {
  display: flex; gap: 20rpx; padding: 20rpx;
  background: #f5f7fa; border-radius: 16rpx;
  
  .recipe-image {
    width: 120rpx; height: 120rpx;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border-radius: 16rpx; display: flex; align-items: center; justify-content: center;
    font-size: 56rpx;
  }
  
  .recipe-info { flex: 1; }
  
  .recipe-name { font-size: 28rpx; font-weight: 500; color: #1f2937; }
  
  .recipe-desc { font-size: 22rpx; color: #9ca3af; margin-top: 8rpx; display: block; }
  
  .recipe-meta { display: flex; gap: 16rpx; margin-top: 12rpx; }
  
  .meta-item { font-size: 20rpx; color: #6b7280; }
}

.tip-list { display: flex; flex-direction: column; gap: 16rpx; }

.tip-item {
  display: flex; gap: 16rpx; padding: 16rpx;
  background: rgba(52,168,83,0.05); border-radius: 16rpx;
  
  .tip-icon { font-size: 32rpx; }
  
  .tip-text { font-size: 24rpx; color: #4b5563; line-height: 1.5; }
}

.goal-list { display: flex; flex-direction: column; gap: 20rpx; }

.goal-item {
  .goal-info {
    display: flex; justify-content: space-between; margin-bottom: 8rpx;
  }
  
  .goal-name { font-size: 26rpx; color: #6b7280; }
  
  .goal-progress { font-size: 26rpx; font-weight: 600; color: #34a853; }
  
  .goal-bar-bg {
    height: 12rpx; background: #f0f2f5; border-radius: 6rpx; overflow: hidden;
  }
  
  .goal-bar-fill {
    height: 100%; background: linear-gradient(90deg, #34a853, #43d060);
    border-radius: 6rpx;
  }
}
</style>
