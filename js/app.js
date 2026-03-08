const App = {
  currentPage: 'home',

  async init() {
    await DataStore.init();
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigate(hash);
    });
  },

  navigate(page) {
    this.currentPage = page;
    this.render();
    window.location.hash = page;
  },

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        ${this.renderNav()}
        <main id="main-content" class="max-w-6xl mx-auto">
          ${this.renderPage()}
        </main>
      </div>
    `;

    this.initPageModule();
  },

  renderNav() {
    const pages = [
      { id: 'home', name: '首页', icon: '🏠' },
      { id: 'vocabulary', name: '词汇', icon: '📚' },
      { id: 'quiz', name: '真题', icon: '📝' },
      { id: 'mistakes', name: '错题本', icon: '❌' }
    ];

    return `
      <nav class="bg-white shadow-sm border-b">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🎓</span>
              <span class="font-bold text-xl text-gray-800">KET备考</span>
            </div>
            <div class="flex gap-1">
              ${pages.map(p => `
                <button onclick="App.navigate('${p.id}')" 
                        class="px-4 py-2 rounded-lg font-medium transition
                               ${this.currentPage === p.id 
                                 ? 'bg-blue-500 text-white' 
                                 : 'text-gray-600 hover:bg-gray-100'}">
                  <span class="mr-1">${p.icon}</span>
                  <span class="hidden sm:inline">${p.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </nav>
    `;
  },

  renderPage() {
    switch (this.currentPage) {
      case 'vocabulary':
        return '<div class="p-6 text-center text-gray-500">Loading...</div>';
      case 'quiz':
        return '<div class="p-6 text-center text-gray-500">Loading...</div>';
      case 'mistakes':
        return '<div class="p-6 text-center text-gray-500">Loading...</div>';
      default:
        return this.renderHome();
    }
  },

  renderHome() {
    const stats = DataStore.stats;
    const accuracy = DataStore.getAccuracy();
    const mistakeCount = DataStore.mistakes.filter(m => !m.mastered).length;

    return `
      <div class="p-6">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">欢迎来到 KET 备考工具</h1>
          <p class="text-gray-500">KET Exam Preparation Tool</p>
        </div>

        <div class="grid gap-4 md:grid-cols-4 mb-8">
          <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
            <div class="text-3xl font-bold text-blue-500">${stats.totalPracticed}</div>
            <div class="text-sm text-gray-500">总练习数</div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
            <div class="text-3xl font-bold text-green-500">${stats.correctCount}</div>
            <div class="text-sm text-gray-500">正确数</div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
            <div class="text-3xl font-bold text-yellow-500">${accuracy}%</div>
            <div class="text-sm text-gray-500">正确率</div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
            <div class="text-3xl font-bold text-red-500">${mistakeCount}</div>
            <div class="text-sm text-gray-500">待复习错题</div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3 mb-8">
          <div onclick="App.navigate('vocabulary')" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer">
            <div class="text-4xl mb-4">📚</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">词汇练习</h3>
            <p class="text-gray-500 text-sm mb-4">Vocabulary Practice</p>
            <div class="text-sm text-gray-400">学习KET核心词汇，中英对照，带例句和解释</div>
          </div>

          <div onclick="App.navigate('quiz')" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer">
            <div class="text-4xl mb-4">📝</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">真题模拟</h3>
            <p class="text-gray-500 text-sm mb-4">Practice Test</p>
            <div class="text-sm text-gray-400">阅读理解、词汇测试、填空题等模拟练习</div>
          </div>

          <div onclick="App.navigate('mistakes')" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-300 transition cursor-pointer">
            <div class="text-4xl mb-4">❌</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">错题本</h3>
            <p class="text-gray-500 text-sm mb-4">Mistakes Review</p>
            <div class="text-sm text-gray-400">自动记录错题，方便复习，标记已掌握</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">使用说明 Instructions</h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div class="space-y-2">
              <p>1. 📚 <strong>词汇练习</strong>：浏览单词卡片，或进入测试模式检验记忆</p>
              <p>2. 📝 <strong>真题模拟</strong>：选择题型进行模拟测试</p>
            </div>
            <div class="space-y-2">
              <p>3. ❌ <strong>错题本</strong>：自动收集错题，支持标记已掌握</p>
              <p>4. 💾 <strong>数据存储</strong>：所有进度保存在本地浏览器</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initPageModule() {
    setTimeout(() => {
      switch (this.currentPage) {
        case 'vocabulary':
          Vocabulary.init();
          break;
        case 'quiz':
          Quiz.init();
          break;
        case 'mistakes':
          Mistakes.init();
          break;
      }
    }, 0);
  }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1) || 'home';
  App.currentPage = hash;
  App.init();
});
