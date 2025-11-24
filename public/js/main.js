// Al inicio de main.js, verifica que Phaser esté cargado
if (typeof Phaser === 'undefined') {
  console.error('Phaser no está disponible. Verifica la carga del script.');
}

document.addEventListener('DOMContentLoaded', () => {
  const SPLASH_PNG = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/crypto_panda_portada.png';

  const splashScreen = document.getElementById('splash-screen');
  const mainGame = document.getElementById('main-game');
  const progressFill = document.getElementById('progressFill');
  const startBtn = document.getElementById('startBtn');
  const splashBg = document.getElementById('splashBg');

  startBtn.style.display = 'none';

  function preloadImage(url, onProgress, onComplete, onError) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let simulated = 0;
    const simInterval = setInterval(() => {
      simulated = Math.min(90, simulated + Math.random() * 10);
      onProgress(simulated);
    }, 120);

    img.onload = () => {
      clearInterval(simInterval);
      onProgress(100);
      onComplete(img);
    };

    img.onerror = () => {
      clearInterval(simInterval);
      onError();
    };

    img.src = url;
  }

  function setProgress(p) {
    progressFill.style.width = p + '%';
  }

  function showStartButton() {
    startBtn.classList.add('visible');
    startBtn.style.display = 'inline-block';
  }

  function fallbackShowStart() {
    progressFill.style.width = '100%';
    setTimeout(showStartButton, 300);
  }

  preloadImage(
    SPLASH_PNG,
    (p) => setProgress(p),
    (img) => {
      if (splashBg) {
        splashBg.style.backgroundImage = `url('${SPLASH_PNG}')`;
        splashBg.style.backgroundSize = 'cover';
        splashBg.style.backgroundPosition = 'center';
      } else {
        splashScreen.style.backgroundImage = `url('${SPLASH_PNG}')`;
        splashScreen.style.backgroundSize = 'cover';
        splashScreen.style.backgroundPosition = 'center';
      }

      setTimeout(() => {
        setProgress(100);
        showStartButton();
      }, 250);
    },
    () => {
      console.warn('Error cargando portada desde Supabase. Se mostrará fallback.');
      fallbackShowStart();
    }
  );

  startBtn.addEventListener('click', () => {
    startBtn.style.animation = 'none';
    startBtn.textContent = '¡ENTRANDO!';
    startBtn.style.transform = 'scale(1.05)';

    setTimeout(() => {
      splashScreen.classList.add('hidden');
      splashScreen.style.opacity = '0';
      splashScreen.style.visibility = 'hidden';

      mainGame.classList.remove('hidden');
      mainGame.style.opacity = '1';
      mainGame.style.visibility = 'visible';

      if (typeof window.initPhaserGame === 'function') {
        try { 
          window.initPhaserGame(); 
        } catch (e) { 
          console.error('Error iniciando Phaser:', e); 
        }
      } else {
        console.error('initPhaserGame no está definido');
      }

      if (window.Telegram?.WebApp) {
        try {
          Telegram.WebApp.ready();
          if (typeof Telegram.WebApp.expand === 'function') Telegram.WebApp.expand();
        } catch (e) {
          console.error('Error con Telegram WebApp:', e);
        }
      }
    }, 600);
  });

  setTimeout(() => {
    if (startBtn.style.display === 'none') {
      fallbackShowStart();
    }
  }, 8000);
});
