import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import * as api from './apiClient.js';

// 题目纠错弹窗组件
export const ErrorReportModal = ({ question, currentUser, onClose }) => {
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (isSending) return;

    if (!correctAnswer) {
      alert('请选择您认为的正确答案');
      return;
    }

    if (!description.trim()) {
      alert('请填写问题描述');
      return;
    }

    setIsSending(true);

    try {
      // 创建纠错报告
      const errorReport = {
        questionId: question.id,
        question: question.question,
        currentAnswer: question.correctAnswer,
        suggestedAnswer: correctAnswer,
        description: description.trim(),
        userId: currentUser?.phone || '游客',
        username: currentUser?.username || '游客',
        userAvatar: currentUser?.avatar || '👤'
      };

      // 通过API提交
      const result = await api.submitErrorReport(errorReport);

      if (result.success) {
        alert('纠错报告已提交！感谢您的反馈，管理员会尽快审核。');
        onClose();
      } else {
        alert(result.message || '提交失败，请重试');
      }
    } catch (error) {
      alert('提交失败，请重试');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 flex justify-between items-center text-white rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">题目纠错</h3>
              <p className="text-orange-100 text-sm">帮助我们改进题库质量</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 题目信息 */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-start space-x-2 mb-2">
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-semibold">
                题目 #{question.id}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                {question.category}
              </span>
            </div>
            <h4 className="font-bold text-slate-800 mb-3">{question.question}</h4>
            
            {/* 选项 */}
            <div className="space-y-2 mb-3">
              {question.options.map(opt => (
                <div
                  key={opt.id}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    opt.id === question.correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-white'
                  }`}
                >
                  <span className={`font-bold ${
                    opt.id === question.correctAnswer ? 'text-green-700' : 'text-slate-600'
                  }`}>
                    {opt.id}.
                  </span>
                  <span className={opt.id === question.correctAnswer ? 'text-green-700' : 'text-slate-700'}>
                    {opt.text}
                  </span>
                  {opt.id === question.correctAnswer && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded ml-auto">
                      当前答案
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 解析 */}
            <div className="bg-white rounded p-3 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">当前解析：</p>
              <p className="text-sm text-slate-700">{question.explanation}</p>
            </div>
          </div>

          {/* 选择正确答案 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              您认为的正确答案 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {question.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setCorrectAnswer(opt.id)}
                  className={`px-4 py-3 rounded-lg font-bold text-lg transition-all ${
                    correctAnswer === opt.id
                      ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.id}
                </button>
              ))}
            </div>
            {correctAnswer && (
              <p className="text-sm text-orange-600 mt-2">
                ✓ 您选择了答案 <strong>{correctAnswer}</strong>
              </p>
            )}
          </div>

          {/* 问题描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              问题描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细说明为什么您认为答案有误，或者题目存在哪些问题..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">{description.length}/500</p>
          </div>

          {/* 提示 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                您的纠错报告将发送给管理员审核。如果确认有误，我们会及时更正题库。感谢您的贡献！
              </span>
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSending}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center ${
              isSending
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 transform hover:scale-105'
            } text-white`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                提交中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                提交纠错
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
