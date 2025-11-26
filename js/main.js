// js/main.js - SPLASH SCREEN OFICIAL 100% FUNCIONAL (5 segundos)

const SUPABASE_URL = 'https://vrbxeerfvoaukcopydpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjU2MTksImV4cCI6MjAzNzUwMTYxOX0.7M7Hce-E1pXr_ldc6dMMT2rJp5jWY6kU-2jQ5q1x1kE';
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log('Crypto Panda iniciando...');

    const splashScreen = document.getElementById('splash-screen');
    const mainGame = document.getElementById('main-game');
    const startBtn = document.getElementById('startBtn');

    // === TUS ASSETS OFICIALES ===
    const SPLASH_BG = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/ui/splash_screen.png';
    const PROGRESS_BAR = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/ui/bar-progress.jpg';
    const START_BUTTON = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/ui/start-bottom.jpg';

    // Fondo completo
    splashScreen.style.background = `url('${SPLASH_BG}') center/cover no-repeat`;

    // Barra de progreso
    const progressContainer = document.createElement('div');
    progressContainer.style.position = 'absolute';
    progressContainer.style.bottom = '180px';
    progressContainer.style.left = '50%';
    progressContainer.style.transform = 'translateX(-50%)';
    progressContainer.style.width = '80%';
    progressContainer.style.height = '40px';
    progressContainer.innerHTML = `
        <img src="${PROGRESS_BAR}" style="width:100%; height:100%; border-radius:12px;">
        <div style="position:absolute; top:0; left:0; width:0%; height:100%; background:linear-gradient(90deg, #00ff9d, #00b8ff); border-radius:12px; transition:width 0.1s linear;"></div>
    `;
    splashScreen.appendChild(progressContainer);
    const progressFill = progressContainer.querySelector('div');

    // Botón START GAME (tu diseño oficial)
    startBtn.style.background = `url('${START_BUTTON}') center/cover no-repeat`;
    startBtn.style.border = 'none';
    startBtn.style.width = '280px';
    startBtn.style.height = '90px';
    startBtn.style.cursor = 'pointer';
    startBtn.style.position = 'absolute';
    startBtn.style.bottom = '70px';
    startBtn.style.left = '50%';
    startBtn.style.transform = 'translateX(-50%)';
    startBtn.style.display = 'none';

    // === BARRA QUE SE LLENA EN EXACTOS 5 SEGUNDOS ===
    let progress = 0;
    const duration = 5000;
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
        progress += increment;
        progressFill.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(timer);
            startBtn.style.display = 'block';
            startBtn.style.animation = 'pulse 1.5s infinite';
        }
    }, interval);

    // === AL TOCAR START GAME ===
    startBtn.addEventListener('click', () => {
        console.log('START GAME clickeado');
        startBtn.style.opacity = '0.7';

        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.transition = 'opacity 0.8s';
            mainGame.style.opacity = '1';
            mainGame.style.visibility = 'visible';

            setTimeout(() => {
                if (typeof window.initPhaserGame === 'function') {
                    window.initPhaserGame();
                }
            }, 600);
        }, 400);
    });

    // CSS pulse para el botón
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.05); }
            100% { transform: translateX(-50%) scale(1); }
        }
    `;
    document.head.appendChild(style);
});
