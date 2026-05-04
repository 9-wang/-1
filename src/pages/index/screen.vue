<template>
  <view class="screen-page">
    <view class="screen-header">
      <view class="header-nav">
        <view class="nav-back" @click="goBack"><text>←</text></view>
        <text class="header-title">健康筛查</text>
        <view class="nav-progress">{{ currentIndex + 1 }}/{{ questions.length }}</view>
      </view>
    </view>

    <view class="question-container" v-if="currentQuestion">
      <view class="question-card">
        <text class="question-number">第 {{ currentIndex + 1 }} 题</text>
        <text class="question-text">{{ currentQuestion.question }}</text>

        <view class="options-list" v-if="currentQuestion.type === 'single'">
          <view 
            class="option-item" 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            :class="{ selected: answers[currentQuestion.id] === option.value }"
            @click="selectSingleOption(option.value)"
          >
            <view class="option-radio">
              <view class="radio-inner" v-if="answers[currentQuestion.id] === option.value"></view>
            </view>
            <text class="option-text">{{ option.label }}</text>
          </view>
        </view>

        <view class="options-list" v-else-if="currentQuestion.type === 'multiple'">
          <view 
            class="option-item" 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            :class="{ selected: isMultipleSelected(option.value) }"
            @click="toggleMultipleOption(option.value)"
          >
            <view class="option-checkbox">
              <text v-if="isMultipleSelected(option.value)">✓</text>
            </view>
            <text class="option-text">{{ option.label }}</text>
          </view>
        </view>

        <view class="scale-container" v-else-if="currentQuestion.type === 'scale'">
          <view class="scale-labels">
            <text>1</text>
            <text>{{ answers[currentQuestion.id] || 5 }}{{ currentQuestion.scaleLabel }}</text>
            <text>10</text>
          </view>
          <slider 
            :value="answers[currentQuestion.id] || 5" 
            :min="currentQuestion.scaleMin" 
            :max="currentQuestion.scaleMax"
            activeColor="#1a73e8" backgroundColor="#e5e7eb"
            @change="onScaleChange"
          />
        </view>
      </view>
    </view>

    <view class="screen-footer">
      <view class="footer-btn prev-btn" :class="{ disabled: currentIndex === 0 }" @click="prevQuestion">上一题</view>
      <view class="footer-btn next-btn" :class="{ primary: currentIndex === questions.length - 1 }" @click="nextQuestion">
        {{ currentIndex === questions.length - 1 ? '提交筛查' : '下一题' }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { screenQuestions, type Question } from '@/data/questions'
import { submitScreen, type ScreenAnswer } from '@/api/health'

const questions = ref<Question[]>(screenQuestions)
const currentIndex = ref(0)
const answers = ref<Record<number, string | number | string[]>>({})

const currentQuestion = computed(() => questions.value[currentIndex.value])

function selectSingleOption(value: string | number) {
  answers.value[currentQuestion.value.id] = value
}

function isMultipleSelected(value: string | number): boolean {
  const current = answers.value[currentQuestion.value.id] as string[] || []
  return current.includes(String(value))
}

function toggleMultipleOption(value: string | number) {
  const current = (answers.value[currentQuestion.value.id] as string[]) || []
  const index = current.indexOf(String(value))
  if (index > -1) current.splice(index, 1)
  else current.push(String(value))
  answers.value[currentQuestion.value.id] = current
}

function onScaleChange(e: any) {
  answers.value[currentQuestion.value.id] = e.detail.value
}

function prevQuestion() { if (currentIndex.value > 0) currentIndex.value-- }

async function nextQuestion() {
  if (!validateCurrentAnswer()) {
    uni.showToast({ title: '请先回答当前问题', icon: 'none' })
    return
  }
  
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  } else {
    await submitAnswers()
  }
}

function validateCurrentAnswer(): boolean {
  const answer = answers.value[currentQuestion.value.id]
  if (currentQuestion.value.type === 'multiple') {
    return Array.isArray(answer) && answer.length > 0
  }
  return answer !== undefined && answer !== null && answer !== ''
}

