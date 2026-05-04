<template>
  <view class="chat-page">
    <view class="chat-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="header-left">
          <view class="back-btn" v-if="currentSessionId" @click="goBackToSessions">
            <text>←</text>
          </view>
          <view class="header-info">
            <text class="header-title">{{ currentSessionId ? '对话详情' : 'AI健康助手' }}</text>
            <text class="header-subtitle" v-if="!currentSessionId">选择或创建一个对话开始咨询</text>
          </view>
        </view>
        <view class="new-chat-btn" v-if="currentSessionId" @click="createNewSession">
          <text>+ 新对话</text>
        </view>
      </view>
    </view>

    <!-- Session List -->
    <scroll-view class="session-list" scroll-y v-if="!currentSessionId">
      <view class="session-item" v-for="session in sessions" :key="session.id" @click="loadSession(session.id)">
        <view class="session-icon">💬</view>
        <view class="session-info">
          <text class="session-title">{{ session.title || '新对话' }}</text>
          <text class="session-time">{{ formatDate(session.updated_at) }}</text>
        </view>
        <view class="session-arrow">→</view>
      </view>
      
      <view class="empty-state" v-if="sessions.length === 0">
        <text class="empty-icon">💬</text>
        <text class="empty-text">还没有对话记录</text>
        <text class="empty-subtext">点击下方的"开始新对话"按钮开始咨询</text>
      </view>
      
      <view class="create-session-btn" @click="createNewSession">
        <text>+ 开始新对话</text>
      </view>
    </scroll-view>

    <!-- Chat Messages -->
    <scroll-view class="chat-messages" scroll-y :scroll-into-view="scrollToId" :scroll-with-animation="true" v-else>
      <view class="message-list">
        <view class="welcome-message" v-if="messages.length === 0">
          <text class="welcome-avatar">🤖</text>
          <text class="welcome-text">您好！我是您的AI健康助手，请问有什么可以帮助您的？</text>
        </view>
        
        <view class="message-item" v-for="(msg, index) in messages" :key="msg.id || index" :id="'msg-' + (msg.id || index)"
          :class="{ 'user-message': msg.role === 'user', 'assistant-message': msg.role === 'assistant' }">
          <text class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</text>
          <view class="message-content">
            <text class="message-text">{{ msg.content }}</text>
            <text class="message-time">{{ formatTime(msg.created_at || msg.timestamp) }}</text>
          </view>
        </view>
        
        <view class="typing-indicator" v-if="isTyping">
          <view class="typing-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
          <text class="typing-text">AI正在思考...</text>
        </view>
      </view>
    </scroll-view>

    <!-- Input Area -->
    <view class="chat-input-area" v-if="currentSessionId">
      <view class="quick-replies">
        <view class="quick-btn" v-for="(reply, index) in quickReplies" :key="index" @click="sendQuickReply(reply)">
          {{ reply }}
        </view>
      </view>
      
      <view class="input-bar">
        <view class="action-btn" @click="chooseImage">📷</view>
        <input class="message-input" v-model="inputMessage" placeholder="输入您的健康问题..." confirm-type="send" @confirm="sendMessage" />
        <view class="send-btn" :class="{ active: inputMessage.trim() }" @click="sendMessage">发送</view>
      </view>
    </view>
    
    <TabBar v-if="!currentSessionId" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { getChatResponseStream } from '@/api/health'
import TabBar from '@/components/TabBar.vue'

interface ChatMessage {
  id?: number
  role: string
  content: string
  created_at?: string
  timestamp?: number
}

interface ChatSession {
  id: number
  title: string
  user_id: number | null
  created_at: string
  updated_at: string
}

const sessions = ref<ChatSession[]>([])
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const scrollToId = ref('')
const isStreaming = ref(false)
const currentSessionId = ref<number | null>(null)

const quickReplies = ['如何改善睡眠质量？', '推荐一些健康食谱', '运动后如何恢复？', '压力大怎么办？']

onMounted(() => {
  loadSessions()
})

async function loadSessions() {
  try {
    const result = await uni.request({
      url: '/api/chat/sessions',
      method: 'GET'
    })
    
    const data = result.data as any
    if (data.code === 0) {
      sessions.value = data.data || []
    }
  } catch (err) {
    console.error('加载会话失败:', err)
  }
}

