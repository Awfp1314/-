import React, { useState } from 'react';
import { X, Send, Reply } from 'lucide-react';
import * as api from './apiClient.js';

// 管理员回复弹窗
export const ReplyModal = ({ item, type, onClose }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (isSending) return;

    if (!replyContent.trim()) {
      alert('请填写回复内容');
      return;
    }

    setIsSending(true);

    try {
      // 创建回复通知
      const replyNotification = {
        type: 'success',
        title: type === 'feedback' ? '管理员回复了您的反馈' : '管理员回复了您的纠错报告',
        message: replyContent.trim(),
        isReply: true,
        originalType: type,
        originalTitle: type === 'feedback' ? item.title : `题目 #${item.questionId}`,
        fromAdmin: true,
        isGlobal: true
      };

      // 通过API发送通知
      const result = await api.sendNotification(replyNotification);

      if (result.success) {
        alert('回复已发送给用户！');
        onClose(true);
      } else {
        alert(result.message || '发送失败，请重试');
      }
    } catch (error) {
      alert('发送失败，请重试');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-between items-center text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Reply className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-lg">回复用户</h3>
              <p className="text-blue-100 text-sm">您的回复将直接发送给该用户</p>
            </div>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-white/80 hover:text-white transition-colors bg-white/10 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-4">
          {/* 原始内容 */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-3xl">{item.userAvatar}</span>
              <div>
                <p className="font-bold text-slate-800">{item.username}</p>
                <p className="text-xs text-slate-500">{item.userId}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200">
              {type === 'feedback' ? (
                <>
                  <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.content}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                      题目 #{item.questionId}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">{item.question}</h4>
                  <div className="flex items-center space-x-3 text-sm mb-2">
                    <span className="text-red-600">当前答案: <strong>{item.currentAnswer}</strong></span>
                    <span className="text-slate-400">→</span>
                    <span className="text-green-600">建议答案: <strong>{item.suggestedAnswer}</strong></span>
                  </div>
                  <p className="text-sm text-slate-600 bg-white rounded p-2">{item.description}</p>
                </>
              )}
            </div>
          </div>

          {/* 回复内容 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              您的回复 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={
                type === 'feedback'
                  ? '感谢您的反馈！我们会认真考虑您的建议...'
                  : '感谢您的纠错！我们已经核实，将尽快更新题库...'
              }
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">{replyContent.length}/500</p>
          </div>

          {/* 提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💡 您的回复将作为系统通知发送给该用户，用户会在右上角的铃铛图标中看到。
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-6 bg-slate-50 flex justify-end space-x-3 rounded-b-2xl border-t border-slate-100">
          <button
            onClick={() => onClose(false)}
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
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
            } text-white`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                发送中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                发送回复
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
