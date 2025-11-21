import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, 'data.json');

// 初始化数据结构
let data = {
  users: [],
  feedbacks: [],
  errorReports: [],
  notifications: [],
  userProgress: [],  // 用户答题进度
  questionBank: [],  // 题库数据
  announcement: {    // 全局公告
    id: 1,
    title: '欢迎使用物联网刷题系统',
    content: '开始你的学习之旅吧！',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// 加载数据
export function loadData() {
  if (existsSync(dataPath)) {
    try {
      const jsonData = readFileSync(dataPath, 'utf-8');
      data = JSON.parse(jsonData);
      console.log('📊 数据加载成功');
    } catch (error) {
      console.error('❌ 数据加载失败，使用空数据');
    }
  } else {
    // 创建默认管理员账号
    data.users.push({
      id: 1,
      phone: '19312985136',
      password: 'Wjj19312985136...',
      username: '管理员',
      avatar: '👑',
      isAdmin: true,
      registerTime: new Date().toISOString()
    });
    saveData();
    console.log('✅ 已创建管理员账号');
  }
}

// 保存数据
export function saveData() {
  try {
    // 确保使用UTF-8编码，并且正确处理Unicode字符
    const jsonString = JSON.stringify(data, null, 2);
    writeFileSync(dataPath, jsonString, { encoding: 'utf-8', flag: 'w' });
  } catch (error) {
    console.error('❌ 数据保存失败:', error);
  }
}

// 获取下一个ID
function getNextId(collection) {
  if (data[collection].length === 0) return 1;
  return Math.max(...data[collection].map(item => item.id)) + 1;
}

// ==================== 用户操作 ====================

export function createUser(phone, password, username, avatar = '👤') {
  if (data.users.some(u => u.phone === phone)) {
    return { success: false, message: '手机号已被注册' };
  }
  
  const user = {
    id: getNextId('users'),
    phone,
    password,
    username,
    avatar,
    isAdmin: false,
    registerTime: new Date().toISOString()
  };
  
  data.users.push(user);
  saveData();
  
  return { success: true, user };
}

export function loginUser(phone, password) {
  const user = data.users.find(u => u.phone === phone && u.password === password);
  if (user) {
    return { success: true, user };
  }
  return { success: false, message: '手机号或密码错误' };
}

export function getAllUsers() {
  return { success: true, users: data.users };
}

export function updateUser(id, updates) {
  const index = data.users.findIndex(u => u.id === id);
  if (index !== -1) {
    data.users[index] = { ...data.users[index], ...updates };
    saveData();
    return { success: true, user: data.users[index] };
  }
  return { success: false, message: '用户不存在' };
}

// ==================== 反馈操作 ====================

export function createFeedback(feedback) {
  const newFeedback = {
    id: getNextId('feedbacks'),
    ...feedback,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  data.feedbacks.push(newFeedback);
  saveData();
  
  return { success: true, feedback: newFeedback };
}

export function getAllFeedbacks() {
  return { success: true, feedbacks: data.feedbacks };
}

export function markFeedbackAsRead(id) {
  const feedback = data.feedbacks.find(f => f.id === id);
  if (feedback) {
    feedback.read = true;
    saveData();
    return { success: true };
  }
  return { success: false };
}

export function deleteFeedback(id) {
  data.feedbacks = data.feedbacks.filter(f => f.id !== id);
  saveData();
  return { success: true };
}

// ==================== 纠错报告操作 ====================

export function createErrorReport(report) {
  const newReport = {
    id: getNextId('errorReports'),
    ...report,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  data.errorReports.push(newReport);
  saveData();
  
  return { success: true, report: newReport };
}

export function getAllErrorReports() {
  return { success: true, reports: data.errorReports };
}

export function markErrorReportAsRead(id) {
  const report = data.errorReports.find(r => r.id === id);
  if (report) {
    report.read = true;
    saveData();
    return { success: true };
  }
  return { success: false };
}

export function deleteErrorReport(id) {
  data.errorReports = data.errorReports.filter(r => r.id !== id);
  saveData();
  return { success: true };
}

// ==================== 通知操作 ====================

export function createNotification(notification) {
  const newNotification = {
    id: getNextId('notifications'),
    ...notification,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  data.notifications.push(newNotification);
  saveData();
  
  return { success: true, notification: newNotification };
}

export function getAllNotifications() {
  return { success: true, notifications: data.notifications };
}

export function markNotificationAsRead(id) {
  const notification = data.notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    saveData();
    return { success: true };
  }
  return { success: false };
}

export function deleteNotification(id) {
  data.notifications = data.notifications.filter(n => n.id !== id);
  saveData();
  return { success: true };
}

// ==================== 答题进度操作 ====================

export function saveUserProgress(userId, progressData) {
  const { answeredIds, wrongIds } = progressData;
  
  // 查找是否已有该用户的进度
  const existingIndex = data.userProgress.findIndex(p => p.userId === userId);
  
  const progress = {
    userId,
    answeredIds: answeredIds || [],
    wrongIds: wrongIds || [],
    totalAnswered: (answeredIds || []).length,
    totalWrong: (wrongIds || []).length,
    accuracy: (answeredIds || []).length > 0 
      ? ((answeredIds.length - (wrongIds || []).length) / answeredIds.length * 100).toFixed(1)
      : 0,
    lastUpdated: new Date().toISOString()
  };
  
  if (existingIndex !== -1) {
    // 更新现有进度
    data.userProgress[existingIndex] = progress;
  } else {
    // 新增进度
    data.userProgress.push(progress);
  }
  
  saveData();
  return { success: true, progress };
}

export function getUserProgress(userId) {
  const progress = data.userProgress.find(p => p.userId === userId);
  if (progress) {
    return { success: true, progress };
  }
  // 返回空进度
  return { 
    success: true, 
    progress: {
      userId,
      answeredIds: [],
      wrongIds: [],
      totalAnswered: 0,
      totalWrong: 0,
      accuracy: 0
    }
  };
}

export function getAllUserProgress() {
  return { success: true, progressList: data.userProgress };
}

// ==================== 题库管理 ====================

// 获取所有题目
export function getAllQuestions() {
  return { success: true, questions: data.questionBank };
}

// 根据ID获取题目
export function getQuestionById(questionId) {
  const question = data.questionBank.find(q => q.id === questionId);
  if (question) {
    return { success: true, question };
  }
  return { success: false, message: '题目不存在' };
}

// 添加新题目
export function addQuestion(questionData) {
  try {
    const newQuestion = {
      category: questionData.category || '未分类',
      question: questionData.question,
      options: questionData.options || [],
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || '',
      type: questionData.type || 'single'
    };
    
    data.questionBank.push(newQuestion);
    
    // 添加后重新编号
    reorderQuestionIds();
    saveData();
    
    return { 
      success: true, 
      message: '题目添加成功，已重新编号',
      question: data.questionBank[data.questionBank.length - 1] 
    };
  } catch (error) {
    return { success: false, message: '添加失败: ' + error.message };
  }
}

// 更新题目
export function updateQuestion(questionId, updates) {
  try {
    const index = data.questionBank.findIndex(q => q.id === questionId);
    
    if (index === -1) {
      return { success: false, message: '题目不存在' };
    }
    
    // 更新题目数据
    data.questionBank[index] = {
      ...data.questionBank[index],
      ...updates,
      id: questionId  // 确保ID不被修改
    };
    
    saveData();
    
    return { 
      success: true, 
      message: '题目更新成功',
      question: data.questionBank[index]
    };
  } catch (error) {
    return { success: false, message: '更新失败: ' + error.message };
  }
}

// 重新编号题库（按顺序1,2,3...）
function reorderQuestionIds() {
  data.questionBank.forEach((q, index) => {
    q.id = index + 1;
  });
}

// 删除题目
export function deleteQuestion(questionId) {
  try {
    const index = data.questionBank.findIndex(q => q.id === questionId);
    
    if (index === -1) {
      return { success: false, message: '题目不存在' };
    }
    
    const deletedQuestion = data.questionBank[index];
    data.questionBank.splice(index, 1);
    
    // 删除后重新编号
    reorderQuestionIds();
    saveData();
    
    return { 
      success: true, 
      message: '题目删除成功，已重新编号',
      question: deletedQuestion
    };
  } catch (error) {
    return { success: false, message: '删除失败: ' + error.message };
  }
}

// 批量导入题库（从questionBank.js导入）
export function importQuestions(questions) {
  try {
    data.questionBank = questions;
    saveData();
    return { 
      success: true, 
      message: `成功导入 ${questions.length} 道题目` 
    };
  } catch (error) {
    return { success: false, message: '导入失败: ' + error.message };
  }
}

// ==================== 公告管理 ====================

// 获取公告
export function getAnnouncement() {
  return { 
    success: true, 
    announcement: data.announcement || {
      id: 1,
      title: '',
      content: '',
      enabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

// 更新公告
export function updateAnnouncement(announcementData) {
  try {
    data.announcement = {
      ...data.announcement,
      ...announcementData,
      updatedAt: new Date().toISOString()
    };
    
    saveData();
    
    return { 
      success: true, 
      message: '公告更新成功',
      announcement: data.announcement
    };
  } catch (error) {
    return { success: false, message: '更新失败: ' + error.message };
  }
}
