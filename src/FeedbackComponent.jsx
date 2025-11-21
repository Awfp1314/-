import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import * as api from './apiClient.js';

// 意见反馈组件
export const FeedbackButton = React.memo(({ currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion'); // suggestion, bug, other
  const [isSending, setIsSending] = useState(false);

  // 如果是管理员，不显示反馈按钮（管理员不需要给自己发反馈）
  if (!currentUser || currentUser.isAdmin) {
    return null;
  }

  const handleSubmit = async () => {
    if (isSending) return;

    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      alert('请填写完整的反馈标题和内容');
      return;
    }

    setIsSending(true);

    try {
      // 创建反馈消息
      const feedback = {
        userId: currentUser.phone,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        type: feedbackType,
        title: feedbackTitle,
        content: feedbackContent
      };

      // 通过API提交
      const result = await api.submitFeedback(feedback);

      if (result.success) {
        alert('反馈已提交成功！管理员会尽快查看。');
        
        // 清空并关闭
        setFeedbackTitle('');
        setFeedbackContent('');
        setFeedbackType('suggestion');
        setShowModal(false);
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

  const typeOptions = [
    { value: 'suggestion', label: '💡 建议', color: 'blue' },
    { value: 'bug', label: '🐛 Bug反馈', color: 'red' },
    { value: 'other', label: '💬 其他', color: 'gray' }
  ];

  return (
    <>
      {/* 反馈按钮 */}
      <button
        onClick={() => setShowModal(true)}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
        title="意见反馈"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* 反馈弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-between items-center text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-lg">意见反馈</h3>
                  <p className="text-blue-100 text-sm">告诉我们您的想法</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* 反馈类型 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">反馈类型</label>
                <div className="flex space-x-2">
                  {typeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFeedbackType(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                        feedbackType === option.value
                          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">反馈标题</label>
                <input
                  type="text"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="简要描述您的反馈..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  maxLength={50}
                />
                <p className="text-xs text-slate-400 mt-1">{feedbackTitle.length}/50</p>
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">详细描述</label>
                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="请详细描述您的问题或建议..."
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-slate-400 mt-1">{feedbackContent.length}/500</p>
              </div>

              {/* 提示 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  💡 您的反馈将直接发送给管理员，我们会尽快处理并回复。
                </p>
              </div>
            </div>

            {/* 底部 */}
            <div className="p-6 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
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
                    : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105'
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
                    提交反馈
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
