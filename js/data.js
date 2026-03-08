const DataStore = {
  vocabulary: [],
  questions: null,
  mistakes: [],
  stats: {
    totalPracticed: 0,
    correctCount: 0,
    wrongCount: 0
  },

  async init() {
    try {
      const vocabRes = await fetch('./data/vocabulary.json');
      const vocabData = await vocabRes.json();
      this.vocabulary = vocabData.words || [];

      const questionsRes = await fetch('./data/questions.json');
      this.questions = await questionsRes.json();

      this.loadMistakes();
      this.loadStats();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  },

  loadMistakes() {
    const saved = localStorage.getItem('ket_mistakes');
    this.mistakes = saved ? JSON.parse(saved) : [];
  },

  saveMistakes() {
    localStorage.setItem('ket_mistakes', JSON.stringify(this.mistakes));
  },

  loadStats() {
    const saved = localStorage.getItem('ket_stats');
    if (saved) {
      this.stats = JSON.parse(saved);
    }
  },

  saveStats() {
    localStorage.setItem('ket_stats', JSON.stringify(this.stats));
  },

  addMistake(questionId, questionType, wordId = null) {
    const existing = this.mistakes.find(m => m.questionId === questionId && m.type === questionType);
    if (existing) {
      existing.wrongCount++;
      existing.lastWrongDate = new Date().toISOString().split('T')[0];
    } else {
      this.mistakes.push({
        questionId,
        type: questionType,
        wordId,
        wrongCount: 1,
        lastWrongDate: new Date().toISOString().split('T')[0],
        mastered: false
      });
    }
    this.saveMistakes();
  },

  removeMistake(questionId, questionType) {
    this.mistakes = this.mistakes.filter(m => !(m.questionId === questionId && m.type === questionType));
    this.saveMistakes();
  },

  markMastered(questionId, questionType) {
    const mistake = this.mistakes.find(m => m.questionId === questionId && m.type === questionType);
    if (mistake) {
      mistake.mastered = true;
      this.saveMistakes();
    }
  },

  updateStats(isCorrect) {
    this.stats.totalPracticed++;
    if (isCorrect) {
      this.stats.correctCount++;
    } else {
      this.stats.wrongCount++;
    }
    this.saveStats();
  },

  getAccuracy() {
    if (this.stats.totalPracticed === 0) return 0;
    return Math.round((this.stats.correctCount / this.stats.totalPracticed) * 100);
  },

  getWordById(id) {
    return this.vocabulary.find(w => w.id === id);
  },

  getRandomWords(count, exclude = []) {
    const available = this.vocabulary.filter(w => !exclude.includes(w.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  getCategories() {
    const cats = new Set(this.vocabulary.map(w => w.category));
    return Array.from(cats);
  },

  getWordsByCategory(category) {
    return this.vocabulary.filter(w => w.category === category);
  }
};

window.DataStore = DataStore;
