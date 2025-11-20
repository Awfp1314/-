import { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft, RotateCcw, Cpu, Zap, Layers, BarChart3, AlertTriangle, Download, FileText, Printer, File, CalendarClock, Github, Flag, Mail, X, Sparkles, Shuffle } from 'lucide-react';
import { QUESTION_BANK } from './questionBank.js';

// 使用解析后的题库
const MOCK_QUESTION_BANK = QUESTION_BANK.length > 0 ? QUESTION_BANK : [
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

export default function App() {
  // --- State 定义 ---
  const [appState, setAppState] = useState('welcome'); // welcome, quiz, result
  const [quizMode, setQuizMode] = useState('practice'); // practice, exam, instant, mistakes
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false); // 导出菜单状态
  const exportMenuRef = useRef(null);
  const modalContentRef = useRef(null); // 用于闪电刷题弹窗自动滚动
  
  // 闪电刷题弹窗相关状态
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantQuestion, setInstantQuestion] = useState(null); // 当前闪电题目
  const [isRolling, setIsRolling] = useState(false); // 是否正在播放抽取动画
  const [instantUserAnswer, setInstantUserAnswer] = useState(null); // 闪电模式下的答案

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

  // 考试倒计时状态
  const [examCountdown, setExamCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      localStorage.setItem('iot_answered_ids', JSON.stringify([...newSet]));
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
      return newSet; // 返回新 Set，触发 Effect 同步存储
    });
  };

  // 处理题目反馈
  const handleFeedback = (q) => {
    const subject = `[题库纠错] 题目ID: ${q.id}`;
    const body = `我对题目: "${q.question}" 有疑问。\n\n请在此描述问题:`;
    window.location.href = `mailto:feedback@iotmaster.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 考试倒计时逻辑 (目标日期 11.22 8:00) ---
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

    setExamCountdown(calculateTimeLeft());
    const timer = setInterval(() => {
      setExamCountdown(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


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


  // --- 导出功能核心逻辑 ---
  const handleExport = (format) => {
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const title = `物联网安调题库_${date}`;
    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return alert("请允许弹出窗口以进行打印导出");
      
      const htmlContent = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: "Helvetica Neue", Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
              h1 { text-align: center; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
              .question-item { margin-bottom: 25px; page-break-inside: avoid; border: 1px solid #f0f0f0; padding: 15px; border-radius: 8px; }
              .question-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; line-height: 1.5; }
              .tag { font-size: 12px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #666; margin-left: 5px; font-weight: normal; }
              .options { margin-left: 15px; margin-bottom: 10px; }
              .option { margin: 5px 0; font-size: 14px; }
              .answer-block { background: #f9fafb; padding: 10px; border-radius: 6px; font-size: 13px; margin-top: 10px; }
              .correct-ans { font-weight: bold; color: #059669; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            ${MOCK_QUESTION_BANK.map((q, index) => `
              <div class="question-item">
                <div class="question-title">
                  ${index + 1}. ${q.question} <span class="tag">${q.category}</span>
                </div>
                <div class="options">
                  ${q.options.map(opt => `<div class="option">${opt.id}. ${opt.text}</div>`).join('')}
                </div>
                <div class="answer-block">
                  <div>正确答案: <span class="correct-ans">${q.correctAnswer}</span></div>
                  <div style="margin-top:5px; color:#555;">解析: ${q.explanation}</div>
                </div>
              </div>
            `).join('')}
            <div class="footer">生成于: ${new Date().toLocaleString()}</div>
            <script>
              window.onload = () => { setTimeout(() => { window.print(); }, 500); };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setShowExportMenu(false);
      return;
    }

    if (format === 'txt') {
      content = `=== ${title} ===\n\n` + MOCK_QUESTION_BANK.map((q, i) => (
        `${i + 1}. [${q.category}] ${q.question}\n` +
        q.options.map(o => `   ${o.id}. ${o.text}`).join('\n') +
        `\n   > 正确答案: ${q.correctAnswer}\n   > 解析: ${q.explanation}\n`
      )).join('\n-----------------------------------\n\n');
      mimeType = 'text/plain';
      extension = 'txt';
    } else if (format === 'md') {
      content = `# ${title}\n\n` + MOCK_QUESTION_BANK.map((q, i) => (
        `### ${i + 1}. ${q.question}\n` +
        `**分类**: \`${q.category}\`\n\n` +
        q.options.map(o => `- [ ] ${o.id}. ${o.text}`).join('\n') +
        `\n\n> **正确答案**: **${q.correctAnswer}** \n> **解析**: ${q.explanation}`
      )).join('\n\n---\n\n');
      mimeType = 'text/markdown';
      extension = 'md';
    } else if (format === 'word') {
      content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title></head>
        <body style="font-family: Arial, sans-serif;">
          <h1>${title}</h1>
          ${MOCK_QUESTION_BANK.map((q, i) => `
            <div style="margin-bottom: 20px;">
              <h3>${i + 1}. ${q.question} <span style="font-size: 12px; color: #666; background:#eee; padding:2px;">[${q.category}]</span></h3>
              <ul style="list-style-type: none; padding-left: 0;">
                ${q.options.map(opt => `<li>${opt.id}. ${opt.text}</li>`).join('')}
              </ul>
              <p style="color: green;"><strong>正确答案: ${q.correctAnswer}</strong></p>
              <p style="background-color: #f9f9f9; padding: 5px;"><em>解析: ${q.explanation}</em></p>
              <hr/>
            </div>
          `).join('')}
        </body></html>
      `;
      mimeType = 'application/msword';
      extension = 'doc';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // --- 普通模式逻辑 ---

  const startQuiz = (mode) => {
    // 如果点击的是闪电模式，直接走弹窗逻辑，不改变 appState
    if (mode === 'instant') {
      openInstantMode();
      return;
    }

    setQuizMode(mode);
    setUserAnswers({});
    setCurrentIndex(0);

    if (mode === 'exam') {
      const shuffled = shuffleArray(MOCK_QUESTION_BANK).slice(0, 4);
      setCurrentQuestions(shuffled);
      setTimeLeft(60); 
      setAppState('quiz');
    } else if (mode === 'mistakes') {
      const wrongQuestions = MOCK_QUESTION_BANK.filter(q => wrongQuestionIds.has(q.id));
      if (wrongQuestions.length === 0) {
        alert("太棒了！你当前没有错题记录。");
        return;
      }
      setCurrentQuestions(wrongQuestions);
      setTimeLeft(0);
      setAppState('quiz');
    } else {
      setCurrentQuestions(MOCK_QUESTION_BANK);
      setTimeLeft(0);
      setAppState('quiz');
    }
  };

  const handleOptionSelect = (qId, optionId) => {
    if (userAnswers[qId]) return; 
    if (appState === 'result') return;

    setUserAnswers(prev => ({ ...prev, [qId]: optionId }));
    markQuestionAsPracticed(qId);

    const currentQ = MOCK_QUESTION_BANK.find(q => q.id === qId);
    const isCorrect = currentQ.correctAnswer === optionId;
    updateMistakeNotebook(qId, isCorrect);
  };

  const submitQuiz = () => {
    setAppState('result');
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
  }, [appState, quizMode, timeLeft]);

  const resultStats = useMemo(() => {
    if (appState !== 'result') return { score: 0 };
    let correctCount = 0;
    currentQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correctCount++;
    });
    return {
      score: Math.round((correctCount / currentQuestions.length) * 100),
      correctCount,
      total: currentQuestions.length,
      wrongCount: currentQuestions.length - correctCount
    };
  }, [appState, currentQuestions, userAnswers]);


  // --- 组件视图 ---

  const WelcomeView = () => (
    <div className="flex flex-col items-center mt-12 text-center space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">物联网安调在线刷题系统</h1>
        <p className="text-slate-500">IoT Installation & Debugging Question Bank</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl px-4">
        <button 
          onClick={() => startQuiz('practice')}
          className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-3">
            <Layers className="w-8 h-8 text-indigo-500" />
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded">基础</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800">全库顺序练习</h3>
          <p className="text-sm text-slate-500 mt-2 opacity-80">按顺序练习所有题目，无时间限制。</p>
        </button>

        <button 
          onClick={() => startQuiz('exam')}
          className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="bg-purple-50 text-purple-600 text-xs font-bold px-2 py-1 rounded">模考</span>
          </div>
          <h3 className="font-bold text-lg text-slate-800">限时随机模考</h3>
          <p className="text-sm text-slate-500 mt-2 opacity-80">随机抽取 4 题，限时 60 秒。</p>
        </button>

        <button 
          onClick={() => startQuiz('instant')}
          className="group p-6 bg-orange-50 border border-orange-200 rounded-xl hover:border-orange-500 hover:shadow-lg hover:bg-orange-100 transition-all text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-orange-200 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <Zap className="w-8 h-8 text-orange-500" />
            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">推荐</span>
          </div>
          <h3 className="font-bold text-lg text-orange-900 relative z-10">闪电刷题</h3>
          <p className="text-sm text-orange-800 mt-2 opacity-80 relative z-10">随机抽取，动画开箱，即刻开练。</p>
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

  const QuizView = () => {
    const currentQ = currentQuestions[currentIndex];
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
    const isLastQuestion = currentIndex === currentQuestions.length - 1;
    const userAnswer = userAnswers[currentQ.id];
    
    return (
      <div className="max-w-3xl mx-auto w-full">
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

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col relative">
          <div className="p-6 md:p-8">
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
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                let containerClass = "border-slate-200 hover:bg-slate-50 text-slate-600";
                let iconClass = "bg-slate-100 text-slate-500";

                if (userAnswer === opt.id) {
                    containerClass = "border-indigo-500 bg-indigo-50 text-indigo-700";
                    iconClass = "bg-indigo-500 text-white";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${containerClass}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors ${iconClass}`}>
                        {opt.id}
                      </span>
                      <span className="font-medium">{opt.text}</span>
                    </div>
                    {userAnswer === opt.id && <CheckCircle className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

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
                 const isCorrect = userAns === q.correctAnswer;
                 return (
                     <div key={q.id} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-800">#{index+1} {q.question}</span>
                            {isCorrect ? <span className="text-green-600 text-sm font-bold">正确</span> : <span className="text-red-600 text-sm font-bold">错误</span>}
                        </div>
                        <div className="text-sm text-slate-500 mb-2">你的答案: {userAns || '未选'} | 正确答案: {q.correctAnswer}</div>
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
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          {/* 左侧区域 */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setAppState('welcome')}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap">IoT Master</span>
            </div>
            
            {/* 倒计时 */}
            <div className="hidden md:flex items-center text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md border border-indigo-100 shadow-sm">
               <CalendarClock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
               <span className="mr-2 font-bold text-slate-600">理论考试倒计时:</span>
               <span className="font-bold text-indigo-700">
                 {examCountdown.days}天 {examCountdown.hours}时 {examCountdown.minutes}分 {examCountdown.seconds}秒
               </span>
            </div>
          </div>
          
          {/* 右侧区域 */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                <span className="whitespace-nowrap">累计刷题: <span className="text-indigo-600 font-bold">{answeredIds.size}</span> / {MOCK_QUESTION_BANK.length}</span>
            </div>

            {/* 导出按钮 */}
            <div className="relative" ref={exportMenuRef}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                title="导出题库"
              >
                <Download className="w-5 h-5" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                   <div className="px-4 py-2 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">选择格式</div>
                   <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center">
                     <File className="w-4 h-4 mr-2" /> 导出 Word (.doc)
                   </button>
                   <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center">
                     <Printer className="w-4 h-4 mr-2" /> 打印 / PDF
                   </button>
                   <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center">
                     <FileCode className="w-4 h-4 mr-2" /> 导出 Markdown
                   </button>
                   <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center">
                     <FileText className="w-4 h-4 mr-2" /> 导出 Txt
                   </button>
                </div>
              )}
            </div>

            {appState === 'quiz' && (
                <button onClick={() => setAppState('welcome')} className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors whitespace-nowrap">
                退出
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {appState === 'welcome' && <WelcomeView />}
        {appState === 'quiz' && <QuizView />}
        {appState === 'result' && <ResultView />}
      </main>
      
      <a 
        href="https://github.com/Awfp1314"
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
      >
        <Github className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">GitHub Project</span>
      </a>

      <a 
        href="mailto:feedback@iotmaster.com"
        className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
      >
        <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">联系作者</span>
      </a>

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