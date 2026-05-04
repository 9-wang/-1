import { getDb } from './models.js';
import bcrypt from 'bcryptjs';

// 错误处理包装器
function handleError(operation, err) {
  console.error(`Database error in ${operation}:`, err.message);
  throw new Error(`Database operation failed: ${err.message}`);
}

// JSON解析安全包装器
function safeJsonParse(str, defaultValue = []) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

export async function createUser(userData) {
  const db = getDb();
  const hashedPassword = bcrypt.hashSync(userData.password, 10);
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, email, phone, password, nickname) VALUES (?, ?, ?, ?, ?)',
      [userData.username, userData.email, userData.phone, hashedPassword, userData.nickname || userData.username],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('用户名已存在'));
          } else {
            handleError('createUser', err);
          }
        }
        else resolve({ id: this.lastID, username: userData.username, nickname: userData.nickname || userData.username });
      }
    );
  });
}

export async function getUserByUsername(username) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) handleError('getUserByUsername', err);
      else resolve(row);
    });
  });
}

export async function getUserById(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username, email, phone, nickname, avatar, created_at FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) handleError('getUserById', err);
      else resolve(row);
    });
  });
}

export function verifyPassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

export async function saveScreenRecord(record) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO screen_records (user_id, answers, health_score, category, dimensions, suggestions, risks, ai_analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        record.user_id || null,
        JSON.stringify(record.answers),
        record.health_score,
        record.category,
        JSON.stringify(record.dimensions),
        JSON.stringify(record.suggestions),
        JSON.stringify(record.risks),
        record.ai_analysis
      ],
      function(err) {
        if (err) handleError('saveScreenRecord', err);
        else resolve({ id: this.lastID, ...record });
      }
    );
  });
}

export async function getScreenRecords(userId, limit = 50) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const query = userId 
      ? 'SELECT * FROM screen_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM screen_records ORDER BY created_at DESC LIMIT ?';
    const params = userId ? [userId, limit] : [limit];
    
    db.all(query, params, (err, rows) => {
      if (err) handleError('getScreenRecords', err);
      else resolve(rows.map(r => ({
        ...r,
        answers: safeJsonParse(r.answers),
        dimensions: safeJsonParse(r.dimensions),
        suggestions: safeJsonParse(r.suggestions),
        risks: safeJsonParse(r.risks)
      })));
    });
  });
}

export async function getLatestScreenRecord(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM screen_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId], (err, row) => {
      if (err) handleError('getLatestScreenRecord', err);
      else if (row) {
        resolve({
          ...row,
          answers: safeJsonParse(row.answers),
          dimensions: safeJsonParse(row.dimensions),
          suggestions: safeJsonParse(row.suggestions),
          risks: safeJsonParse(row.risks)
        });
      } else {
        resolve(null);
      }
    });
  });
}

export async function saveHealthReport(report) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO health_reports (user_id, screen_record_id, report_data) VALUES (?, ?, ?)',
      [report.user_id, report.screen_record_id, JSON.stringify(report.report_data)],
      function(err) {
        if (err) handleError('saveHealthReport', err);
        else resolve({ id: this.lastID, ...report });
      }
    );
  });
}

export async function createPost(post) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO community_posts (user_id, title, content, images) VALUES (?, ?, ?, ?)',
      [post.user_id, post.title, post.content, JSON.stringify(post.images || [])],
      function(err) {
        if (err) handleError('createPost', err);
        else resolve({ id: this.lastID, ...post });
      }
    );
  });
}

export async function getPosts(page = 1, pageSize = 10) {
  const db = getDb();
  const offset = (page - 1) * pageSize;
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT p.*, u.nickname, u.avatar FROM community_posts p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset],
      (err, rows) => {
        if (err) handleError('getPosts', err);
        else resolve(rows.map(r => ({
          ...r,
          images: safeJsonParse(r.images, [])
        })));
      }
    );
  });
}

export async function addComment(comment) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [comment.post_id, comment.user_id, comment.content],
      function(err) {
        if (err) handleError('addComment', err);
        else {
          db.run('UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?', [comment.post_id]);
          resolve({ id: this.lastID, ...comment });
        }
      }
    );
  });
}

export async function getComments(postId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT c.*, u.nickname, u.avatar FROM post_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC',
      [postId],
      (err, rows) => {
        if (err) handleError('getComments', err);
        else resolve(rows);
      }
    );
  });
}

export async function likePost(postId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run('UPDATE community_posts SET likes = likes + 1 WHERE id = ?', [postId], (err) => {
      if (err) handleError('likePost', err);
      else resolve({ success: true });
    });
  });
}

// Chat session operations
export async function createChatSession(userId, title) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
      [userId || null, title || '新对话'],
      function(err) {
        if (err) handleError('createChatSession', err);
        else resolve({ id: this.lastID, user_id: userId, title: title || '新对话' });
      }
    );
  });
}

export async function getChatSessions(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    const query = userId 
      ? 'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC'
      : 'SELECT * FROM chat_sessions WHERE user_id IS NULL ORDER BY updated_at DESC';
    const params = userId ? [userId] : [];
    
    db.all(query, params, (err, rows) => {
      if (err) handleError('getChatSessions', err);
      else resolve(rows);
    });
  });
}

export async function getChatSessionById(sessionId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM chat_sessions WHERE id = ?', [sessionId], (err, row) => {
      if (err) handleError('getChatSessionById', err);
      else resolve(row);
    });
  });
}

export async function updateChatSessionTime(sessionId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [sessionId],
      (err) => {
        if (err) handleError('updateChatSessionTime', err);
        else resolve({ success: true });
      }
    );
  });
}

export async function deleteChatSession(sessionId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM chat_sessions WHERE id = ?', [sessionId], (err) => {
      if (err) handleError('deleteChatSession', err);
      else resolve({ success: true });
    });
  });
}

// Chat message operations
export async function saveChatMessage(sessionId, role, content) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)',
      [sessionId, role, content],
      function(err) {
        if (err) handleError('saveChatMessage', err);
        else {
          // Update session time
          db.run('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);
          resolve({ id: this.lastID, session_id: sessionId, role, content });
        }
      }
    );
  });
}

export async function getChatMessages(sessionId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId],
      (err, rows) => {
        if (err) handleError('getChatMessages', err);
        else resolve(rows);
      }
    );
  });
}