async function submitAnswers() {
  const unanswered = questions.value.filter(q => {
    const answer = answers.value[q.id]
    if (q.type === 'multiple') {
      return !Array.isArray(answer) || answer.length === 0
    }
    return answer === undefined || answer === null || answer === ''
  })
  
  if (unanswered.length > 0) {
    uni.showToast({ title: `还有${unanswered.length}题未回答`, icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '确认提交',
    content: '确定要提交这份健康筛查问卷吗？',
    success: async (res) => {
      if (res.confirm) {
        const answerList: ScreenAnswer[] = Object.entries(answers.value).map(([id, answer]) => ({
          question_id: Number(id),
          answer
        }))
        
        uni.showLoading({ title: 'AI分析中...' })
        
        try {
          const result: any = await submitScreen(answerList)
          if (result && result.data) {
            uni.setStorageSync('screenResult', JSON.stringify(result.data))
          } else {
            uni.setStorageSync('screenResult', JSON.stringify(result))
          }
          uni.hideLoading()
          uni.redirectTo({ url: '/pages/profile/report' })
        } catch {
          uni.hideLoading()
          uni.showToast({ title: '提交失败，请重试', icon: 'error' })
        }
      }
    }
  })
}

function goBack() { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.screen-page { min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; }

.screen-header {
  background: #1a73e8; padding: 60rpx 24rpx 24rpx;
  
  .header-nav { display: flex; align-items: center; justify-content: space-between; }
  
  .nav-back {
    width: 60rpx; height: 60rpx;
    background: rgba(255,255,255,0.2); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 36rpx; color: #fff;
  }
  
  .header-title { font-size: 36rpx; font-weight: 600; color: #fff; }
  
  .nav-progress {
    font-size: 24rpx; color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.2); padding: 8rpx 20rpx; border-radius: 20rpx;
  }
}

.question-container { flex: 1; padding: 24rpx; display: flex; align-items: flex-start; justify-content: center; }

.question-card {
  width: 100%; background: #fff; border-radius: 32rpx; padding: 32rpx;
  
  .question-number { font-size: 24rpx; color: #1a73e8; font-weight: 500; margin-bottom: 16rpx; }
  
  .question-text { font-size: 36rpx; font-weight: 600; color: #1f2937; line-height: 1.6; margin-bottom: 32rpx; }
  
  .options-list { display: flex; flex-direction: column; gap: 16rpx; }
  
  .option-item {
    display: flex; align-items: center; gap: 24rpx;
    padding: 24rpx; background: #f5f7fa; border-radius: 16rpx;
    border: 2rpx solid transparent;
    
    &.selected { background: rgba(26,115,232,0.08); border-color: #1a73e8; }
  }
  
  .option-radio {
    width: 44rpx; height: 44rpx; border: 3rpx solid #e5e7eb; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    
    .radio-inner { width: 24rpx; height: 24rpx; background: #1a73e8; border-radius: 50%; }
  }
  
  .option-checkbox {
    width: 44rpx; height: 44rpx; border: 3rpx solid #e5e7eb; border-radius: 8rpx;
    display: flex; align-items: center; justify-content: center;
    color: #1a73e8; font-size: 28rpx; font-weight: 700;
  }
  
  .option-text { flex: 1; font-size: 28rpx; color: #1f2937; }
}

.scale-container { padding: 24rpx 0; }

.scale-labels { display: flex; justify-content: space-between; margin-bottom: 24rpx; font-size: 22rpx; color: #9ca3af; }

.screen-footer {
  padding: 24rpx; display: flex; gap: 24rpx;
  background: #fff;
  
  .footer-btn {
    flex: 1; height: 88rpx; display: flex; align-items: center; justify-content: center;
    border-radius: 16rpx; font-size: 32rpx; font-weight: 500;
    
    &.prev-btn { background: #f0f2f5; color: #6b7280; &.disabled { opacity: 0.5; } }
    
    &.next-btn { background: #f0f2f5; color: #1f2937; &.primary { background: #1a73e8; color: #fff; } }
  }
}
</style>
