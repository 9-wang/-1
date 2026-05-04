const { getDb } = require('./index');

function handleError(operation, err) {
  console.error(`数据库操作 ${operation} 失败:`, err);
}

// 用户相关操作
async function createUser(username, password, nickname) {
  const db = getDb();
  try {
    const result = await db.query(
      'INSERT INTO users (username, password, nickname) VALUES ($1, $2, $3) RETURNING *',
      [username, password, nickname]
    );
    return result.rows[0];
  } catch (err) {
    handleError('createUser', err);
    throw err;
  }
}

async function getUserByUsername(username) {
  const db = getDb();
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  } catch (err) {
    handleError('getUserByUsername', err);
    throw err;
  }
}

async function getUserById(id) {
  const db = getDb();
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } catch (err) {
    handleError('getUserById', err);
    throw err;
  }
}

async function verifyPassword(username, password) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  return user.password === password ? user : null;
}

// 筛查记录操作
async function saveScreenRecord(userId, score, answers, result) {
  const db = getDb();
  try {
    const result_db = await db.query(
      'INSERT INTO screen_records (user_id, score, answers, result) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, score, JSON.stringify(answers), JSON.stringify(result)]
    );
    return result_db.rows[0];
  } catch (err) {
    handleError('saveScreenRecord', err);
    throw err;
  }
}

async function getLatestScreenRecord(userId) {
  const db = getDb();
  try {
    const result = await db.query(
      'SELECT * FROM screen_records WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  } catch (err) {
    handleError('getLatestScreenRecord', err);
    throw err;
  }
}

// 社区帖子操作
async function createPost(userId, title, content) {
  const db = getDb();
  try {
    const result = await db.query(
      'INSERT INTO community_posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content]
    );
    return result.rows[0];
  } catch (err) {
    handleError('createPost', err);
    throw err;
  }
}

async function getPosts(limit = 20) {
  const db = getDb();
  try {
    const result = await db.query(
      'SELECT * FROM community_posts ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  } catch (err) {
    handleError('getPosts', err);
    throw err;
  }
}

async function addComment(postId, userId, content) {
  const db = getDb();
  try {
    const result = await db.query(
      'INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [postId, userId, content]
    );
    return result.rows[0];
  } catch (err) {
    handleError('addComment', err);
    throw err;
  }
}

async function getComments(postId) {
  const db = getDb();
  try {
    const result = await db.query(
      'SELECT * FROM post_comments WHERE post_id = $1 ORDER BY created_at DESC',
      [postId]
    );
    return result.rows;
  } catch (err) {
    handleError('getComments', err);
    throw err;
  }
}

async function likePost(postId) {
  const db = getDb();
  try {
    await db.query(
      'UPDATE community_posts SET likes = likes + 1 WHERE id = $1',
      [postId]
    );
    return { success: true };
  } catch (err) {
    handleError('likePost', err);
    throw err;
  }
}

// 聊天会话操作
async function createChatSession(userId, title) {
  const db = getDb();
  try {
    const result = await db.query(
      'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId || null, title || '新对话']
    );
    return result.rows[0];
  } catch (err) {
    handleError('createChatSession', err);
    throw err;
  }
}

async function getChatSessions(userId) {
  const db = getDb();
  try {
    const query = userId 
      ? 'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC'
      : 'SELECT * FROM chat_sessions WHERE user_id IS NULL ORDER BY updated_at DESC';
    const params = userId ? [userId] : [];
    
    const result = await db.query(query, params);
    return result.rows;
  } catch (err) {
    handleError('getChatSessions', err);
    throw err;
  }
}

async function getChatSessionById(sessionId) {
  const db = getDb();
  try {
    const result = await db.query('SELECT * FROM chat_sessions WHERE id = $1', [sessionId]);
    return result.rows[0];
  } catch (err) {
    handleError('getChatSessionById', err);
    throw err;
  }
}

async function deleteChatSession(sessionId) {
  const db = getDb();
  try {
    await db.query('DELETE FROM chat_sessions WHERE id = $1', [sessionId]);
    return { success: true };
  } catch (err) {
    handleError('deleteChatSession', err);
    throw err;
  }
}

async function saveChatMessage(sessionId, role, content) {
  const db = getDb();
  try {
    const result = await db.query(
      'INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, role, content]
    );
    
    // 更新会话时间
    await db.query(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [sessionId]
    );
    
    return result.rows[0];
  } catch (err) {
    handleError('saveChatMessage', err);
    throw err;
  }
}

async function getChatMessages(sessionId) {
  const db = getDb();
  try {
    const result = await db.query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );
    return result.rows;
  } catch (err) {
    handleError('getChatMessages', err);
    throw err;
  }
}

module.exports = {
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
};