async function createNewSession() {
  try {
    const result = await uni.request({
      url: '/api/chat/sessions',
      method: 'POST',
      data: {
        title: '新对话',
        userId: null
      }
    })
    
    const data = result.data as any
    if (data.code === 0) {
      currentSessionId.value = data.data.id
      messages.value = []
      await loadSessions()
    }
  } catch (err) {
    console.error('创建会话失败:', err)
    uni.showToast({ title: '创建会话失败', icon: 'none' })
  }
}

async function loadSession(sessionId: number) {
  try {
    const result = await uni.request({
      url: `/api/chat/sessions/${sessionId}`,
      method: 'GET'
    })
    
    const data = result.data as any
    if (data.code === 0) {
      currentSessionId.value = sessionId
      messages.value = data.data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at
      }))
      
      await nextTick()
      scrollToBottom()
    }
  } catch (err) {
    console.error('加载会话失败:', err)
    uni.showToast({ title: '加载会话失败', icon: 'none' })
  }
}

function goBackToSessions() {
  currentSessionId.value = null
  messages.value = []
  loadSessions()
}

async function sendMessage() {
  if (!inputMessage.value.trim() || isStreaming.value || !currentSessionId.value) return
  
  const content = inputMessage.value.trim()
  const userMsg: ChatMessage = {
    role: 'user',
    content: content,
    timestamp: Date.now()
  }
  
  messages.value.push(userMsg)
  inputMessage.value = ''
  
  await nextTick()
  scrollToBottom()
  
  // Save user message to database
  try {
    await uni.request({
      url: `/api/chat/sessions/${currentSessionId.value}/messages`,
      method: 'POST',
      data: {
        role: 'user',
        content: content
      }
    })
  } catch (err) {
    console.error('保存用户消息失败:', err)
  }
  
  isTyping.value = true
  isStreaming.value = true
  
  try {
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    }
    messages.value.push(assistantMsg)
    
    await getChatResponseStream(
      content,
      (chunk: string) => {
        if (!assistantMsg.content.endsWith(chunk)) {
          assistantMsg.content += chunk
          nextTick(() => scrollToBottom())
        }
      },
      messages.value
    )
    
    // Save assistant message to database
    if (assistantMsg.content) {
      try {
        await uni.request({
          url: `/api/chat/sessions/${currentSessionId.value}/messages`,
          method: 'POST',
          data: {
            role: 'assistant',
            content: assistantMsg.content
          }
        })
      } catch (err) {
        console.error('保存AI回复失败:', err)
      }
    }
  } catch {
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg.role === 'assistant') {
      lastMsg.content = '抱歉，暂时无法获取回复，请稍后再试。'
    }
  } finally {
    isTyping.value = false
    isStreaming.value = false
    await nextTick()
    scrollToBottom()
  }
}

function sendQuickReply(reply: string) {
  inputMessage.value = reply
  sendMessage()
}

function scrollToBottom() {
  if (messages.value.length > 0) {
    const lastMsg = messages.value[messages.value.length - 1]
    scrollToId.value = 'msg-' + (lastMsg.id || messages.value.length - 1)
  }
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    success: () => {
      uni.showToast({ title: '图片功能开发中', icon: 'none' })
    }
  })
}

