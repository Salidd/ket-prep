const Mistakes = {
  filter: 'all',

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">错题本 Mistakes</h2>
          <div class="flex gap-2">
            <select onchange="Mistakes.changeFilter(this.value)" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all" ${this.filter === 'all' ? 'selected' : ''}>全部</option>
              <option value="unmastered" ${this.filter === 'unmastered' ? 'selected' : ''}>未掌握</option>
              <option value="mastered" ${this.filter === 'mastered' ? 'selected' : ''}>已掌握</option>
            </select>
            ${DataStore.mistakes.length > 0 ? `
              <button onclick="Mistakes.clearAll()" class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                清空错题本
              </button>
            ` : ''}
          </div>
        </div>

        ${this.renderMistakes()}
      </div>
    `;
  },

  renderMistakes() {
    let mistakes = DataStore.mistakes;

    if (this.filter === 'unmastered') {
      mistakes = mistakes.filter(m => !m.mastered);
    } else if (this.filter === 'mastered') {
      mistakes = mistakes.filter(m => m.mastered);
    }

    if (mistakes.length === 0) {
      return `
        <div class="text-center py-16">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-500 text-lg">暂无错题记录</p>
          <p class="text-gray-400 text-sm mt-2">继续练习，加油！</p>
        </div>
      `;
    }

    return `
      <div class="mb-4 text-sm text-gray-500">
        共 ${mistakes.length} 条记录
      </div>
      <div class="space-y-4">
        ${mistakes.map(m => this.renderMistakeItem(m)).join('')}
      </div>
    `;
  },

  renderMistakeItem(mistake) {
    const question = this.getQuestionData(mistake);
    if (!question) return '';

    const word = mistake.wordId ? DataStore.getWordById(mistake.wordId) : null;

    return `
      <div class="bg-white rounded-xl shadow-sm border ${mistake.mastered ? 'border-green-200' : 'border-red-200'} p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs px-2 py-1 rounded ${mistake.mastered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                ${mistake.mastered ? '✅ 已掌握' : '❌ 未掌握'}
              </span>
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                ${this.getTypeName(mistake.type)}
              </span>
              ${word ? `
                <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  ${word.english}
                </span>
              ` : ''}
            </div>

            <div class="font-medium text-gray-800 mb-2">
              ${question.question}
            </div>

            ${question.context ? `
              <div class="text-sm text-gray-500 bg-gray-50 p-2 rounded mb-2">
                ${question.context}
              </div>
            ` : ''}

            <div class="text-sm mb-2">
              <span class="text-gray-500">正确答案: </span>
              <span class="text-green-600 font-medium">
                ${question.type === 'fill_blank' ? question.answer : (question.options ? question.options[question.answer] : '')}
              </span>
            </div>

            <div class="text-sm text-gray-500 bg-blue-50 p-2 rounded">
              💡 ${question.explanation}
            </div>

            <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span>错误次数: ${mistake.wrongCount}</span>
              <span>最近错误: ${mistake.lastWrongDate}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2 ml-4">
            ${!mistake.mastered ? `
              <button onclick="Mistakes.markMastered(${mistake.questionId}, '${mistake.type}')" 
                      class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition">
                标记已掌握
              </button>
            ` : `
              <button onclick="Mistakes.unmarkMastered(${mistake.questionId}, '${mistake.type}')" 
                      class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition">
                取消掌握
              </button>
            `}
            <button onclick="Mistakes.remove(${mistake.questionId}, '${mistake.type}')" 
                    class="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition">
              删除
            </button>
          </div>
        </div>
      </div>
    `;
  },

  getQuestionData(mistake) {
    if (mistake.type === 'vocabulary') {
      const word = DataStore.getWordById(mistake.wordId);
      if (word) {
        return {
          question: `单词 "${word.english}" 的中文意思是什么？`,
          answer: word.chinese,
          type: 'vocabulary',
          explanation: `${word.phonetic} - ${word.explanation}\n例句: ${word.example}`
        };
      }
    }

    const allQuestions = [
      ...(DataStore.questions.reading || []),
      ...(DataStore.questions.vocabulary_quiz || []),
      ...(DataStore.questions.fill_blank || [])
    ];

    return allQuestions.find(q => q.id === mistake.questionId);
  },

  getTypeName(type) {
    const names = {
      reading: '阅读理解',
      vocabulary_quiz: '词汇测试',
      vocabulary: '词汇练习',
      fill_blank: '填空题'
    };
    return names[type] || type;
  },

  changeFilter(value) {
    this.filter = value;
    this.render();
  },

  markMastered(questionId, type) {
    DataStore.markMastered(questionId, type);
    this.render();
  },

  unmarkMastered(questionId, type) {
    const mistake = DataStore.mistakes.find(m => m.questionId === questionId && m.type === type);
    if (mistake) {
      mistake.mastered = false;
      DataStore.saveMistakes();
    }
    this.render();
  },

  remove(questionId, type) {
    if (confirm('确定要删除这条错题记录吗？')) {
      DataStore.removeMistake(questionId, type);
      this.render();
    }
  },

  clearAll() {
    if (confirm('确定要清空所有错题记录吗？此操作不可恢复！')) {
      DataStore.mistakes = [];
      DataStore.saveMistakes();
      this.render();
    }
  }
};

window.Mistakes = Mistakes;
