const Quiz = {
  currentSection: null,
  currentIndex: 0,
  questions: [],
  answers: [],
  showResult: false,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">真题模拟 Practice Test</h2>
        
        ${this.currentSection === null ? this.renderSectionSelect() : this.renderQuiz()}
      </div>
    `;
  },

  renderSectionSelect() {
    const sections = [
      { id: 'reading', name: '阅读理解 Reading', icon: '📖', desc: '理解短文和通知' },
      { id: 'vocabulary_quiz', name: '词汇测试 Vocabulary', icon: '📝', desc: '词汇选择和翻译' },
      { id: 'fill_blank', name: '填空题 Fill in Blanks', icon: '✏️', desc: '完成句子' }
    ];

    return `
      <div class="grid gap-4 md:grid-cols-3">
        ${sections.map(s => `
          <div onclick="Quiz.selectSection('${s.id}')" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer">
            <div class="text-4xl mb-4">${s.icon}</div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">${s.name}</h3>
            <p class="text-gray-500 text-sm">${s.desc}</p>
            <div class="mt-4 text-sm text-blue-500">
              ${DataStore.questions[s.id] ? DataStore.questions[s.id].length + ' 题' : '0 题'}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderQuiz() {
    if (this.showResult) {
      return this.renderResult();
    }

    if (this.questions.length === 0) {
      this.startQuiz();
    }

    const question = this.questions[this.currentIndex];

    return `
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <button onclick="Quiz.backToSections()" class="text-gray-500 hover:text-gray-700">
            ← 返回
          </button>
          <div class="text-sm text-gray-500">
            ${this.currentIndex + 1} / ${this.questions.length}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="mb-4">
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              ${this.getSectionName()}
            </span>
          </div>

          ${question.context ? `
            <div class="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
              ${question.context}
            </div>
          ` : ''}

          <div class="text-lg font-medium text-gray-800 mb-6">
            ${question.question}
          </div>

          ${this.renderQuestionOptions(question)}

          <div id="quiz-feedback" class="mt-4 hidden"></div>
          
          <div id="quiz-actions" class="mt-6 flex gap-3">
            <button onclick="Quiz.checkAnswer()" id="submit-btn"
                    class="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
              提交答案 Submit
            </button>
          </div>
        </div>

        <div class="mt-4 flex gap-2 flex-wrap">
          ${this.questions.map((q, idx) => `
            <button onclick="Quiz.goToQuestion(${idx})" 
                    class="w-8 h-8 rounded text-sm font-medium transition
                           ${idx === this.currentIndex ? 'bg-blue-500 text-white' : 
                             this.answers[idx] !== undefined ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}">
              ${idx + 1}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderQuestionOptions(question) {
    if (question.type === 'multiple_choice' || question.type === 'translation') {
      return `
        <div class="space-y-3" id="options-container">
          ${question.options.map((opt, idx) => `
            <label class="flex items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition option-label">
              <input type="radio" name="answer" value="${idx}" class="mr-3" onchange="Quiz.selectOption(${idx})">
              <span class="text-gray-400 mr-2">${String.fromCharCode(65 + idx)}.</span>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
      `;
    } else if (question.type === 'fill_blank') {
      return `
        <div>
          <input type="text" id="fill-answer" 
                 class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                 placeholder="输入答案..."
                 onkeypress="if(event.key==='Enter') Quiz.checkAnswer()">
        </div>
      `;
    }
    return '';
  },

  renderResult() {
    const correct = this.answers.filter((a, idx) => {
      const q = this.questions[idx];
      if (q.type === 'fill_blank') {
        return a && a.toLowerCase() === q.answer.toLowerCase();
      }
      return a === q.answer;
    }).length;
    const total = this.questions.length;
    const percent = Math.round((correct / total) * 100);

    return `
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8 text-center mb-6">
          <div class="text-6xl mb-4">${percent >= 80 ? '🎉' : percent >= 60 ? '👍' : '💪'}</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">测试完成!</h3>
          <div class="text-4xl font-bold ${percent >= 80 ? 'text-green-500' : percent >= 60 ? 'text-yellow-500' : 'text-red-500'} mb-2">
            ${correct} / ${total}
          </div>
          <div class="text-gray-500">正确率: ${percent}%</div>
        </div>

        <div class="space-y-4">
          ${this.questions.map((q, idx) => {
            const isCorrect = q.type === 'fill_blank' 
              ? this.answers[idx] && this.answers[idx].toLowerCase() === q.answer.toLowerCase()
              : this.answers[idx] === q.answer;
            return `
              <div class="bg-white rounded-lg p-4 ${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="font-medium text-gray-800 mb-2">${q.question}</div>
                    ${q.context ? `<div class="text-sm text-gray-500 mb-2">${q.context}</div>` : ''}
                    <div class="text-sm">
                      <span class="text-gray-500">你的答案: </span>
                      <span class="${isCorrect ? 'text-green-600' : 'text-red-600'}">
                        ${q.type === 'fill_blank' ? (this.answers[idx] || '未作答') : (q.options ? q.options[this.answers[idx]] : '')}
                      </span>
                    </div>
                    ${!isCorrect ? `
                      <div class="text-sm">
                        <span class="text-gray-500">正确答案: </span>
                        <span class="text-green-600">${q.type === 'fill_blank' ? q.answer : q.options[q.answer]}</span>
                      </div>
                    ` : ''}
                    <div class="text-sm text-gray-500 mt-2 bg-blue-50 p-2 rounded">
                      💡 ${q.explanation}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="mt-6 flex gap-3">
          <button onclick="Quiz.restartQuiz()" class="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
            🔄 再测一次
          </button>
          <button onclick="Quiz.backToSections()" class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">
            📚 返回选择
          </button>
        </div>
      </div>
    `;
  },

  selectSection(sectionId) {
    this.currentSection = sectionId;
    this.questions = [];
    this.answers = [];
    this.currentIndex = 0;
    this.showResult = false;
    this.render();
  },

  startQuiz() {
    this.questions = [...(DataStore.questions[this.currentSection] || [])].sort(() => Math.random() - 0.5);
    this.answers = new Array(this.questions.length);
    this.currentIndex = 0;
  },

  selectOption(idx) {
    this.answers[this.currentIndex] = idx;
    document.querySelectorAll('.option-label').forEach((el, i) => {
      el.classList.remove('border-blue-500', 'bg-blue-50');
      if (i === idx) {
        el.classList.add('border-blue-500', 'bg-blue-50');
      }
    });
  },

  checkAnswer() {
    const question = this.questions[this.currentIndex];
    let userAnswer;

    if (question.type === 'fill_blank') {
      userAnswer = document.getElementById('fill-answer').value.trim();
      this.answers[this.currentIndex] = userAnswer;
    } else {
      userAnswer = this.answers[this.currentIndex];
    }

    if (userAnswer === undefined || userAnswer === '') {
      alert('请选择或输入答案！');
      return;
    }

    let isCorrect;
    if (question.type === 'fill_blank') {
      isCorrect = userAnswer.toLowerCase() === question.answer.toLowerCase();
    } else {
      isCorrect = userAnswer === question.answer;
    }

    DataStore.updateStats(isCorrect);

    if (!isCorrect) {
      DataStore.addMistake(question.id, this.currentSection, question.wordId);
    }

    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.remove('hidden');
    feedback.innerHTML = `
      <div class="p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
        ${isCorrect ? '✅ 正确! Correct!' : `❌ 错误! 正确答案是: ${question.type === 'fill_blank' ? question.answer : question.options[question.answer]}`}
        <div class="text-sm mt-2 text-gray-600">${question.explanation}</div>
      </div>
    `;

    document.getElementById('submit-btn').textContent = '下一题 Next';
    document.getElementById('submit-btn').onclick = () => this.nextQuestion();
  },

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.render();
    } else {
      this.showResult = true;
      this.render();
    }
  },

  goToQuestion(idx) {
    this.currentIndex = idx;
    this.render();
  },

  restartQuiz() {
    this.questions = [];
    this.answers = [];
    this.currentIndex = 0;
    this.showResult = false;
    this.render();
  },

  backToSections() {
    this.currentSection = null;
    this.questions = [];
    this.answers = [];
    this.currentIndex = 0;
    this.showResult = false;
    this.render();
  },

  getSectionName() {
    const names = {
      reading: '阅读理解',
      vocabulary_quiz: '词汇测试',
      fill_blank: '填空题'
    };
    return names[this.currentSection] || '';
  }
};

window.Quiz = Quiz;
