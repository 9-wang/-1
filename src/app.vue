<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => { 
  console.log('App Launch')
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (token) {
    console.log('User already logged in')
  }
})

onShow(() => { 
  console.log('App Show') 
})

onHide(() => { 
  console.log('App Hide') 
})
</script>

<style lang="scss">
@import './styles/global.scss';

/* 全局性能优化 */
page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 减少重绘和回流 */
view, text, image {
  will-change: auto;
}

/* 优化滚动性能 */
scroll-view {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* 优化动画性能 */
.animated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>