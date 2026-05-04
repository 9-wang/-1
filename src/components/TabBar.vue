<template>
  <view class="tab-bar">
    <view 
      v-for="(item, index) in tabs" 
      :key="item.path" 
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(index)"
    >
      <text class="tab-icon">{{ item.icon }}</text>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tabs = [
  { icon: '📋', text: '筛查', path: '/pages/index/index' },
  { icon: '📊', text: '驾驶舱', path: '/pages/cockpit/cockpit' },
  { icon: '🤖', text: 'AI助手', path: '/pages/chat/chat' },
  { icon: '👤', text: '我的', path: '/pages/profile/profile' }
]

const currentIndex = ref(0)
let isSwitching = false

onMounted(() => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const pagePath = '/' + currentPage.route
    const index = tabs.findIndex(tab => tab.path === pagePath)
    if (index !== -1) {
      currentIndex.value = index
    }
  }
})

function switchTab(index: number) {
  if (currentIndex.value === index || isSwitching) return
  
  isSwitching = true
  currentIndex.value = index
  
  const targetPath = tabs[index].path
  
  // Use redirectTo for tab pages to avoid page stack issues
  uni.redirectTo({ 
    url: targetPath,
    success: () => {
      isSwitching = false
    },
    fail: (err) => {
      console.error('Tab switch failed:', err)
      isSwitching = false
      // Fallback to navigateTo
      uni.navigateTo({ 
        url: targetPath,
        fail: () => {
          uni.showToast({ title: '页面跳转失败', icon: 'none' })
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
  
  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    
    .tab-icon {
      font-size: 44rpx;
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }
    
    .tab-text {
      font-size: 22rpx;
      color: #8a8a8a;
      margin-top: 4rpx;
      transition: color 0.2s ease;
    }
    
    &.active {
      .tab-icon {
        opacity: 1;
      }
      
      .tab-text {
        color: #1a73e8;
        font-weight: 600;
      }
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}
</style>