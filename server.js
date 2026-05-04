import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { initDb } from "./src/db/models.js";
import {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  saveScreenRecord,
  getLatestScreenRecord,
  createPost,
  getPosts,
  addComment,
  getComments,
  likePost,
  createChatSession,
  getChatSessions,
  getChatSessionById,
  deleteChatSession,
  saveChatMessage,
  getChatMessages
} from "./src/db/operations.js";

dotenv.config();

const app = express();

// 启用压缩和性能优化
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

const COZE_BASE = process.env.COZE_BASE || "https://api.coze.cn";
const COZE_TOKEN = process.env.COZE_TOKEN;
const BOT_ID = process.env.BOT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "health-assistant-secret";

// 简单的内存缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

function getCache(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

if (!COZE_TOKEN) {
  console.warn("警告：缺少 COZE_TOKEN 环境变量，AI聊天功能将不可用");
}

async function cozeFetch(path, options) {
  const method = (options && options.method) || "GET";
  const query = (options && options.query) || null;
  const body = (options && options.body) || null;

  const qs = new URLSearchParams(query || {}).toString();
  const url = COZE_BASE + path + (qs ? "?" + qs : "");

  const headers = {
    "Authorization": "Bearer " + COZE_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  try {
    const resp = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    return resp;
  } catch (err) {
    throw new Error("网络请求失败: " + err.message);
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: -1, msg: '未授权' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ code: -1, msg: 'token无效' });
    }
    req.user = user;
    next();
  });
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email, phone, nickname } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: -1, msg: '用户名和密码必填' });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ code: -1, msg: '用户名已存在' });
    }

    const user = await createUser({ username, password, email, phone, nickname });
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({ code: 0, msg: '注册成功', data: { user: { id: user.id, username: user.username, nickname: user.nickname }, token } });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: -1, msg: '用户名和密码必填' });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ code: -1, msg: '用户名或密码错误' });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(400).json({ code: -1, msg: '用户名或密码错误' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({ code: 0, msg: '登录成功', data: { user: { id: user.id, username: user.username, nickname: user.nickname, email: user.email, phone: user.phone }, token } });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ code: -1, msg: '用户不存在' });
    }
    return res.json({ code: 0, data: user });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/screen", async (req, res) => {
  try {
    const { answers, userId } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ code: -1, msg: '缺少答案数据' });
    }

    let health_score = 0;
    let category = '健康';
    let dimensions = [];
    let suggestions = [];
    let risks = [];
    let ai_analysis = '';

    const answerMap = {};
    answers.forEach(answer => {
      answerMap[answer.question_id] = answer.answer;
    });

    const getAnswerScore = (questionId, scoreMap) => {
      const answer = answerMap[questionId];
      if (typeof answer === 'number') return answer;
      if (typeof answer === 'string' && !isNaN(parseInt(answer))) return parseInt(answer);
      return scoreMap[answer] || 0;
    };

    const sleepScore = getAnswerScore(1, { good: 10, average: 6, poor: 3, severe: 1 }) / 10;
    const exerciseScore = getAnswerScore(2, { high: 10, medium: 6, low: 3, none: 1 }) / 10;
    const dietScore = getAnswerScore(3, { balanced: 10, average: 6, unhealthy: 3, severe: 1 }) / 10;
    const mentalScore = getAnswerScore(4, { none: 10, low: 7, medium: 4, high: 1 }) / 10;
    
    const multiAnswer = answerMap[5];
    const symptomCount = Array.isArray(multiAnswer) && multiAnswer.length > 0 && !multiAnswer.includes('none') ? multiAnswer.length : 0;
    const symptomScore = Math.max(0, 10 - symptomCount * 1.5) / 10;
    
    const satisfactionScore = (getAnswerScore(6, {}) || 5) / 10;
    const screenTimeScore = getAnswerScore(7, { low: 10, medium: 7, high: 4, extreme: 1 }) / 10;
    const habitScore = getAnswerScore(8, { none: 10, occasional: 7, regular: 4, heavy: 1 }) / 10;

    dimensions = [
      { name: '睡眠质量', score: Math.round(sleepScore * 100) },
      { name: '运动情况', score: Math.round(exerciseScore * 100) },
      { name: '饮食习惯', score: Math.round(dietScore * 100) },
      { name: '心理压力', score: Math.round(mentalScore * 100) },
      { name: '身体症状', score: Math.round(symptomScore * 100) },
      { name: '健康满意度', score: Math.round(satisfactionScore * 100) },
      { name: '屏幕时间', score: Math.round(screenTimeScore * 100) },
      { name: '生活习惯', score: Math.round(habitScore * 100) }
    ];

    health_score = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

    if (health_score >= 80) category = '健康';
    else if (health_score >= 60) category = '轻度亚健康';
    else if (health_score >= 40) category = '中度亚健康';
    else category = '重度亚健康';

    if (sleepScore < 0.6) {
      risks.push('睡眠不足');
      suggestions.push('建议保证充足睡眠，每晚7-8小时');
    }
    if (exerciseScore < 0.6) {
      risks.push('缺乏运动');
      suggestions.push('建议每周至少运动3次，每次30分钟以上');
    }
    if (dietScore < 0.6) {
      risks.push('饮食不均衡');
      suggestions.push('建议规律饮食，增加蔬菜水果摄入');
    }
    if (mentalScore < 0.6) {
      risks.push('心理压力较大');
      suggestions.push('建议适当放松，保持良好心态');
    }
    if (habitScore < 0.6) {
      risks.push('不良生活习惯');
      suggestions.push('建议戒烟限酒，保持规律作息');
    }
    if (symptomScore < 0.7) {
      risks.push('身体症状较多');
      suggestions.push('建议关注身体信号，必要时咨询医生');
    }
    if (screenTimeScore < 0.6) {
      risks.push('屏幕时间过长');
      suggestions.push('建议减少电子设备使用时间，注意眼部休息');
    }

    if (COZE_TOKEN) {
      try {
        const healthSummary = `健康评分: ${health_score}, 分类: ${category}, 维度: ${JSON.stringify(dimensions)}`;
        const chatResp = await cozeFetch("/v3/chat", {
          method: "POST",
          body: {
            bot_id: BOT_ID,
            user_id: userId || "screen_user",
            stream: false,
            additional_messages: [{
              role: "user",
              content: `请分析以下健康筛查结果并给出专业建议：${healthSummary}。用户回答的问题涉及睡眠、饮食、运动、心理、生活方式五个维度。`
            }]
          }
        });

        const chatJson = await chatResp.json();
        if (chatJson.code === 0 && chatJson.data && chatJson.data.messages) {
          ai_analysis = chatJson.data.messages[chatJson.data.messages.length - 1]?.content || '';
        } else {
          console.log('Coze API Error:', chatJson.code, chatJson.msg);
        }
      } catch (aiErr) {
        console.log('AI分析失败:', aiErr.message);
      }
    }

    const record = await saveScreenRecord({
      user_id: userId,
      answers,
      health_score,
      category,
      dimensions,
      suggestions,
      risks,
      ai_analysis
    });

    return res.json({
      code: 0,
      msg: '筛查完成',
      data: {
        health_score,
        category,
        dimensions,
        suggestions,
        risks,
        ai_analysis,
        record_id: record.id
      }
    });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/screen/latest", authenticateToken, async (req, res) => {
  try {
    const record = await getLatestScreenRecord(req.user.userId);
    if (!record) {
      return res.json({ code: 0, data: null });
    }
    return res.json({ code: 0, data: record });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!COZE_TOKEN) {
      return res.json({ code: 0, reply: "AI聊天功能暂不可用，请配置COZE_TOKEN" });
    }

    const { message, userId } = req.body;
    const user_id = userId || "chat_user_" + Date.now();
    
    // Step 1: Create chat request
    const chatResp = await cozeFetch("/v3/chat", {
      method: "POST",
      body: {
        bot_id: BOT_ID,
        user_id: user_id,
        stream: false,
        auto_save_history: true,
        additional_messages: [{
          role: "user",
          content: message,
          content_type: "text"
        }]
      }
    });

    const chatJson = await chatResp.json();
    console.log('Coze API Create Response:', JSON.stringify(chatJson));
    
    if (chatJson.code !== 0) {
      console.log('Coze API Error - Code:', chatJson.code, 'Message:', chatJson.msg);
      return res.json({ code: 0, reply: "抱歉，暂时无法获取回复" });
    }

    const conversationId = chatJson.data?.conversation_id;
    const chatId = chatJson.data?.id;

    if (!conversationId || !chatId) {
      return res.json({ code: 0, reply: "抱歉，暂时无法获取回复" });
    }

    // Step 2: Poll for chat result with shorter interval
    let retryCount = 0;
    const maxRetries = 60; // 最多等待30秒
    
    while (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 每500ms检查一次
      
      const statusResp = await cozeFetch("/v3/chat/retrieve", {
        method: "GET",
        query: {
          conversation_id: conversationId,
          chat_id: chatId
        }
      });

      const statusJson = await statusResp.json();
      
      if (statusJson.code !== 0) {
        console.log('Status check error:', statusJson.msg);
        break;
      }

      const status = statusJson.data?.status;
      
      if (status === "completed") {
        // Get messages
        const msgResp = await cozeFetch("/v3/chat/message/list", {
          method: "GET",
          query: {
            conversation_id: conversationId,
            chat_id: chatId
          }
        });

        const msgJson = await msgResp.json();
        
        if (msgJson.code === 0 && msgJson.data && msgJson.data.length > 0) {
          const assistantMsg = msgJson.data.find(m => m.role === "assistant");
          if (assistantMsg && assistantMsg.content) {
            return res.json({ code: 0, reply: assistantMsg.content });
          }
        }
        break;
      } else if (status === "failed") {
        console.log('Chat failed:', statusJson.data?.last_error);
        break;
      }
      
      retryCount++;
    }

    return res.json({ code: 0, reply: "抱歉，AI回复超时，请稍后再试" });
  } catch (err) {
    console.error('Chat API Error:', err.message);
    return res.json({ code: 0, reply: "抱歉，暂时无法获取回复" });
  }
});

