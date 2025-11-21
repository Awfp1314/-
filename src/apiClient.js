// API配置
const API_BASE_URL = 'http://localhost:3030/api';
const WS_URL = 'ws://localhost:3030';

// WebSocket连接
let ws = null;
let wsCallbacks = new Map();
let wsConnectedCallback = null; // 连接成功后的回调

// 连接WebSocket
export function connectWebSocket(onConnected) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (onConnected) onConnected();
    return;
  }

  if (onConnected) {
    wsConnectedCallback = onConnected;
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('✅ WebSocket已连接');
    
    // 触发连接成功回调
    if (wsConnectedCallback) {
      wsConnectedCallback();
      wsConnectedCallback = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const { type, data } = JSON.parse(event.data);
      
      // 触发所有注册的回调
      if (wsCallbacks.has(type)) {
        wsCallbacks.get(type).forEach(callback => callback(data));
      }
      
      // 触发通用回调
      if (wsCallbacks.has('*')) {
        wsCallbacks.get('*').forEach(callback => callback({ type, data }));
      }
    } catch (error) {
      console.error('WebSocket消息解析失败:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket错误:', error);
  };

  ws.onclose = () => {
    console.log('🔌 WebSocket已断开，5秒后重连...');
    setTimeout(connectWebSocket, 5000);
  };
}

// 订阅WebSocket事件
export function subscribeWebSocket(type, callback) {
  if (!wsCallbacks.has(type)) {
    wsCallbacks.set(type, new Set());
  }
  wsCallbacks.get(type).add(callback);

  // 返回取消订阅函数
  return () => {
    if (wsCallbacks.has(type)) {
      wsCallbacks.get(type).delete(callback);
    }
  };
}

// 发送WebSocket消息
export function sendWebSocketMessage(type, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...data }));
  }
}

// HTTP请求封装
async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    return { success: false, message: '网络请求失败' };
  }
}

// ==================== 用户API ====================

export async function registerUser(phone, password, username, avatar) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, username, avatar }),
  });
}

export async function loginUser(phone, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function getAllUsers() {
  return request('/users');
}

export async function updateUser(id, updates) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ==================== 反馈API ====================

export async function submitFeedback(feedback) {
  return request('/feedbacks', {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
}

export async function getAllFeedbacks() {
  return request('/feedbacks');
}

export async function markFeedbackAsRead(id) {
  return request(`/feedbacks/${id}/read`, {
    method: 'PUT',
  });
}

export async function deleteFeedback(id) {
  return request(`/feedbacks/${id}`, {
    method: 'DELETE',
  });
}

// ==================== 纠错报告API ====================

export async function submitErrorReport(report) {
  return request('/error-reports', {
    method: 'POST',
    body: JSON.stringify(report),
  });
}

export async function getAllErrorReports() {
  return request('/error-reports');
}

export async function markErrorReportAsRead(id) {
  return request(`/error-reports/${id}/read`, {
    method: 'PUT',
  });
}

export async function deleteErrorReport(id) {
  return request(`/error-reports/${id}`, {
    method: 'DELETE',
  });
}

// ==================== 通知API ====================

export async function sendNotification(notification) {
  return request('/notifications', {
    method: 'POST',
    body: JSON.stringify(notification),
  });
}

export async function getAllNotifications() {
  return request('/notifications');
}

export async function markNotificationAsRead(id) {
  return request(`/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export async function deleteNotification(id) {
  return request(`/notifications/${id}`, {
    method: 'DELETE',
  });
}

// ==================== 答题进度API ====================

export async function saveUserProgress(userId, answeredIds, wrongIds) {
  return request('/progress', {
    method: 'POST',
    body: JSON.stringify({ userId, answeredIds, wrongIds }),
  });
}

export async function getUserProgress(userId) {
  return request(`/progress/${userId}`);
}

export async function getAllUserProgress() {
  return request('/progress/all');
}

// 健康检查
export async function checkHealth() {
  return request('/health');
}

// ==================== 题库管理 API ====================

// 获取所有题目
export async function getAllQuestions() {
  return request('/questions');
}

// 根据ID获取题目
export async function getQuestionById(questionId) {
  return request(`/questions/${questionId}`);
}

// 添加新题目
export async function addQuestion(questionData) {
  return request('/questions', {
    method: 'POST',
    body: JSON.stringify(questionData)
  });
}

// 更新题目
export async function updateQuestion(questionId, updates) {
  return request(`/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

// 删除题目
export async function deleteQuestion(questionId) {
  return request(`/questions/${questionId}`, {
    method: 'DELETE'
  });
}

// 批量导入题库
export async function importQuestions(questions) {
  return request('/questions/import', {
    method: 'POST',
    body: JSON.stringify({ questions })
  });
}

// ==================== 公告管理 API ====================

// 获取公告
export async function getAnnouncement() {
  return request('/announcement');
}

// 更新公告
export async function updateAnnouncement(announcementData) {
  return request('/announcement', {
    method: 'PUT',
    body: JSON.stringify(announcementData)
  });
}
