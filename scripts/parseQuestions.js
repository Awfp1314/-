import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取题库ProMax.md
const questionBankPath = path.resolve(__dirname, '../题库ProMax.md');
const outputPath = path.resolve(__dirname, '../src/questionBank.js');

function parseQuestionBank() {
  console.log('📚 开始解析题库文件...');
  
  const content = fs.readFileSync(questionBankPath, 'utf-8');
  const lines = content.split('\n');
  
  const questions = [];
  let currentQuestion = null;
  let currentCategory = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 识别分类标题 (## 标题)
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      currentCategory = line.replace('##', '').trim();
      console.log(`📂 发现分类: ${currentCategory}`);
      continue;
    }
    
    // 识别题目标题 (### 题目 N)
    if (line.startsWith('### 题目')) {
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }
      
      const idMatch = line.match(/题目\s+(\d+)/);
      currentQuestion = {
        id: idMatch ? parseInt(idMatch[1]) : questions.length + 1,
        category: currentCategory || '未分类',
        question: '',
        options: [],
        correctAnswer: '',
        explanation: '',
        type: 'single'
      };
      continue;
    }
    
    if (!currentQuestion) continue;
    
    // 识别题目内容（第一个非空行）
    if (!currentQuestion.question && line && 
        !line.match(/^[A-D]\s*[.．：:]/) &&  // 支持点号和冒号，允许空格
        !line.startsWith('答案') && 
        !line.startsWith('**解析**') && 
        !line.startsWith('---')) {
      currentQuestion.question = line;
      continue;
    }
    
    // 识别选项（支持多种格式）
    // 格式1: A. 选项文本 或 A．选项文本 或 A：选项文本 (每个选项独立一行)
    // 格式2: A.选项文本 B.选项文本 (所有选项在一行，支持点号和冒号)
    // 格式3: D .选项文本 (字母和分隔符之间有空格)
    const optionLineMatch = line.match(/^([A-D])\s*[.．：:]/);
    if (optionLineMatch) {
      // 使用全局正则匹配所有 "字母+分隔符+内容" 的模式
      // 支持: 英文点. 中文点． 中文冒号： 英文冒号:
      // 允许字母和分隔符之间有空格
      const allOptionsRegex = /([A-D])\s*[.．：:]\s*(.+?)(?=\s*[A-D]\s*[.．：:]|$)/g;
      let match;
      
      // 先清空当前行可能重复添加的选项
      const startLength = currentQuestion.options.length;
      const newOptions = [];
      
      while ((match = allOptionsRegex.exec(line)) !== null) {
        const optionId = match[1];
        const optionText = match[2].trim();
        
        // 只添加非空且不重复的选项
        if (optionText && !currentQuestion.options.some(opt => opt.id === optionId)) {
          newOptions.push({
            id: optionId,
            text: optionText
          });
        }
      }
      
      // 添加新解析的选项
      currentQuestion.options.push(...newOptions);
      continue;
    }
    
    // 识别答案
    const answerMatch = line.match(/答案[：:]\s*([A-D,]+)/);
    if (answerMatch) {
      const answers = answerMatch[1].split(',').map(a => a.trim());
      currentQuestion.correctAnswer = answers.join(',');
      currentQuestion.type = answers.length > 1 ? 'multiple' : 'single';
      continue;
    }
    
    // 识别解析
    const explanationMatch = line.match(/\*\*解析\*\*[：:]\s*(.+)/);
    if (explanationMatch) {
      currentQuestion.explanation = explanationMatch[1].trim();
      continue;
    }
  }
  
  // 添加最后一题
  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }
  
  console.log(`✅ 解析完成！共 ${questions.length} 道题目`);
  
  // 生成questionBank.js
  const output = `// 自动生成的题库文件
// 生成时间: ${new Date().toLocaleString('zh-CN')}
// 题目总数: ${questions.length}

export const QUESTION_BANK = ${JSON.stringify(questions, null, 2)};
`;
  
  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`💾 题库已保存到: ${outputPath}`);
  
  // 统计信息
  const categories = {};
  questions.forEach(q => {
    categories[q.category] = (categories[q.category] || 0) + 1;
  });
  
  console.log('\n📊 题库统计:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} 题`);
  });
}

try {
  parseQuestionBank();
} catch (error) {
  console.error('❌ 解析失败:', error.message);
  process.exit(1);
}
