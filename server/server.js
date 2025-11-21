import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import * as datastore from './datastore.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加请求体大小限制
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 加载数据
datastore.loadData();

// WebSocket 连接管理
const clients = new Set();
const userSessions = new Map(); // userId -> { ws, status, lastActivity }

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('🔌 新客户端连接，当前连接数:', clients.size);

  // 处理客户端消息（用于用户认证和状态更新）
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'USER_CONNECT') {
        // 用户登录时注册会话
        userSessions.set(data.userId, {
          ws,
          status: 'online',
          lastActivity: Date.now()
        });
        console.log(`👤 用户 ${data.userId} 上线`);
        broadcast('USER_STATUS_CHANGED', { 
          userId: data.userId, 
          status: 'online' 
        });
      } else if (data.type === 'STATUS_UPDATE') {
        // 更新用户状态
        const session = userSessions.get(data.userId);
        if (session) {
          session.status = data.status;
          session.lastActivity = Date.now();
          broadcast('USER_STATUS_CHANGED', { 
            userId: data.userId, 
            status: data.status 
          });
        }
      }
    } catch (error) {
      console.error('WebSocket消息处理错误:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    
    // 查找并移除断开的用户会话
    for (const [userId, session] of userSessions.entries()) {
      if (session.ws === ws) {
        userSessions.delete(userId);
        console.log(`👤 用户 ${userId} 离线`);
        broadcast('USER_STATUS_CHANGED', { 
          userId, 
          status: 'offline' 
        });
        break;
      }
    }
    
    console.log('❌ 客户端断开，当前连接数:', clients.size);
  });
});

// 广播消息给所有客户端
function broadcast(type, data) {
  const message = JSON.stringify({ type, data });
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// ==================== 用户 API ====================

// 用户注册
app.post('/api/register', (req, res) => {
  const { phone, password, username, avatar = '👤' } = req.body;
  const result = datastore.createUser(phone, password, username, avatar);
  res.json(result);
});

// 用户登录
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const result = datastore.loginUser(phone, password);
  res.json(result);
});

// 获取所有用户（管理员）
app.get('/api/users', (req, res) => {
  const result = datastore.getAllUsers();
  
  // 添加在线状态信息
  if (result.success) {
    result.users = result.users.map(user => {
      const session = userSessions.get(user.phone);
      return {
        ...user,
        onlineStatus: session ? session.status : 'offline',
        lastActivity: session ? session.lastActivity : null
      };
    });
  }
  
  res.json(result);
});

// 更新用户资料
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, avatar } = req.body;
  const result = datastore.updateUser(parseInt(id), { username, avatar });
  res.json(result);
});

// ==================== 反馈 API ====================

// 提交反馈
app.post('/api/feedbacks', (req, res) => {
  const feedback = req.body;
  const result = datastore.createFeedback(feedback);
  
  if (result.success) {
    broadcast('NEW_FEEDBACK', result.feedback);
  }
  
  res.json(result);
});

// 获取所有反馈
app.get('/api/feedbacks', (req, res) => {
  const result = datastore.getAllFeedbacks();
  res.json(result);
});

// 标记反馈为已读
app.put('/api/feedbacks/:id/read', (req, res) => {
  const { id } = req.params;
  const result = datastore.markFeedbackAsRead(parseInt(id));
  
  if (result.success) {
    broadcast('FEEDBACK_READ', { id: parseInt(id) });
  }
  
  res.json(result);
});

// 删除反馈
app.delete('/api/feedbacks/:id', (req, res) => {
  const { id } = req.params;
  const result = datastore.deleteFeedback(parseInt(id));
  
  if (result.success) {
    broadcast('FEEDBACK_DELETED', { id: parseInt(id) });
  }
  
  res.json(result);
});

// ==================== 纠错报告 API ====================

// 提交纠错报告
app.post('/api/error-reports', (req, res) => {
  const report = req.body;
  const result = datastore.createErrorReport(report);
  
  if (result.success) {
    broadcast('NEW_ERROR_REPORT', result.report);
  }
  
  res.json(result);
});

// 获取所有纠错报告
app.get('/api/error-reports', (req, res) => {
  const result = datastore.getAllErrorReports();
  res.json(result);
});

// 标记纠错报告为已读
app.put('/api/error-reports/:id/read', (req, res) => {
  const { id } = req.params;
  const result = datastore.markErrorReportAsRead(parseInt(id));
  
  if (result.success) {
    broadcast('ERROR_REPORT_READ', { id: parseInt(id) });
  }
  
  res.json(result);
});

