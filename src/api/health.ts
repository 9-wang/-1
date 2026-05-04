import { post, get } from '@/utils/request'

export interface ScreenAnswer { question_id: number; answer: string | number }

export interface ScreenResult {
  health_score: number
  category: '健康' | '轻度亚健康' | '中度亚健康' | '重度亚健康'
  dimensions: { name: string; score: number }[]
  suggestions: string[]
  risks: string[]
}

export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: number }

export async function submitScreen(answers: ScreenAnswer[]): Promise<ScreenResult> {
  return post('/screen', { answers })
}

export async function getChatResponse(message: string, history?: ChatMessage[]): Promise<string> {
  const result = await post('/chat', { message, history })
  return result.reply || ''
}

export async function getChatResponseStream(
  message: string,
  onChunk: (chunk: string) => void,
  history?: ChatMessage[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/coze/chat/stream', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    
    let buffer = ''
    let lastContent = ''
    
    // Helper to check if content is JSON metadata
    const isJsonMetadata = (content: string): boolean => {
      if (!content) return true
      const trimmed = content.trim()
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) return true
      if (trimmed.includes('"code"') && trimmed.includes('"msg"')) return true
      if (trimmed.includes('"plugin_id"')) return true
      if (trimmed.includes('"api_name"')) return true
      if (trimmed.includes('"jiankangxiaomiaozhao"')) return true
      if (trimmed.includes('"msg_type"')) return true
      if (trimmed.includes('"finish_reason"')) return true
      return false
    }
    
    xhr.onprogress = () => {
      const fullResponse = xhr.responseText
      const newData = fullResponse.substring(buffer.length)
      if (!newData) return
      
      buffer = fullResponse
      
      const lines = newData.split('\n')
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || !trimmedLine.startsWith('data:')) continue
        
        const jsonStr = trimmedLine.substring(5).trim()
        if (!jsonStr) continue
        
        try {
          const data = JSON.parse(jsonStr)
          
          // Skip done events
          if (data.done === true) continue
          
          // Get content
          const content = data.content || ''
          if (!content) continue
          
          // Check if it's JSON metadata
          if (isJsonMetadata(content)) continue
          
          // Send the chunk directly
          onChunk(content)
        } catch {
          // Not valid JSON, might be raw text
          const text = trimmedLine.substring(5).trim()
          if (text && !isJsonMetadata(text)) {
            onChunk(text)
          }
        }
      }
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve()
      } else {
        reject(new Error(`HTTP ${xhr.status}`))
      }
    }
    
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.ontimeout = () => reject(new Error('Timeout'))
    
    xhr.send(JSON.stringify({
      message,
      history,
      additional_messages: [{
        role: 'user',
        content: message,
        content_type: 'text'
      }]
    }))
  })
}

export async function recognizeFood(imageBase64: string): Promise<any> {
  return post('/food_recognize', { image: imageBase64 })
}

export async function getUserProfile(): Promise<any> {
  return get('/profile')
}