app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { title, content, images } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ code: -1, msg: '标题和内容必填' });
    }

    const post = await createPost({
      user_id: req.user.userId,
      title,
      content,
      images
    });

    return res.json({ code: 0, msg: '发布成功', data: post });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const posts = await getPosts(page, pageSize);
    return res.json({ code: 0, data: posts });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/posts/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.id);
    
    if (!content) {
      return res.status(400).json({ code: -1, msg: '评论内容必填' });
    }

    const comment = await addComment({
      post_id: postId,
      user_id: req.user.userId,
      content
    });

    return res.json({ code: 0, msg: '评论成功', data: comment });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/posts/:id/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const comments = await getComments(postId);
    return res.json({ code: 0, data: comments });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await likePost(postId);
    return res.json({ code: 0, msg: '点赞成功' });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/profile", (req, res) => {
  return res.json({
    code: 0,
    data: {
      nickname: '用户',
      avatar: '',
      healthScore: 0,
      screenCount: 0,
      joinDate: new Date().toISOString()
    }
  });
});

app.post("/api/food_recognize", (req, res) => {
  return res.json({
    code: 0,
    data: {
      foodName: '未知食物',
      calories: 0,
      nutrition: { protein: 0, fat: 0, carbs: 0 },
      suggestions: ['建议均衡饮食']
    }
  });
});