// 删除纠错报告
app.delete('/api/error-reports/:id', (req, res) => {
  const { id } = req.params;
  const result = datastore.deleteErrorReport(parseInt(id));
  
  if (result.success) {
    broadcast('ERROR_REPORT_DELETED', { id: parseInt(id) });
  }
  
  res.json(result);
});

// ==================== 通知 API ====================

// 发送全局通知
app.post('/api/notifications', (req, res) => {
  const notification = req.body;
  const result = datastore.createNotification(notification);
  
  if (result.success) {
    // 广播新通知
    broadcast('NEW_NOTIFICATION', result.notification);
    
    // 如果是警告类型，额外广播全局消息事件（触发弹窗）
    if (result.notification.type === 'alert' || result.notification.type === 'warning') {
      broadcast('GLOBAL_MESSAGE', result.notification);
    }
  }
  
  res.json(result);
});

// 获取所有通知
app.get('/api/notifications', (req, res) => {
  const result = datastore.getAllNotifications();
  res.json(result);
});

// 标记通知为已读
app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const result = datastore.markNotificationAsRead(parseInt(id));
  res.json(result);
});

// 删除通知
app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  const result = datastore.deleteNotification(parseInt(id));
  res.json(result);
});

// ==================== 答题进度 API ====================

// 保存用户答题进度
app.post('/api/progress', (req, res) => {
  const { userId, answeredIds, wrongIds } = req.body;
  const result = datastore.saveUserProgress(userId, { answeredIds, wrongIds });
  res.json(result);
});

// 获取所有用户答题进度（管理员）
app.get('/api/progress/all', (req, res) => {
  const result = datastore.getAllUserProgress();
  res.json(result);
});

// 获取用户答题进度
app.get('/api/progress/:userId', (req, res) => {
  const { userId } = req.params;
  const result = datastore.getUserProgress(userId);
  res.json(result);
});

// ==================== 题库管理 API ====================

// 获取所有题目
app.get('/api/questions', (req, res) => {
  const result = datastore.getAllQuestions();
  res.json(result);
});

// 根据ID获取题目
app.get('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const result = datastore.getQuestionById(parseInt(id));
  res.json(result);
});

// 添加新题目
app.post('/api/questions', (req, res) => {
  const questionData = req.body;
  const result = datastore.addQuestion(questionData);
  
  if (result.success) {
    // 广播题库更新事件
    broadcast({
      type: 'QUESTION_ADDED',
      question: result.question
    });
  }
  
  res.json(result);
});

// 更新题目
app.put('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const result = datastore.updateQuestion(parseInt(id), updates);
  
  if (result.success) {
    // 广播题库更新事件
    broadcast({
      type: 'QUESTION_UPDATED',
      question: result.question
    });
  }
  
  res.json(result);
});

// 删除题目
app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const result = datastore.deleteQuestion(parseInt(id));
  
  if (result.success) {
    // 广播题库更新事件
    broadcast({
      type: 'QUESTION_DELETED',
      questionId: parseInt(id)
    });
  }
  
  res.json(result);
});

// 批量导入题库
app.post('/api/questions/import', (req, res) => {
  const { questions } = req.body;
  const result = datastore.importQuestions(questions);
  
  if (result.success) {
    // 广播题库完全更新事件
    broadcast({
      type: 'QUESTION_BANK_UPDATED',
      count: questions.length
    });
  }
  
  res.json(result);
});

// ==================== 公告管理 API ====================

// 获取公告
app.get('/api/announcement', (req, res) => {
  const result = datastore.getAnnouncement();
  res.json(result);
});

// 更新公告（仅管理员）
app.put('/api/announcement', (req, res) => {
  const announcementData = req.body;
  const result = datastore.updateAnnouncement(announcementData);
  
  if (result.success) {
    // 广播公告更新事件
    broadcast({
      type: 'ANNOUNCEMENT_UPDATED',
      announcement: result.announcement
    });
  }
  
  res.json(result);
});

// ==================== 健康检查 ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    clients: clients.size,
    database: 'connected' 
  });
});

// 启动服务器  
const PORT = 3030;
server.listen(PORT, () => {
  console.log('');
  console.log('🚀 服务器启动成功！');
  console.log(`📡 HTTP API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 数据库: quiz.db`);
  console.log('');
  console.log('✅ 准备就绪，等待连接...');
  console.log('');
});
