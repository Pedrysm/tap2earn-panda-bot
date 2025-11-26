// Simulación de entorno Telegram y Supabase
window.currentUser = null;

window.supabaseService = {
  async getUserStats(userId) {
    console.log('📡 Cargando stats desde Supabase...');
    // Simulación de datos reales
    return {
      data: {
        energy: 100,
        coins: 0,
        experience: 0,
        level: 1,
        max_energy: 100,
        tap_power: 1.0,
        total_taps: 0,
        gems: 0,
        current_skin: 'panda-clasico'
      },
      error: null
    };
  },

  async updateUserStats(userId, updates) {
    console.log('💾 Guardando progreso en Supabase...', updates);
    return { error: null };
  }
};

// Splash → Juego
document.getElementById('start-button').addEventListener('click', async () => {
  const splash = document.getElementById('splash-screen');
  const mainGame = document.getElementById('main-game');

  splash.classList.remove('active');
  splash.classList.add('hidden');

  mainGame.classList.remove('hidden');
  mainGame.classList.add('active');

  // Simulación de usuario Telegram
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    window.currentUser = tg.initDataUnsafe.user;
    tg.ready();
    tg.expand();
  } else {
    window.currentUser = { id: 'demo-user', username: 'DemoPanda' };
  }

  // Iniciar juego
  window.initPhaserGame();
});
