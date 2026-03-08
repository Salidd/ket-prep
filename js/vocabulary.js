const Vocabulary = {
  currentWord: null,
  currentIndex: 0,
  quizMode: false,
  quizWords: [],
  selectedCategory: 'all',
  showingAnswer: false,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">词汇练习 Vocabulary</h2>
          <div class="flex gap-2">
            <button onclick="Vocabulary.toggleMode()" class="px-4 py-2 rounded-lg font-medium transition ${this.quizMode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
              ${this.quizMode ? '📚 学习模式' : '✏️ 测试模式'}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="text-sm text-gray-600 mr-2">选择分类:</label>
          <select onchange="Vocabulary.changeCategory(this.value)" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all" ${this.selectedCategory === 'all' ? 'selected' : ''}>全部 All</option>
            ${DataStore.getCategories().map(cat => `
              <option value="${cat}" ${this.selectedCategory === cat ? 'selected' : ''}>${cat}</option>
            `).join('')}
          </select>
        </div>

        ${this.quizMode ? this.renderQuizMode() : this.renderStudyMode()}
      </div>
    `;
  },

  renderStudyMode() {
    const words = this.selectedCategory === 'all' 
      ? DataStore.vocabulary 
      : DataStore.getWordsByCategory(this.selectedCategory);

    if (words.length === 0) {
      return '<p class="text-gray-500">暂无词汇数据</p>';
    }

    return `
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${words.map((word, idx) => `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer" onclick="Vocabulary.showWordDetail(${word.id})">
            <div class="flex justify-between items-start mb-2">
              <span class="text-lg font-bold text-blue-600">${word.english}</span>
              <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${word.category}</span>
            </div>
            <div class="text-gray-500 text-sm mb-1">${word.phonetic}</div>
            <div class="text-gray-800 font-medium">${word.chinese}</div>
            <div class="text-gray-500 text-sm mt-2 line-clamp-2">${word.explanation}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderQuizMode() {
    if (this.quizWords.length === 0) {
      this.startQuiz();
    }

    if (this.currentIndex >= this.quizWords.length) {
      return this.renderQuizResult();
    }

    const word = this.quizWords[this.currentIndex];
    const options = this.generateOptions(word);

    return `
      <div class="max-w-2xl mx-auto">
        <div class="mb-4 text-sm text-gray-500">
          进度: ${this.currentIndex + 1} / ${this.quizWords.length}
        </div>
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="text-center mb-6">
            <div class="text-3xl font-bold text-blue-600 mb-2">${word.english}</div>
            <div class="text-gray-500">${word.phonetic}</div>
          </div>
          
          <div class="space-y-3" id="quiz-options">
            ${options.map((opt, idx) => `
              <button onclick="Vocabulary.selectAnswer(${word.id}, '${opt.chinese}', this)" 
                      class="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition font-medium">
                <span class="text-gray-400 mr-2">${String.fromCharCode(65 + idx)}.</span>
                ${opt.chinese}
              </button>
            `).join('')}
          </div>

          <div id="quiz-feedback" class="mt-4 hidden"></div>
          
          <div id="next-btn-container" class="mt-4 hidden">
            <button onclick="Vocabulary.nextQuestion()" class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
              下一题 Next
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderQuizResult() {
    const correct = this.quizWords.filter((w, idx) => w.correct).length;
    const total = this.quizWords.length;
    const percent = Math.round((correct / total) * 100);

    return `
      <div class="max-w-md mx-auto text-center">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="text-6xl mb-4">${percent >= 80 ? '🎉' : percent >= 60 ? '👍' : '💪'}</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">测试完成!</h3>
          <div class="text-4xl font-bold ${percent >= 80 ? 'text-green-500' : percent >= 60 ? 'text-yellow-500' : 'text-red-500'} mb-4">
            ${correct} / ${total}
          </div>
          <div class="text-gray-500 mb-6">正确率: ${percent}%</div>
          
          <div class="space-y-2">
            <button onclick="Vocabulary.reviewMistakes()" class="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">
              📝 复习错题
            </button>
            <button onclick="Vocabulary.restartQuiz()" class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
              🔄 再测一次
            </button>
          </div>
        </div>
      </div>
    `;
  },

  startQuiz() {
    const words = this.selectedCategory === 'all' 
      ? DataStore.vocabulary 
      : DataStore.getWordsByCategory(this.selectedCategory);
    this.quizWords = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    this.currentIndex = 0;
    this.quizWords.forEach(w => w.correct = false);
  },

  restartQuiz() {
    this.quizWords = [];
    this.currentIndex = 0;
    this.render();
  },

  generateOptions(correctWord) {
    const others = DataStore.getRandomWords(3, [correctWord.id]);
    const options = [correctWord, ...others].sort(() => Math.random() - 0.5);
    return options;
  },

  selectAnswer(wordId, selectedChinese, btn) {
    const word = DataStore.getWordById(wordId);
    const isCorrect = selectedChinese === word.chinese;
    const quizWord = this.quizWords[this.currentIndex];
    quizWord.correct = isCorrect;

    DataStore.updateStats(isCorrect);

    const buttons = document.querySelectorAll('#quiz-options button');
    buttons.forEach(b => {
      b.disabled = true;
      b.classList.remove('hover:border-blue-400', 'hover:bg-blue-50');
    });

    if (isCorrect) {
      btn.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
    } else {
      btn.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
      buttons.forEach(b => {
        if (b.textContent.includes(word.chinese)) {
          b.classList.add('bg-green-100', 'border-green-500');
        }
      });
      DataStore.addMistake(wordId, 'vocabulary', wordId);
    }

    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.remove('hidden');
    feedback.innerHTML = `
      <div class="p-4 rounded-lg ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
        ${isCorrect ? '✅ 正确! Correct!' : `❌ 错误! 正确答案是: ${word.chinese}`}
        <div class="text-sm mt-2 text-gray-600">${word.explanation}</div>
      </div>
    `;

    document.getElementById('next-btn-container').classList.remove('hidden');
  },

  nextQuestion() {
    this.currentIndex++;
    this.render();
  },

  reviewMistakes() {
    const mistakes = this.quizWords.filter(w => !w.correct);
    if (mistakes.length > 0) {
      this.quizWords = mistakes;
      this.currentIndex = 0;
      this.render();
    }
  },

  toggleMode() {
    this.quizMode = !this.quizMode;
    this.quizWords = [];
    this.currentIndex = 0;
    this.render();
  },

  changeCategory(category) {
    this.selectedCategory = category;
    this.quizWords = [];
    this.currentIndex = 0;
    this.render();
  },

  showWordDetail(wordId) {
    const word = DataStore.getWordById(wordId);
    if (!word) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">${word.english}</div>
          <div class="text-gray-500 mb-4">${word.phonetic}</div>
          <div class="text-2xl font-medium text-gray-800 mb-4">${word.chinese}</div>
          <div class="bg-gray-50 rounded-lg p-4 text-left mb-4">
            <div class="text-sm text-gray-500 mb-1">解释 Explanation:</div>
            <div class="text-gray-700">${word.explanation}</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4 text-left mb-4">
            <div class="text-sm text-blue-500 mb-1">例句 Example:</div>
            <div class="text-gray-700">${word.example}</div>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            关闭 Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
};

window.Vocabulary = Vocabulary;
