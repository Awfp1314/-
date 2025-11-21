import React, { useState, useRef, useEffect } from 'react';
import { Download, File, Printer, FileText, User, LogOut, Shield } from 'lucide-react';

// 导出菜单组件
export const ExportMenu = React.memo(({ MOCK_QUESTION_BANK }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowMenu(false);
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
    setShowMenu(false);
  };

  const FileCode = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
        title="导出题库"
      >
        <Download className="w-5 h-5" />
      </button>
      {showMenu && (
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
  );
});

// 用户菜单组件
export const UserMenu = React.memo(({ currentUser, onProfile, onLogout, onAdmin }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
      >
        <span className="text-2xl">{currentUser.avatar}</span>
        <span className="hidden md:block text-sm font-medium text-slate-700">{currentUser.username}</span>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="font-bold text-slate-800">{currentUser.username}</div>
            <div className="text-xs text-slate-500">{currentUser.phone}</div>
            {currentUser.isAdmin && (
              <div className="mt-1">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">管理员</span>
              </div>
            )}
          </div>
          <button
            onClick={() => { onProfile(); setShowMenu(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center"
          >
            <User className="w-4 h-4 mr-2" /> 个人主页
          </button>
          {currentUser.isAdmin && (
            <button
              onClick={() => { onAdmin(); setShowMenu(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" /> 管理后台
            </button>
          )}
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" /> 退出登录
          </button>
        </div>
      )}
    </div>
  );
});
