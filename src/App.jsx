import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft, RotateCcw, Cpu, Zap, Layers, BarChart3, AlertTriangle, CalendarClock, Github, Flag, Mail, X, Sparkles, Shuffle, User } from 'lucide-react';
import { QUESTION_BANK } from './questionBank.js';
import { LoginView, ProfileView } from './UserComponents.jsx';
import { ExportMenu, UserMenu } from './MenuComponents.jsx';
import { NotificationMenu } from './NotificationComponent.jsx';
import { AdminPanel } from './AdminPanel.jsx';
import { FeedbackButton } from './FeedbackComponent.jsx';
import { ErrorReportModal } from './ErrorReportModal.jsx';
import { AnnouncementBanner } from './AnnouncementBanner.jsx';
import * as api from './apiClient.js';

// 默认题库（作为备用）
const DEFAULT_QUESTION_BANK = QUESTION_BANK.length > 0 ? QUESTION_BANK : [
  {
    id: 1,
    type: 'single',
    category: '传感器技术',
    question: '在物联网环境监测系统中，用于检测空气湿度的传感器通常采用什么原理？',
    options: [
      { id: 'A', text: '热敏电阻效应' },
      { id: 'B', text: '湿敏电容或电阻变化' },
      { id: 'C', text: '霍尔效应' },
      { id: 'D', text: '光电效应' }
    ],
    correctAnswer: 'B',
    explanation: '湿度传感器主要利用湿敏元件（电容或电阻）随环境湿度变化而改变电学性质的原理进行测量。'
  },
  {
    id: 2,
    type: 'single',
    category: '通信协议',
    question: 'ZigBee 网络的协调器（Coordinator）的主要功能不包括以下哪项？',
    options: [
      { id: 'A', text: '建立网络' },
      { id: 'B', text: '存储网络安全密钥' },
      { id: 'C', text: '管理网络节点' },
      { id: 'D', text: '负责高带宽视频传输' }
    ],
    correctAnswer: 'D',
    explanation: 'ZigBee 是低功耗、低速率的短距离无线通信技术，不适合传输高带宽的视频数据。协调器主要负责组网和管理。'
  },
  {
    id: 3,
    type: 'single',
    category: '硬件接口',
    question: 'RS-485 通信接口在工业物联网中广泛应用，其主要特点是？',
    options: [
      { id: 'A', text: '全双工通信，抗干扰能力差' },
      { id: 'B', text: '差分信号传输，抗共模干扰能力强' },
      { id: 'C', text: '只能点对点通信' },
      { id: 'D', text: '传输距离短，通常不超过5米' }
    ],
    correctAnswer: 'B',
    explanation: 'RS-485 采用差分信号（两线制），能有效抑制共模干扰，传输距离可达 1200 米，支持多点组网。'
  },
  {
    id: 4,
    type: 'single',
    category: '网络层',
    question: 'NB-IoT（窄带物联网）的主要优势场景是？',
    options: [
      { id: 'A', text: '高速率、低延迟的自动驾驶' },
      { id: 'B', text: '大流量的视频监控' },
      { id: 'C', text: '广覆盖、低功耗、大连接的智能抄表' },
      { id: 'D', text: '频繁交互的语音通话' }
    ],
    correctAnswer: 'C',
    explanation: 'NB-IoT 专为低功耗广域网设计，特别适合数据量小、分布广、对延迟不敏感的场景，如智能水表、气表。'
  },
  {
    id: 5,
    type: 'single',
    category: '安调实务',
    question: '在安装红外对射探测器时，发射端和接收端必须保持？',
    options: [
      { id: 'A', text: '垂直角度' },
      { id: 'B', text: '光轴对准，无遮挡' },
      { id: 'C', text: '随意摆放' },
      { id: 'D', text: '背对背安装' }
    ],
    correctAnswer: 'B',
    explanation: '红外对射探测器依靠发射端发出的红外光束被接收端接收来工作，必须保证光轴对准且中间无障碍物。'
  },
  {
    id: 6,
    type: 'single',
    category: '网络配置',
    question: '网关（Gateway）在物联网架构中的核心作用是？',
    options: [
      { id: 'A', text: '仅提供电源' },
      { id: 'B', text: '协议转换与数据转发' },
      { id: 'C', text: '生成原始数据' },
      { id: 'D', text: '替代云端服务器' }
    ],
    correctAnswer: 'B',
    explanation: '网关主要负责不同感知层协议（如ZigBee, Bluetooth）与网络层协议（如TCP/IP, MQTT）之间的转换和数据上传。'
  },
  {
    id: 7,
    type: 'single',
    category: 'RFID技术',
    question: '高频（HF）RFID 标签的工作频率通常是？',
    options: [
      { id: 'A', text: '125 KHz' },
      { id: 'B', text: '13.56 MHz' },
      { id: 'C', text: '915 MHz' },
      { id: 'D', text: '2.4 GHz' }
    ],
    correctAnswer: 'B',
    explanation: '13.56 MHz 是高频 RFID 的全球标准频率，常用于门禁卡、身份证识别等。'
  }
];

// 独立的倒计时组件，避免触发整个App重渲染
const ExamCountdown = React.memo(() => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 10, 22, 8, 0, 0);
      const difference = targetDate - now;
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setCountdown(calculateTimeLeft());
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:flex items-center text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 shadow-sm">
      <CalendarClock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
      <span className="mr-2 font-bold text-slate-600">理论考试倒计时:</span>
      <span className="font-bold text-indigo-700">
        {countdown.days}天 {countdown.hours}时 {countdown.minutes}分 {countdown.seconds}秒
      </span>
    </div>
  );
});

