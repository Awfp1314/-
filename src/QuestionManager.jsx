import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, X, Search, Filter } from 'lucide-react';
import * as api from './apiClient.js';

export const QuestionManager = ({ MOCK_QUESTION_BANK }) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 所有分类
  const categories = ['全部', ...new Set(MOCK_QUESTION_BANK.map(q => q.category))];

  // 加载题库
  useEffect(() => {
    loadQuestions();
  }, []);

  // 订阅实时更新
  useEffect(() => {
    const unsubscribes = [
      api.subscribeWebSocket('QUESTION_ADDED', (data) => {
        setQuestions(prev => [...prev, data.question]);
      }),
      api.subscribeWebSocket('QUESTION_UPDATED', (data) => {
        setQuestions(prev => prev.map(q => 
          q.id === data.question.id ? data.question : q
        ));
      }),
      api.subscribeWebSocket('QUESTION_DELETED', (data) => {
        setQuestions(prev => prev.filter(q => q.id !== data.questionId));
      }),
      api.subscribeWebSocket('QUESTION_BANK_UPDATED', () => {
        loadQuestions();
      })
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // 搜索和筛选
  useEffect(() => {
    let filtered = [...questions]; // 创建新数组，避免引用问题

    // 分类筛选
    if (categoryFilter !== '全部') {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }

    // 搜索筛选
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(search) ||
        q.id.toString() === searchTerm.trim() || // 精确匹配ID
        q.category.toLowerCase().includes(search)
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, categoryFilter]);

  const loadQuestions = async () => {
    setLoading(true);
    const result = await api.getAllQuestions();
    if (result.success) {
      setQuestions(result.questions || []);
    }
    setLoading(false);
  };

  const handleEdit = (question) => {
    setEditingQuestion({ ...question });
    setShowAddForm(false);
  };

  const handleDelete = async (questionId) => {
    if (!confirm('确定要删除这道题目吗？')) return;
    
    const result = await api.deleteQuestion(questionId);
    if (result.success) {
      alert('删除成功！');
    } else {
      alert(result.message || '删除失败');
    }
  };

  const handleSave = async () => {
    if (editingQuestion.id) {
      // 更新
      const result = await api.updateQuestion(editingQuestion.id, editingQuestion);
      if (result.success) {
        alert('更新成功！');
        setEditingQuestion(null);
      } else {
        alert(result.message || '更新失败');
      }
    }
  };

  const handleAdd = async (newQuestion) => {
    const result = await api.addQuestion(newQuestion);
    if (result.success) {
      alert('添加成功！');
      setShowAddForm(false);
    } else {
      alert(result.message || '添加失败');
    }
  };

  const handleImportFromFile = async () => {
    if (!confirm(`确定要从 questionBank.js 导入 ${MOCK_QUESTION_BANK.length} 道题目吗？\n这将覆盖数据库中的所有题目！`)) return;
    
    const result = await api.importQuestions(MOCK_QUESTION_BANK);
    if (result.success) {
      alert(result.message);
      loadQuestions();
    } else {
      alert(result.message || '导入失败');
    }
  };

  return (
    <div className="p-6">
      {/* 头部操作栏 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">题库管理</h2>
          <p className="text-sm text-slate-500 mt-1">
            共 {questions.length} 道题目 | 显示 {filteredQuestions.length} 道
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingQuestion(null);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> 添加题目
          </button>
          <button
            onClick={handleImportFromFile}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            导入题库文件
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索题目或题号..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 编辑/添加表单 */}
      {(editingQuestion || showAddForm) && (
        <QuestionEditForm
          question={editingQuestion}
          onSave={editingQuestion ? handleSave : handleAdd}
          onCancel={() => {
            setEditingQuestion(null);
            setShowAddForm(false);
          }}
          onChange={setEditingQuestion}
        />
      )}

      {/* 题目列表 */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">加载中...</div>
      ) : (
        <div className="space-y-2">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-indigo-600">#{q.id}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {q.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      q.type === 'multiple' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {q.type === 'multiple' ? '多选题' : '单选题'}
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium mb-2">{q.question}</div>
                  <div className="text-sm text-slate-600 space-y-1">
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className={`font-medium ${
                          q.correctAnswer.includes(opt.id) ? 'text-green-600' : ''
                        }`}>
                          {opt.id}.
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">正确答案：</span>{q.correctAnswer}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 题目编辑表单组件
const QuestionEditForm = ({ question, onSave, onCancel, onChange }) => {
  const [formData, setFormData] = useState(
    question || {
      category: '未分类',
      question: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ],
      correctAnswer: '',
      explanation: '',
      type: 'single'
    }
  );

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onChange) onChange(updated);
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text };
    handleChange('options', newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证
    if (!formData.question.trim()) {
      alert('请输入题目内容');
      return;
    }
    if (formData.options.some(opt => !opt.text.trim())) {
      alert('请填写所有选项');
      return;
    }
    if (!formData.correctAnswer) {
      alert('请输入正确答案');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-indigo-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">
          {question ? '编辑题目' : '添加新题目'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 分类和类型 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">题型</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="single">单选题</option>
              <option value="multiple">多选题</option>
            </select>
          </div>
        </div>

        {/* 题目内容 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">题目内容</label>
          <textarea
            value={formData.question}
            onChange={(e) => handleChange('question', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            placeholder="请输入题目内容..."
          />
        </div>

        {/* 选项 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">选项</label>
          <div className="space-y-2">
            {formData.options.map((opt, index) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="font-bold text-slate-600 w-8">{opt.id}.</span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder={`选项 ${opt.id}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 正确答案 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            正确答案 {formData.type === 'multiple' && '(多选用逗号分隔，如：A,B,C)'}
          </label>
          <input
            type="text"
            value={formData.correctAnswer}
            onChange={(e) => handleChange('correctAnswer', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            placeholder={formData.type === 'multiple' ? '例如：A,B,C' : '例如：A'}
          />
        </div>

        {/* 解析 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">解析</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => handleChange('explanation', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            placeholder="请输入题目解析..."
          />
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Save className="w-4 h-4" /> 保存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};
