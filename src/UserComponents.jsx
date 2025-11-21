import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

// 登录/注册组件
export const LoginView = ({ handleLogin, handleRegister, setAppState }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !password) {
      setError('请填写完整信息');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }

    const result = isLogin 
      ? handleLogin(phone, password)
      : handleRegister(phone, password, username);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isLogin ? '登录账户' : '注册账户'}
          </h2>
          <p className="text-slate-500 mt-2">开始你的刷题之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户名（可选）</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
          >
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={() => setAppState('welcome')}
            className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

// 个人主页组件
export const ProfileView = ({ currentUser, userStats, handleUpdateProfile, setAppState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '👤');

  const avatarOptions = ['👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👑', '⭐', '🔥', '💎', '🎯', '🚀', '💪', '🎓', '📚', '✨'];

  const handleSaveProfile = () => {
    if (!editUsername.trim()) {
      alert('用户名不能为空');
      return;
    }
    handleUpdateProfile(editUsername.trim(), editAvatar);
    setIsEditing(false);
  };

  if (!currentUser || !userStats) return null;

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* 返回按钮 */}
      <button
        onClick={() => setAppState('welcome')}
        className="mb-4 flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        返回首页
      </button>

      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-6xl">{currentUser.avatar}</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{currentUser.username}</h2>
              <div className="flex items-center space-x-4 text-indigo-100">
                <span>📱 {currentUser.phone}</span>
                {currentUser.isAdmin && <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">管理员</span>}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-medium transition"
          >
            {isEditing ? '取消编辑' : '编辑资料'}
          </button>
        </div>
      </div>

      {/* 编辑资料表单 */}
      {isEditing && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">编辑个人资料</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">用户名</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择头像</label>
              <div className="grid grid-cols-10 gap-2">
                {avatarOptions.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setEditAvatar(avatar)}
                    className={`text-3xl p-2 rounded-lg transition ${
                      editAvatar === avatar ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition"
            >
              保存修改
            </button>
          </div>
        </div>
      )}

      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">总题数</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{userStats.totalQuestions}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">已练习</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{userStats.totalAnswered}</p>
            </div>
            <div className="text-4xl">✍️</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">正确率</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{userStats.accuracy}%</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">错题数</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{userStats.totalWrong}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6">分类刷题进度</h3>
        <div className="space-y-4">
          {Object.entries(userStats.categoryStats).map(([category, stats]) => {
            const progress = stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;
            const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
            
            return (
              <div key={category} className="border border-slate-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800">{category}</span>
                  <span className="text-sm text-slate-500">
                    {stats.answered} / {stats.total} 题
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">进度: {progress}%</span>
                  <span className="text-green-600">正确率: {accuracy}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