function formatTime(timestamp: string | number | undefined): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style lang="scss" scoped>
.chat-page { min-height: 100vh; background: #f5f7fa; display: flex; flex-direction: column; }

.chat-header {
  position: relative; padding-top: 80rpx; padding-bottom: 32rpx;
  
  .header-bg {
    position: absolute; top: 0; left: 0; right: 0; height: 280rpx;
    background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
    border-radius: 0 0 40rpx 40rpx;
  }
  
  .header-content { 
    position: relative; z-index: 1; padding: 0 32rpx; 
    display: flex; justify-content: space-between; align-items: center;
  }
  
  .header-left { display: flex; align-items: center; gap: 16rpx; }
  
  .back-btn {
    width: 64rpx; height: 64rpx; background: rgba(255,255,255,0.2); border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 32rpx; color: #fff;
  }
  
  .header-title { font-size: 44rpx; font-weight: 700; color: #fff; display: block; }
  
  .header-subtitle { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 8rpx; display: block; }
  
  .new-chat-btn {
    padding: 12rpx 24rpx; background: rgba(255,255,255,0.2); border-radius: 32rpx;
    font-size: 24rpx; color: #fff;
  }
}

.session-list { flex: 1; padding: 24rpx; }

.session-item {
  display: flex; align-items: center; gap: 24rpx;
  padding: 24rpx; background: #fff; border-radius: 24rpx;
  margin-bottom: 16rpx;
  
  .session-icon { font-size: 40rpx; }
  
  .session-info { flex: 1; }
  
  .session-title { font-size: 28rpx; color: #1f2937; font-weight: 500; display: block; }
  
  .session-time { font-size: 22rpx; color: #9ca3af; margin-top: 4rpx; display: block; }
  
  .session-arrow { font-size: 28rpx; color: #9ca3af; }
  
  &:active { background: #f5f7fa; }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 120rpx 32rpx;
  
  .empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
  
  .empty-text { font-size: 28rpx; color: #6b7280; margin-bottom: 8rpx; }
  
  .empty-subtext { font-size: 24rpx; color: #9ca3af; }
}

.create-session-btn {
  margin: 32rpx; padding: 28rpx;
  background: linear-gradient(135deg, #1a73e8 0%, #4d94f0 100%);
  border-radius: 32rpx; text-align: center;
  
  text { font-size: 28rpx; color: #fff; font-weight: 600; }
  
  &:active { opacity: 0.9; }
}

.chat-messages { flex: 1; padding: 24rpx; overflow: hidden; }

.message-list { padding-bottom: 120rpx; }

.welcome-message {
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
  margin-bottom: 32rpx; padding: 32rpx; background: rgba(26,115,232,0.08);
  border-radius: 32rpx;
  
  .welcome-avatar { font-size: 64rpx; }
  
  .welcome-text { font-size: 24rpx; color: #6b7280; text-align: center; line-height: 1.6; }
}

.message-item {
  display: flex; gap: 16rpx; margin-bottom: 24rpx;
  
  &.user-message {
    flex-direction: row-reverse;
    .message-content { background: #1a73e8; .message-text { color: #fff; } .message-time { color: rgba(255,255,255,0.6); } }
  }
  
  &.assistant-message { .message-content { background: #fff; border: 1rpx solid #e5e7eb; } }
  
  .message-avatar {
    width: 72rpx; height: 72rpx; background: #f0f2f5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 32rpx;
  }
  
  .message-content {
    max-width: 70%; padding: 16rpx 24rpx; border-radius: 24rpx;
    
    .message-text { font-size: 28rpx; color: #1f2937; line-height: 1.6; display: block; }
    
    .message-time { font-size: 22rpx; color: #9ca3af; margin-top: 8rpx; display: block; text-align: right; }
  }
}

.typing-indicator {
  display: flex; align-items: center; gap: 16rpx; padding: 16rpx 24rpx;
  background: #fff; border-radius: 24rpx; width: fit-content; margin-bottom: 24rpx;
  
  .typing-dots { display: flex; gap: 8rpx; }
  
  .dot {
    width: 12rpx; height: 12rpx; background: #1a73e8; border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
  
  .typing-text { font-size: 24rpx; color: #9ca3af; }
}

@keyframes typing { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

.chat-input-area {
  background: #fff; padding: 16rpx 24rpx 160rpx;
}

.quick-replies {
  display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 16rpx;
  
  .quick-btn {
    padding: 12rpx 24rpx; background: #f0f2f5; border-radius: 32rpx;
    font-size: 24rpx; color: #6b7280;
    &:active { background: rgba(26,115,232,0.1); color: #1a73e8; }
  }
}

.input-bar {
  display: flex; align-items: center; gap: 16rpx;
  
  .action-btn {
    width: 72rpx; height: 72rpx; background: #f0f2f5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 36rpx;
  }
  
  .message-input {
    flex: 1; height: 80rpx; background: #f0f2f5; border-radius: 40rpx;
    padding: 0 24rpx; font-size: 28rpx;
  }
  
  .send-btn {
    width: 120rpx; height: 80rpx; background: #f0f2f5; border-radius: 40rpx;
    display: flex; align-items: center; justify-content: center; font-size: 28rpx;
    color: #9ca3af;
    &.active { background: #1a73e8; color: #fff; }
  }
}
</style>