export default function App() {
  // --- State 定义 ---
  // 从localStorage恢复页面状态
  const [appState, setAppState] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_app_state');
      return saved || 'welcome';
    } catch (e) { return 'welcome'; }
  }); // welcome, quiz, result, profile, login, admin
  const [quizMode, setQuizMode] = useState('practice'); // practice, exam, instant, mistakes
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const modalContentRef = useRef(null); // 用于闪电刷题弹窗自动滚动
  
  // 用户系统状态
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  
  // 闪电刷题弹窗相关状态
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantQuestion, setInstantQuestion] = useState(null); // 当前闪电题目
  const [isRolling, setIsRolling] = useState(false); // 是否正在播放抽取动画
  const [instantUserAnswer, setInstantUserAnswer] = useState(null); // 闪电模式下的答案

  // 纠错弹窗状态
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorQuestion, setErrorQuestion] = useState(null);
  
  // 复制QQ提示状态
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  // 全局警告弹窗状态
  const [globalWarning, setGlobalWarning] = useState(null);

  // 题库状态（从数据库加载）
  const [MOCK_QUESTION_BANK, setMOCK_QUESTION_BANK] = useState(DEFAULT_QUESTION_BANK);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // 加载题库
  const loadQuestionBank = async () => {
    setIsLoadingQuestions(true);
    const result = await api.getAllQuestions();
    
    if (result.success && result.questions && result.questions.length > 0) {
      setMOCK_QUESTION_BANK(result.questions);
      console.log(`📚 从数据库加载了 ${result.questions.length} 道题目`);
    } else {
      // 如果数据库为空，导入默认题库
      console.log('📚 数据库题库为空，准备导入默认题库...');
      const importResult = await api.importQuestions(DEFAULT_QUESTION_BANK);
      if (importResult.success) {
        setMOCK_QUESTION_BANK(DEFAULT_QUESTION_BANK);
        console.log(`✅ ${importResult.message}`);
      }
    }
    
    setIsLoadingQuestions(false);
  };

  // 保存页面状态到localStorage（排除quiz状态）
  useEffect(() => {
    if (appState !== 'quiz' && appState !== 'result') {
      localStorage.setItem('iot_app_state', appState);
    }
  }, [appState]);

  // 订阅全局消息推送
  useEffect(() => {
    const unsubscribe = api.subscribeWebSocket('GLOBAL_MESSAGE', (message) => {
      if (message.type === 'alert' || message.type === 'warning') {
        // 警告消息显示为弹窗
        setGlobalWarning(message);
      }
      // 其他类型的消息通过通知系统显示
    });
    return unsubscribe;
  }, []);

  // 初始化WebSocket连接和加载题库
  useEffect(() => {
    // 连接WebSocket，并在连接成功后发送用户在线状态
    api.connectWebSocket(() => {
      console.log('🔌 WebSocket连接已建立');
      
      // 如果用户已登录，通知在线状态
      if (currentUser && currentUser.phone) {
        api.sendWebSocketMessage('USER_CONNECT', { userId: currentUser.phone });
        console.log('📡 已发送用户在线状态:', currentUser.phone);
      }
    });
    
    // 加载题库
    loadQuestionBank();
    
    // 如果用户已登录，加载答题进度
    if (currentUser && currentUser.phone) {
      loadUserProgress(currentUser.phone);
    }
  }, []);

  // 订阅题库更新事件
  useEffect(() => {
    const unsubscribes = [
      api.subscribeWebSocket('QUESTION_ADDED', (data) => {
        setMOCK_QUESTION_BANK(prev => [...prev, data.question]);
        console.log('➕ 题目已添加:', data.question.id);
      }),
      api.subscribeWebSocket('QUESTION_UPDATED', (data) => {
        setMOCK_QUESTION_BANK(prev => prev.map(q => 
          q.id === data.question.id ? data.question : q
        ));
        console.log('✏️ 题目已更新:', data.question.id);
      }),
      api.subscribeWebSocket('QUESTION_DELETED', (data) => {
        setMOCK_QUESTION_BANK(prev => prev.filter(q => q.id !== data.questionId));
        console.log('🗑️ 题目已删除:', data.questionId);
      }),
      api.subscribeWebSocket('QUESTION_BANK_UPDATED', () => {
        loadQuestionBank();
        console.log('🔄 题库已全量更新');
      })
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // 监听闪电刷题答案，自动滚动到底部
  useEffect(() => {
    if (instantUserAnswer && modalContentRef.current) {
      setTimeout(() => {
        modalContentRef.current.scrollTo({ 
          top: modalContentRef.current.scrollHeight, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  }, [instantUserAnswer]);

  // 1. 累计刷题记录
  const [answeredIds, setAnsweredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_answered_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) { return new Set(); }
  });

  // 2. 错题本记录
  const [wrongQuestionIds, setWrongQuestionIds] = useState(() => {
    try {
      const saved = localStorage.getItem('iot_wrong_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) { return new Set(); }
  });

  // --- 核心修复：持久化同步 Effect ---
  // 监听 wrongQuestionIds 变化，自动同步到 localStorage
  // 这比在 updateMistakeNotebook 中直接 setItem 更安全，确保数据始终一致
  useEffect(() => {
    localStorage.setItem('iot_wrong_ids', JSON.stringify([...wrongQuestionIds]));
  }, [wrongQuestionIds]);

  // --- 辅助函数 ---
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  const markQuestionAsPracticed = (qId) => {
    if (!answeredIds.has(qId)) {
      const newSet = new Set(answeredIds);
      newSet.add(qId);
      setAnsweredIds(newSet);
      // 保存到localStorage（本地缓存）
      localStorage.setItem('iot_answered_ids', JSON.stringify([...newSet]));
      // 保存到服务器
      saveProgressToServer(newSet, wrongQuestionIds);
    }
  };

  // --- 核心修复：更新错题本逻辑 ---
  // 使用函数式更新 prev => ... 确保基于最新状态进行增删
  const updateMistakeNotebook = (qId, isCorrect) => {
    setWrongQuestionIds(prev => {
      const newSet = new Set(prev); // 基于最新的 prev 状态创建 Set
      if (isCorrect) {
        // 如果答对了，尝试移除
        if (newSet.has(qId)) {
          newSet.delete(qId);
        }
      } else {
        // 如果答错了，添加进去
        newSet.add(qId);
      }
      // 保存到服务器
      saveProgressToServer(answeredIds, newSet);
      return newSet; // 返回新 Set，触发 Effect 同步存储
    });
  };

  // 处理题目反馈 - 打开纠错弹窗
  const handleFeedback = (q) => {
    setErrorQuestion(q);
    setShowErrorModal(true);
  };

  // --- 用户系统功能 ---
  const ADMIN_ACCOUNT = { phone: '19312985136', password: 'Wjj19312985136...' };
  
  // 登录函数
  const handleLogin = async (phone, password) => {
    const result = await api.loginUser(phone, password);
    
    if (result.success) {
      const loginUser = { ...result.user, loginTime: new Date().toISOString() };
      delete loginUser.password; // 不在currentUser中存储密码
      setCurrentUser(loginUser);
      localStorage.setItem('iot_current_user', JSON.stringify(loginUser));
      
      // 通知服务器用户上线（确保WebSocket已连接）
      setTimeout(() => {
        api.sendWebSocketMessage('USER_CONNECT', { userId: loginUser.phone });
        console.log('📡 用户登录后发送在线状态:', loginUser.phone);
      }, 200);
      
      // 加载用户答题进度
      await loadUserProgress(loginUser.phone);
      
      setAppState('welcome');
    }
    
    return result;
  };

  // 加载用户答题进度
  const loadUserProgress = async (userId) => {
    const result = await api.getUserProgress(userId);
    if (result.success && result.progress) {
      setAnsweredIds(new Set(result.progress.answeredIds || []));
      setWrongQuestionIds(new Set(result.progress.wrongIds || []));
    }
  };

  // 复制QQ号到剪贴板
  const copyQQNumber = () => {
    const qqNumber = '1849619997';
    navigator.clipboard.writeText(qqNumber).then(() => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }).catch(() => {
      // 备用方法
      const textarea = document.createElement('textarea');
      textarea.value = qqNumber;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    });
  };

  // 保存用户答题进度到数据库
  const saveProgressToServer = async (newAnsweredIds, newWrongIds) => {
    if (currentUser) {
      // 管理员和普通用户都保存进度
      await api.saveUserProgress(
        currentUser.phone,
        [...newAnsweredIds],
        [...newWrongIds]
      );
    }
  };
  
  // 注册函数
  const handleRegister = async (phone, password, username) => {
    // 检查是否为管理员账号
    if (phone === ADMIN_ACCOUNT.phone) {
      return { success: false, message: '该手机号为系统保留号码' };
    }
    
    const displayName = username || `用户${phone.slice(-4)}`;
    const avatar = '👤';
    
    const result = await api.registerUser(phone, password, displayName, avatar);
    
    if (result.success) {
      // 自动登录
      const loginUser = { ...result.user };
      delete loginUser.password;
      setCurrentUser(loginUser);
      localStorage.setItem('iot_current_user', JSON.stringify(loginUser));
      setAppState('welcome');
    }
    
    return result;
  };
  
  // 退出登录
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('iot_current_user');
    setAppState('welcome');
    setShowUserMenu(false);
  };
  
  // 更新用户信息
  const handleUpdateProfile = (username, avatar) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, username, avatar };
    setCurrentUser(updatedUser);
    localStorage.setItem('iot_current_user', JSON.stringify(updatedUser));
    
    // 如果不是管理员，更新users表中的数据
    if (!currentUser.isAdmin) {
      const users = JSON.parse(localStorage.getItem('iot_users') || '[]');
      const userIndex = users.findIndex(u => u.phone === currentUser.phone);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], username, avatar };
        localStorage.setItem('iot_users', JSON.stringify(users));
      }
    }
  };




  // --- 闪电刷题 逻辑 (动画版) ---
  const openInstantMode = () => {
    setShowInstantModal(true);
    startRolling();
  };

  const startRolling = () => {
    setIsRolling(true);
    setInstantUserAnswer(null);
    
    let rolls = 0;
    const maxRolls = 15; 
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * MOCK_QUESTION_BANK.length);
      setInstantQuestion(MOCK_QUESTION_BANK[randomIdx]);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleInstantSelect = (optionId) => {
    if (isRolling || instantUserAnswer) return;
    
    setInstantUserAnswer(optionId);
    
    if (instantQuestion) {
      markQuestionAsPracticed(instantQuestion.id);
      const isCorrect = instantQuestion.correctAnswer === optionId;
      updateMistakeNotebook(instantQuestion.id, isCorrect);
    }
  };

  const closeInstantModal = () => {
    setShowInstantModal(false);
    setInstantQuestion(null);
    setInstantUserAnswer(null);
  };

  const showInstantResult = !!instantUserAnswer;

  // --- 普通模式逻辑 ---

  const startQuiz = (mode) => {
    // 如果点击的是闪电模式，直接走弹窗逻辑，不改变 appState
    if (mode === 'instant') {
      openInstantMode();
      return;
    }

    setQuizMode(mode);

    // 通知服务器用户开始答题
    if (currentUser) {
      api.sendWebSocketMessage('STATUS_UPDATE', { 
        userId: currentUser.phone, 
        status: 'answering' 
      });
    }

    if (mode === 'exam') {
      // 模拟考：每次从头开始，清除之前的进度
      localStorage.removeItem('iot_exam_progress');
      setUserAnswers({});
      setCurrentIndex(0);
      const shuffled = shuffleArray(MOCK_QUESTION_BANK).slice(0, 100);
      setCurrentQuestions(shuffled);
      setTimeLeft(9000); // 150分钟 = 9000秒
      setAppState('quiz');
    } else if (mode === 'mistakes') {
      const wrongQuestions = MOCK_QUESTION_BANK.filter(q => wrongQuestionIds.has(q.id));
      if (wrongQuestions.length === 0) {
        alert("太棒了！你当前没有错题记录。");
        return;
      }
      setUserAnswers({});
      setCurrentIndex(0);
      setCurrentQuestions(wrongQuestions);
      setTimeLeft(0);
      setAppState('quiz');
    } else {
      // 顺序练习：从上次进度继续
      const savedProgress = localStorage.getItem('iot_practice_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setCurrentIndex(progress.currentIndex || 0);
        setUserAnswers(progress.userAnswers || {});
      } else {
        setCurrentIndex(0);
        setUserAnswers({});
      }
      setCurrentQuestions(MOCK_QUESTION_BANK);
      setTimeLeft(0);
      setAppState('quiz');
    }
  };

  // 保存顺序练习进度
  const savePracticeProgress = useCallback(() => {
    if (quizMode === 'practice') {
      const progress = {
        currentIndex,
        userAnswers,
        timestamp: Date.now()
      };
      localStorage.setItem('iot_practice_progress', JSON.stringify(progress));
    }
  }, [quizMode, currentIndex, userAnswers]);

  // 退出答题
  const exitQuiz = () => {
    if (quizMode === 'practice') {
      // 顺序练习：保存进度
      savePracticeProgress();
    } else if (quizMode === 'exam') {
      // 模拟考：清除进度
      localStorage.removeItem('iot_exam_progress');
    }
    
    // 通知服务器用户结束答题，恢复在线状态
    if (currentUser) {
      api.sendWebSocketMessage('STATUS_UPDATE', { 
        userId: currentUser.phone, 
        status: 'online' 
      });
    }
    
    setAppState('welcome');
  };

  const handleOptionSelect = (qId, optionId) => {
    if (appState === 'result') return;

    const currentQ = MOCK_QUESTION_BANK.find(q => q.id === qId);
    
    if (currentQ.type === 'multiple') {
      // 多选题：切换选项
      setUserAnswers(prev => {
        const current = prev[qId] || [];
        const isArray = Array.isArray(current);
        const currentArray = isArray ? current : [];
        
        const newAnswers = currentArray.includes(optionId)
          ? currentArray.filter(id => id !== optionId)  // 取消选择
          : [...currentArray, optionId];  // 添加选择
        
        return { ...prev, [qId]: newAnswers };
      });
    } else {
      // 单选题：选了就不能改（练习模式立即显示答案）
      if (userAnswers[qId]) return;
      setUserAnswers(prev => ({ ...prev, [qId]: optionId }));
      
      // 单选题立即判断对错
      const isCorrect = currentQ.correctAnswer === optionId;
      updateMistakeNotebook(qId, isCorrect);
    }
    
    markQuestionAsPracticed(qId);
    
    // 顺序练习自动保存进度
    if (quizMode === 'practice') {
      setTimeout(savePracticeProgress, 500);
    }
  };

  // 多选题确认答案
  const confirmMultipleChoice = (qId) => {
    const currentQ = MOCK_QUESTION_BANK.find(q => q.id === qId);
    const userAnswer = userAnswers[qId] || [];
    
    // 判断答案是否正确
    const correctAnswers = currentQ.correctAnswer.split(',').map(a => a.trim()).sort();
    const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
    const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
    
    updateMistakeNotebook(qId, isCorrect);
    
    // 标记为已确认（防止再次修改）
    setUserAnswers(prev => ({
      ...prev,
      [qId + '_confirmed']: true
    }));
  };

  const submitQuiz = () => {
    setAppState('result');
    
    // 提交时判断所有多选题
    currentQuestions.forEach(q => {
      if (q.type === 'multiple' && !userAnswers[q.id + '_confirmed']) {
        const userAnswer = userAnswers[q.id] || [];
        const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
        updateMistakeNotebook(q.id, isCorrect);
      }
    });
  };

  useEffect(() => {
    let timer;
    if (appState === 'quiz' && quizMode === 'exam' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [appState, quizMode]);

  const resultStats = useMemo(() => {
    if (appState !== 'result') return { score: 0 };
    let correctCount = 0;
    
    currentQuestions.forEach(q => {
      const userAnswer = userAnswers[q.id];
      let isCorrect = false;
      
      if (q.type === 'multiple') {
        // 多选题：比较数组
        const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
      } else {
        // 单选题：直接比较
        isCorrect = userAnswer === q.correctAnswer;
      }
      
      if (isCorrect) correctCount++;
    });
    
    return {
      score: Math.round((correctCount / currentQuestions.length) * 100),
      correctCount,
      total: currentQuestions.length,
      wrongCount: currentQuestions.length - correctCount
    };
  }, [appState, currentQuestions, userAnswers]);

  // 计算用户统计数据
  const userStats = useMemo(() => {
    if (!currentUser) return null;
    
    const categoryStats = {};
    MOCK_QUESTION_BANK.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, answered: 0, correct: 0 };
      }
      categoryStats[q.category].total++;
      if (answeredIds.has(q.id)) {
        categoryStats[q.category].answered++;
        if (!wrongQuestionIds.has(q.id)) {
          categoryStats[q.category].correct++;
        }
      }
    });
    
    const totalAnswered = answeredIds.size;
    const totalCorrect = Array.from(answeredIds).filter(id => !wrongQuestionIds.has(id)).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    return {
      totalQuestions: MOCK_QUESTION_BANK.length,
      totalAnswered,
      totalCorrect,
      totalWrong: wrongQuestionIds.size,
      accuracy,
      categoryStats
    };
  }, [currentUser, answeredIds, wrongQuestionIds]);

  // --- 组件视图 ---

  const WelcomeView = () => (
    <div className="flex flex-col items-center mt-6 sm:mt-12 text-center space-y-6 sm:space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 px-4">物联网安调在线刷题系统</h1>
        <p className="text-sm sm:text-base text-slate-500">IoT Installation & Debugging Question Bank</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full max-w-4xl px-3 sm:px-4">
        <button 
          onClick={() => startQuiz('practice')}
          className="group p-4 sm:p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left flex flex-col h-full active:scale-95"
        >
          <div className="flex items-center justify-between mb-3">
            <Layers className="w-8 h-8 text-indigo-500" />
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded">基础</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-800">全库顺序练习</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 opacity-80">按顺序练习所有题目，无时间限制。</p>
        </button>

        <button 
          onClick={() => startQuiz('exam')}
          className="group p-4 sm:p-6 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left flex flex-col h-full active:scale-95"
        >
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2 py-1 rounded">模考</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-800">限时随机模考</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 opacity-80">随机抽取 100 题，限时 150 分钟。</p>
        </button>

        <button 
          onClick={() => startQuiz('instant')}
          className="group p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-xl hover:border-orange-500 hover:shadow-lg hover:bg-orange-100 transition-all text-left flex flex-col h-full relative overflow-hidden active:scale-95"
        >
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-orange-200 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <Zap className="w-8 h-8 text-orange-500" />
            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">推荐</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-orange-900 relative z-10">闪电刷题</h3>
          <p className="text-xs sm:text-sm text-orange-800 mt-2 opacity-80 relative z-10">随机抽取，动画开箱，即刻开练。</p>
        </button>

        <button 
          onClick={() => startQuiz('mistakes')}
          disabled={wrongQuestionIds.size === 0}
          className={`group p-6 border rounded-xl transition-all text-left flex flex-col h-full relative overflow-hidden
            ${wrongQuestionIds.size > 0 
              ? 'bg-red-50 border-red-200 hover:border-red-500 hover:shadow-lg hover:bg-red-100 cursor-pointer' 
              : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className={`w-8 h-8 ${wrongQuestionIds.size > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            {wrongQuestionIds.size > 0 ? (
                <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded flex items-center">
                    {wrongQuestionIds.size} 题待消灭
                </span>
            ) : (
                <span className="bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded">暂无错题</span>
            )}
          </div>
          <h3 className={`font-bold text-lg ${wrongQuestionIds.size > 0 ? 'text-red-900' : 'text-slate-500'}`}>智能错题本</h3>
          <p className={`text-sm mt-2 opacity-80 ${wrongQuestionIds.size > 0 ? 'text-red-800' : 'text-slate-500'}`}>
            专攻薄弱点。答对后自动移出题本。
          </p>
        </button>
      </div>
    </div>
  );

  // 答题卡组件
  const AnswerSheet = ({ questions, userAnswers, currentIndex, onJumpTo }) => {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 sticky top-20">
        <h3 className="font-bold text-slate-800 mb-3 flex items-center">
          <span className="text-base">答题卡</span>
          <span className="ml-2 text-xs text-slate-500">({Object.keys(userAnswers).filter(k => !k.includes('_confirmed')).length}/{questions.length})</span>
        </h3>
        <div className="grid grid-cols-5 gap-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {questions.map((q, index) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCurrent = index === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => onJumpTo(index)}
                className={`w-full aspect-square rounded-lg font-medium text-sm transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : isAnswered
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const QuizView = () => {
    const currentQ = currentQuestions[currentIndex];
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    const isLastQuestion = currentIndex === currentQuestions.length - 1;
    const userAnswer = userAnswers[currentQ.id];
    const quizContentRef = useRef(null);

    // 切换题目时重置滚动位置
    useEffect(() => {
      if (quizContentRef.current) {
        quizContentRef.current.scrollTop = 0;
      }
    }, [currentIndex]);

    // 选择答案后，在练习模式下自动滚动到解析区域
    useEffect(() => {
      if (userAnswer && (quizMode === 'practice' || quizMode === 'mistakes') && quizContentRef.current) {
        setTimeout(() => {
          quizContentRef.current.scrollTo({
            top: quizContentRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }, [userAnswer, quizMode]);

    // 跳转到指定题目
    const jumpToQuestion = (index) => {
      setCurrentIndex(index);
    };
    
    return (
      <div className="w-full">
        {/* 返回按钮 - 左上角 */}
        <div className="mb-4">
          <button 
            onClick={exitQuiz}
            className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">返回</span>
          </button>
        </div>

        {/* 主体区域：题目+答题卡 */}
        <div className="flex gap-6">
          {/* 左侧题目区域 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white shadow-sm rounded-xl p-4 mb-6 flex justify-between items-center sticky top-4 z-10 border border-slate-100">
          {quizMode === 'mistakes' ? (
             <div className="flex items-center text-red-600 font-bold">
               <AlertTriangle className="w-5 h-5 mr-2" /> 错题攻坚 ({currentIndex + 1}/{currentQuestions.length})
             </div>
          ) : (
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-slate-500 text-sm font-medium">题目 {currentIndex + 1} / {currentQuestions.length}</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}/>
              </div>
            </div>
          )}
          
          {quizMode === 'exam' && (
            <div className={`flex items-center space-x-2 font-mono text-lg font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col relative max-h-[calc(100vh-250px)]">
              {/* 可滚动内容区域 */}
              <div ref={quizContentRef} className="overflow-y-auto p-6 md:p-8 flex-1">
            <div className="flex items-center justify-between mb-5">
               <div className="flex items-center gap-2">
                 <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                   {currentQ.category}
                 </span>
                 {wrongQuestionIds.has(currentQ.id) && (
                     <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded flex items-center">
                         <AlertTriangle className="w-3 h-3 mr-1"/> 曾做错
                     </span>
                 )}
               </div>
               <button 
                 onClick={() => handleFeedback(currentQ)}
                 className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1 text-xs font-medium"
                 title="题目有误？点击反馈"
               >
                 <Flag className="w-4 h-4" /> 纠错
               </button>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-8">
              {currentQ.type === 'multiple' && (
                <span className="inline-block bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-lg mr-3">
                  多选题
                </span>
              )}
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                let containerClass = "border-slate-200 hover:bg-slate-50 text-slate-600";
                let iconClass = "bg-slate-100 text-slate-500";
                
                // 多选题和单选题的判断逻辑
                const isMultiple = currentQ.type === 'multiple';
                const isConfirmed = userAnswers[currentQ.id + '_confirmed'];
                const correctAnswers = isMultiple ? currentQ.correctAnswer.split(',').map(a => a.trim()) : [currentQ.correctAnswer];
                
                // 判断当前选项是否被选中
                const isSelected = isMultiple 
                  ? (Array.isArray(userAnswer) && userAnswer.includes(opt.id))
                  : userAnswer === opt.id;
                
                // 判断是否显示反馈（单选题选择后，或多选题确认后）
                const showFeedback = isMultiple 
                  ? (isConfirmed && (quizMode === 'practice' || quizMode === 'mistakes'))
                  : (userAnswer && (quizMode === 'practice' || quizMode === 'mistakes'));

                // 如果在练习模式下已选择答案，显示正确/错误样式
                if (showFeedback) {
                  if (correctAnswers.includes(opt.id)) {
                    containerClass = "border-green-500 bg-green-50 text-green-800";
                    iconClass = "bg-green-500 text-white";
                  } else if (isSelected) {
                    containerClass = "border-red-500 bg-red-50 text-red-800";
                    iconClass = "bg-red-500 text-white";
                  } else {
                    containerClass = "opacity-50 border-slate-100";
                  }
                } else if (isSelected) {
                  containerClass = "border-indigo-500 bg-indigo-50 text-indigo-700";
                  iconClass = "bg-indigo-500 text-white";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${containerClass} ${showFeedback ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors ${iconClass}`}>
                        {opt.id}
                      </span>
                      <span className="font-medium">{opt.text}</span>
                    </div>
                    {showFeedback && opt.id === currentQ.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {showFeedback && userAnswer === opt.id && userAnswer !== currentQ.correctAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                    {!showFeedback && userAnswer === opt.id && <CheckCircle className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>

            {/* 多选题确认按钮 */}
            {currentQ.type === 'multiple' && !userAnswers[currentQ.id + '_confirmed'] && (quizMode === 'practice' || quizMode === 'mistakes') && (
              <div className="mt-4">
                <button
                  onClick={() => confirmMultipleChoice(currentQ.id)}
                  disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    userAnswer && Array.isArray(userAnswer) && userAnswer.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  确认答案（已选择 {Array.isArray(userAnswer) ? userAnswer.length : 0} 项）
                </button>
              </div>
            )}

            {/* 练习模式下显示即时解析 */}
            {userAnswer && (quizMode === 'practice' || quizMode === 'mistakes') && (
              currentQ.type === 'single' || userAnswers[currentQ.id + '_confirmed']
            ) && (() => {
              // 判断答案是否正确
              let isAnswerCorrect = false;
              if (currentQ.type === 'multiple') {
                const correctAnswers = currentQ.correctAnswer.split(',').map(a => a.trim()).sort();
                const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
                isAnswerCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
              } else {
                isAnswerCorrect = userAnswer === currentQ.correctAnswer;
              }
              
              return (
                <div className={`mt-6 p-4 rounded-xl border-2 animate-in slide-in-from-bottom-2 fade-in ${
                  isAnswerCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`font-bold text-sm mb-2 flex items-center ${
                    isAnswerCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isAnswerCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        回答正确！
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        回答错误！正确答案是：{currentQ.correctAnswer}
                      </>
                    )}
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-bold">解析：</span>
                    {currentQ.explanation}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 固定底部按钮栏 */}

          <div className="bg-slate-50 p-4 md:p-6 flex justify-between items-center border-t border-slate-100">
              <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center px-4 py-2 text-slate-600 disabled:opacity-30 hover:text-indigo-600 font-medium transition-colors"
              >
              <ChevronLeft className="w-5 h-5 mr-1" /> 上一题
              </button>

              {isLastQuestion ? (
              <button
                  onClick={submitQuiz}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 font-bold flex items-center"
              >
                  提交试卷 <CheckCircle className="w-5 h-5 ml-2" />
              </button>
              ) : (
              <button
                  onClick={() => setCurrentIndex(prev => Math.min(currentQuestions.length - 1, prev + 1))}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 font-bold flex items-center"
              >
                  下一题 <ChevronRight className="w-5 h-5 ml-1" />
              </button>
              )}
            </div>
          </div>
        </div>
        
          {/* 右侧答题卡 - 仅顺序练习和模拟考显示 */}
          {(quizMode === 'practice' || quizMode === 'exam') && (
            <div className="w-64 hidden lg:block shrink-0">
              <AnswerSheet 
                questions={currentQuestions}
                userAnswers={userAnswers}
                currentIndex={currentIndex}
                onJumpTo={jumpToQuestion}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const ResultView = () => {
      const { score, correctCount, total, wrongCount } = resultStats;
      return (
        <div className="max-w-4xl mx-auto w-full pb-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-slate-800 p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">{quizMode === 'mistakes' ? '错题复习完成' : '考试结束'}</h2>
              <div className="flex justify-center items-center my-6">
                  <div className="text-5xl font-bold text-indigo-400">{score}<span className="text-xl text-slate-400">分</span></div>
              </div>
              {quizMode === 'mistakes' && (<p className="text-indigo-200">答对的题目已自动移出错题本</p>)}
            </div>
            <div className="grid grid-cols-3 border-b border-slate-100 divide-x divide-slate-100">
              <div className="p-4 text-center"><span className="block text-slate-400 text-xs">总题数</span><span className="text-xl font-bold text-slate-800">{total}</span></div>
              <div className="p-4 text-center bg-green-50"><span className="block text-green-600 text-xs">正确</span><span className="text-xl font-bold text-green-700">{correctCount}</span></div>
              <div className="p-4 text-center bg-red-50"><span className="block text-red-600 text-xs">错误</span><span className="text-xl font-bold text-red-700">{wrongCount}</span></div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-center">
               <button onClick={() => setAppState('welcome')} className="flex items-center bg-slate-800 text-white px-8 py-3 rounded-full hover:bg-slate-700 transition font-medium">
                <RotateCcw className="w-5 h-5 mr-2" /> 返回首页
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
             {currentQuestions.map((q, index) => {
                 const userAns = userAnswers[q.id];
                 
                 // 判断答案是否正确
                 let isCorrect = false;
                 if (q.type === 'multiple') {
                   const correctAnswers = q.correctAnswer.split(',').map(a => a.trim()).sort();
                   const userAnswersArray = Array.isArray(userAns) ? userAns.sort() : [];
                   isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(userAnswersArray);
                 } else {
                   isCorrect = userAns === q.correctAnswer;
                 }
                 
                 // 格式化用户答案显示
                 const userAnsDisplay = Array.isArray(userAns) ? userAns.join(', ') : (userAns || '未选');
                 
                 return (
                     <div key={q.id} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-800">
                              #{index+1} 
                              {q.type === 'multiple' && <span className="text-blue-600 text-xs ml-2">[多选]</span>}
                              {' '}{q.question}
                            </span>
                            {isCorrect ? <span className="text-green-600 text-sm font-bold">✓ 正确</span> : <span className="text-red-600 text-sm font-bold">✗ 错误</span>}
                        </div>
                        <div className="text-sm text-slate-500 mb-2">
                          你的答案: <span className="font-medium">{userAnsDisplay}</span> | 
                          正确答案: <span className="font-medium">{q.correctAnswer}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 flex justify-between items-start">
                          <div>{q.explanation}</div>
                          <button onClick={() => handleFeedback(q)} className="ml-4 text-slate-400 hover:text-orange-500 transition-colors"><Flag className="w-4 h-4" /></button>
                        </div>
                     </div>
                 )
             })}
          </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-full mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          {/* 左侧区域 */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setAppState('welcome')}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-base sm:text-xl tracking-tight text-slate-800 whitespace-nowrap">IoT Master</span>
            </div>
            
            {/* 倒计时 */}
            <ExamCountdown />
          </div>
          
          {/* 右侧区域 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                <span className="whitespace-nowrap">累计刷题: <span className="text-indigo-600 font-bold">{answeredIds.size}</span> / {MOCK_QUESTION_BANK.length}</span>
            </div>

            {/* 导出按钮 */}
            <ExportMenu MOCK_QUESTION_BANK={MOCK_QUESTION_BANK} />

            {/* 意见反馈 */}
            <FeedbackButton currentUser={currentUser} />

            {/* 消息通知 */}
            <NotificationMenu currentUser={currentUser} />

            {/* 用户菜单 */}
            {currentUser ? (
              <UserMenu 
                currentUser={currentUser} 
                onProfile={() => setAppState('profile')}
                onAdmin={() => setAppState('admin')}
                onLogout={handleLogout}
              />
            ) : (
              <button
                onClick={() => setAppState('login')}
                className="flex items-center space-x-1 sm:space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">登录 / 注册</span>
                <span className="sm:hidden">登录</span>
              </button>
            )}

            {appState === 'quiz' && (
                <button onClick={exitQuiz} className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors whitespace-nowrap">
                退出
                </button>
            )}
          </div>
        </div>
      </header>

      {/* 全局公告 */}
      <AnnouncementBanner />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {appState === 'welcome' && <WelcomeView />}
        {appState === 'quiz' && <QuizView />}
        {appState === 'result' && <ResultView />}
        {appState === 'login' && <LoginView handleLogin={handleLogin} handleRegister={handleRegister} setAppState={setAppState} />}
        {appState === 'profile' && <ProfileView currentUser={currentUser} userStats={userStats} handleUpdateProfile={handleUpdateProfile} setAppState={setAppState} />}
        {appState === 'admin' && <AdminPanel setAppState={setAppState} MOCK_QUESTION_BANK={MOCK_QUESTION_BANK} answeredIds={answeredIds} wrongQuestionIds={wrongQuestionIds} />}
      </main>
      
      <a 
        href="https://github.com/Awfp1314"
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-16 sm:bottom-4 left-2 sm:left-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 px-2 sm:px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
      >
        <Github className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors hidden sm:inline">GitHub Project</span>
      </a>

      <button 
        onClick={copyQQNumber}
        className="fixed bottom-16 sm:bottom-4 right-2 sm:right-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 px-2 sm:px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer"
      >
        <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors hidden sm:inline">联系作者</span>
      </button>

      {/* 复制成功提示 */}
      {showCopyToast && (
        <div className="fixed bottom-32 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 fade-in">
          ✅ 已复制QQ：1849619997
        </div>
      )}

      {showInstantModal && instantQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center space-x-2">
                <Zap className={`w-6 h-6 ${isRolling ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-lg">闪电刷题</span>
                </div>
                <button onClick={closeInstantModal} className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1">
                <X className="w-5 h-5" />
                </button>
            </div>

            <div ref={modalContentRef} className="p-6 overflow-y-auto">
                {isRolling ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                    <div className="relative">
                    <Sparkles className="w-16 h-16 text-orange-500 animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shuffle className="w-8 h-8 text-orange-600 animate-bounce" />
                    </div>
                    </div>
                    <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-700">正在抽取题目...</h3>
                    <p className="text-slate-400 text-sm font-mono">{instantQuestion.category}</p>
                    <p className="text-slate-300 text-xs">随机题库编号 #{instantQuestion.id}</p>
                    </div>
                </div>
                ) : (
                <>
                    <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{instantQuestion.category}</span>
                        {wrongQuestionIds.has(instantQuestion.id) && (
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> 曾做错</span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-relaxed">{instantQuestion.question}</h3>
                    </div>

                    <div className="space-y-3 mb-6">
                    {instantQuestion.options.map((opt) => {
                        let containerClass = "border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer";
                        let iconClass = "bg-slate-100 text-slate-500";

                        if (showInstantResult) {
                        if (opt.id === instantQuestion.correctAnswer) {
                            containerClass = "bg-green-50 border-green-500 text-green-800";
                            iconClass = "bg-green-500 text-white";
                        } else if (instantUserAnswer === opt.id) {
                            containerClass = "bg-red-50 border-red-500 text-red-800";
                            iconClass = "bg-red-500 text-white";
                        } else {
                            containerClass = "opacity-40 border-slate-100 cursor-default";
                        }
                        } else {
                        containerClass += " hover:border-orange-400 hover:bg-orange-50";
                        }

                        return (
                        <div
                            key={opt.id}
                            onClick={() => handleInstantSelect(opt.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${containerClass}`}
                        >
                            <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors ${iconClass}`}>
                                {opt.id}
                            </span>
                            <span className="font-medium">{opt.text}</span>
                            </div>
                            {showInstantResult && opt.id === instantQuestion.correctAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {showInstantResult && instantUserAnswer === opt.id && instantUserAnswer !== instantQuestion.correctAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                        );
                    })}
                    </div>

                    {showInstantResult && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 animate-in slide-in-from-bottom-2 fade-in">
                        <div className={`font-bold mb-1 flex items-center ${instantUserAnswer === instantQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                            {instantUserAnswer === instantQuestion.correctAnswer ? '回答正确！' : '回答错误'}
                        </div>
                        <div className="text-slate-600 text-sm">
                        <span className="font-bold text-slate-800">解析：</span>
                        {instantQuestion.explanation}
                        </div>
                    </div>
                    )}
                </>
                )}
            </div>

            {!isRolling && showInstantResult && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end shrink-0">
                <button 
                    onClick={startRolling}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg shadow-md font-bold flex items-center transition-transform transform active:scale-95"
                >
                    <RotateCcw className="w-4 h-4 mr-2" /> 再抽一题
                </button>
                </div>
            )}
            </div>
        </div>
      )}

      {/* 纠错弹窗 */}
      {showErrorModal && errorQuestion && (
        <ErrorReportModal
          question={errorQuestion}
          currentUser={currentUser}
          onClose={() => {
            setShowErrorModal(false);
            setErrorQuestion(null);
          }}
        />
      )}

      {/* 全局警告弹窗 */}
      {globalWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex items-center space-x-3 text-white">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-2xl font-bold">系统警告</h3>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold text-slate-800 mb-3">{globalWarning.title}</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{globalWarning.message}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setGlobalWarning(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg transition-all"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileCode(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  )
}