app.get("/api/coze/online-info", async (req, res) => {
  try {
    if (!COZE_TOKEN) {
      return res.status(500).json({ code: -1, msg: '未配置COZE_TOKEN' });
    }

    const resp = await cozeFetch("/v1/bot/get_online_info", {
      query: { bot_id: BOT_ID }
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/coze/chat/stream", async (req, res) => {
  try {
    if (!COZE_TOKEN) {
      res.write("event:error\n");
      res.write("data:{\"msg\":\"未配置COZE_TOKEN\"}\n\n");
      return res.end();
    }

    const body = req.body || {};
    const conversationId = body.conversation_id || "";
    const botId = body.bot_id || BOT_ID;
    const userId = body.user_id || "anonymous_" + Date.now();

    const requestBody = {
      bot_id: botId,
      user_id: userId,
      stream: true,
      auto_save_history: body.auto_save_history !== false,
      additional_messages: body.additional_messages || []
    };

    if (!requestBody.bot_id) {
      return res.status(400).json({ code: -1, msg: "bot_id 为必填" });
    }

    const resp = await cozeFetch("/v3/chat", {
      method: "POST",
      query: conversationId ? { conversation_id: String(conversationId) } : null,
      body: requestBody
    });

    res.status(resp.status);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!resp.body) {
      res.write("event:error\n");
      res.write("data:{\"msg\":\"上游没有返回流\"}\n\n");
      return res.end();
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';

    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      
      buffer += decoder.decode(chunk.value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          // Empty line means end of event, reset current event
          currentEvent = '';
          continue;
        }
        
        // Track current event type
        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.substring(6).trim();
          continue;
        }
        
        // Parse SSE data lines
        if (trimmedLine.startsWith('data:')) {
          const jsonStr = trimmedLine.substring(5).trim();
          if (!jsonStr) continue;
          
          try {
            const data = JSON.parse(jsonStr);
            
            // Extract content from message delta events
            if (currentEvent === 'conversation.message.delta' && data.content) {
              const content = data.content || '';
              if (content) {
                res.write(`data:${JSON.stringify({ content })}\n\n`);
              }
            } else if (currentEvent === 'conversation.message.completed' && data.content) {
              const content = data.content || '';
              if (content) {
                res.write(`data:${JSON.stringify({ content })}\n\n`);
              }
            } else if (currentEvent === 'conversation.chat.completed') {
              // Chat completed
              res.write(`data:${JSON.stringify({ done: true })}\n\n`);
            }
          } catch {
            // Not valid JSON, pass through as content
            const text = trimmedLine.substring(5).trim();
            if (text) {
              res.write(`data:${JSON.stringify({ content: text })}\n\n`);
            }
          }
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      res.write(buffer + '\n');
    }

    return res.end();
  } catch (err) {
    res.write("event:error\n");
    res.write("data:{\"msg\":\"" + String(err.message).replace(/"/g, "'") + "\"}\n\n");
    return res.end();
  }
});

app.post("/api/coze/chat/non-stream", async (req, res) => {
  try {
    if (!COZE_TOKEN) {
      return res.json({ code: -1, msg: '未配置COZE_TOKEN' });
    }

    const body = req.body || {};
    const botId = body.bot_id || BOT_ID;
    const userId = body.user_id || "anonymous_" + Date.now();

    const chatResp = await cozeFetch("/v3/chat", {
      method: "POST",
      query: body.conversation_id ? { conversation_id: String(body.conversation_id) } : null,
      body: {
        bot_id: botId,
        user_id: userId,
        stream: false,
        auto_save_history: true,
        additional_messages: body.additional_messages || []
      }
    });

    const chatJson = await chatResp.json();
    console.log('Coze API Response:', JSON.stringify(chatJson));

    if (chatJson.code !== 0) {
      console.log('Coze API Error - Code:', chatJson.code, 'Message:', chatJson.msg);
      return res.status(200).json({ reply: "抱歉，暂时无法获取回复" });
    }

    return res.status(chatResp.status).json(chatJson);
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

// Chat session APIs
app.post("/api/chat/sessions", async (req, res) => {
  try {
    const { userId, title } = req.body;
    const session = await createChatSession(userId, title);
    return res.json({ code: 0, data: session });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/chat/sessions", async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId) : null;
    const sessions = await getChatSessions(userId);
    return res.json({ code: 0, data: sessions });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/chat/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = await getChatSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ code: -1, msg: '会话不存在' });
    }
    const messages = await getChatMessages(sessionId);
    return res.json({ code: 0, data: { session, messages } });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.delete("/api/chat/sessions/:id", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    await deleteChatSession(sessionId);
    return res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.post("/api/chat/sessions/:id/messages", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { role, content } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({ code: -1, msg: '角色和内容必填' });
    }
    
    const message = await saveChatMessage(sessionId, role, content);
    return res.json({ code: 0, data: message });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

app.get("/api/chat/sessions/:id/messages", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const messages = await getChatMessages(sessionId);
    return res.json({ code: 0, data: messages });
  } catch (err) {
    return res.status(500).json({ code: -1, msg: err.message });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`数据库连接: ${process.env.DB_STORAGE || 'database.sqlite'}`);
  });
}

startServer().catch(err => {
  console.error('服务器启动失败:', err.message);
});
