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
    if (!currentQuestion.question && line && !line.startsWith('A.') && !line.startsWith('B.') && 
        !line.startsWith('C.') && !line.startsWith('D.') && !line.startsWith('答案') && 
        !line.startsWith('**解析**') && !line.startsWith('---')) {
      currentQuestion.question = line;
      continue;
    }
    
    // 识别选项
    const optionMatch = line.match(/^([A-D])\.\s*(.+)/);
    if (optionMatch) {
      currentQuestion.options.push({
        id: optionMatch[1],
        text: optionMatch[2].trim()
      });
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
