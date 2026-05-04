<template>
  <view class="community-page">
    <view class="community-header">
      <view class="header-nav">
        <view class="nav-back" @click="goBack"><text>←</text></view>
        <text class="header-title">健康社区</text>
        <view class="nav-action" @click="createPost">✏️</view>
      </view>
      
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input class="search-input" placeholder="搜索话题或用户" />
      </view>
    </view>

    <view class="community-content">
      <view class="tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === tab.key }" 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="loadPosts(tab.key)"
        >
          {{ tab.name }}
        </view>
      </view>

      <view v-if="posts.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-title">暂无帖子</text>
        <text class="empty-desc">快来发布第一条帖子吧</text>
      </view>

      <view v-else class="post-list">
        <view class="post-card" v-for="post in posts" :key="post.id" @click="viewPost(post)">
          <view class="post-header">
            <view class="post-avatar">{{ post.avatar || '👤' }}</view>
            <view class="post-author-info">
              <text class="post-author">{{ post.nickname || post.username }}</text>
              <text class="post-time">{{ formatTime(post.created_at) }}</text>
            </view>
          </view>
          
          <view class="post-content">
            <text class="post-title">{{ post.title }}</text>
            <text class="post-text">{{ post.content }}</text>
            <view class="post-images" v-if="post.images && post.images.length">
              <view class="post-image" v-for="(img, index) in post.images" :key="index">{{ img }}</view>
            </view>
          </view>
          
          <view class="post-stats">
            <view class="stat-item" @click="toggleLike(post)">
              <text class="stat-icon">{{ post.liked ? '❤️' : '🤍' }}</text>
              <text class="stat-text">{{ post.likes }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">💬</text>
              <text class="stat-text">{{ post.comments_count || 0 }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">🔗</text>
              <text class="stat-text">分享</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const activeTab = ref('hot')
const posts = ref<any[]>([])

const tabs = [
  { key: 'hot', name: '热门' },
  { key: 'new', name: '最新' },
  { key: 'follow', name: '关注' },
  { key: 'me', name: '我的' }
]

onMounted(() => {
  loadPosts('hot')
})

async function loadPosts(tab: string) {
  activeTab.value = tab
  try {
    const response = await uni.request({
      url: '/api/posts',
      method: 'GET',
      data: {
        page: 1,
        pageSize: 10
      }
    })
    
    if (response.data && response.data.code === 0) {
      posts.value = response.data.data.map((post: any) => ({
        ...post,
        liked: false
      }))
    }
  } catch (e) {
    console.log('加载帖子失败:', e)
  }
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function goBack() {
  uni.navigateBack()
}

function createPost() {
  uni.showToast({ title: '发帖功能开发中', icon: 'none' })
}

function viewPost(post: any) {
  uni.showToast({ title: `查看帖子详情`, icon: 'none' })
}

function toggleLike(post: any) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}
</script>

<style lang="scss" scoped>
.community-page { min-height: 100vh; background: #f5f7fa; }

.community-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60rpx 24rpx 24rpx;
  
  .header-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
  
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
  
  .search-bar {
    display: flex; align-items: center; gap: 16rpx;
    background: rgba(255,255,255,0.2); border-radius: 40rpx; padding: 16rpx 24rpx;
    
    .search-icon { font-size: 28rpx; }
    
    .search-input {
      flex: 1; background: transparent; border: none;
      font-size: 28rpx; color: #fff;
      placeholder-color: rgba(255,255,255,0.7);
    }
  }
}

.community-content { padding: 24rpx; }

.tabs {
  display: flex; gap: 32rpx; margin-bottom: 24rpx;
  
  .tab-item {
    font-size: 28rpx; color: #6b7280; padding: 8rpx 0;
    border-bottom: 4rpx solid transparent;
    
    &.active { color: #667eea; border-color: #667eea; font-weight: 500; }
  }
}

.post-list { display: flex; flex-direction: column; gap: 24rpx; }

.post-card {
  background: #fff; border-radius: 24rpx; padding: 24rpx;
  
  .post-header {
    display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx;
  }
  
  .post-avatar {
    width: 80rpx; height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 40rpx;
  }
  
  .post-author-info { display: flex; flex-direction: column; }
  
  .post-author { font-size: 28rpx; font-weight: 500; color: #1f2937; }
  
  .post-time { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; }
  
  .post-content { margin-bottom: 16rpx; }
  
  .post-text { font-size: 28rpx; color: #4b5563; line-height: 1.6; display: block; }
  
  .post-images {
    display: flex; gap: 12rpx; margin-top: 16rpx;
    
    .post-image {
      width: 180rpx; height: 180rpx;
      background: #f5f7fa; border-radius: 16rpx;
      display: flex; align-items: center; justify-content: center;
      font-size: 64rpx;
    }
  }
  
  .post-tags {
    display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx;
    
    .post-tag {
      font-size: 24rpx; color: #667eea; background: rgba(102,126,234,0.1);
      padding: 6rpx 16rpx; border-radius: 12rpx;
    }
  }
  
  .post-stats {
    display: flex; justify-content: space-around; padding-top: 16rpx;
    border-top: 1rpx solid #f0f2f5;
  }
  
  .stat-item {
    display: flex; align-items: center; gap: 8rpx;
    
    .stat-icon { font-size: 32rpx; }
    
    .stat-text { font-size: 24rpx; color: #6b7280; }
  }
}
</style>
