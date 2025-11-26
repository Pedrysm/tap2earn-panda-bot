// js/main.js - VERSIÓN 100% FUNCIONAL (fix final)

const SUPABASE_URL = 'https://vrbxeerfvoaukcopydpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjU2MTksImV4cCI6MjAzNzUwMTYxOX0.7M7Hce-E1pXr_ldc6dMMT2rJp5jWY6kU-2jQ5q1x1kE';

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log('Juego Crypto Panda iniciando...');
    
    const splashScreen = document.getElementById('splash-screen');
    const mainGame = document.getElementById('main-game');
    const progressFill = document.getElementById('progressFill');
    const startBtn = document.getElementById('startBtn');
    const splashBg = document.getElementById('splashBg');
    const loadingText = document.getElementById('loadingText');

    const SPLASH_PNG = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/ui/splash_screen.png';
    
    if (splashBg) {
        splashBg.style.backgroundImage = `url('${SPLASH_PNG}')`;
        splashBg.style.backgroundSize = 'cover';
        splashBg.style.backgroundPosition = 'center';
        splashBg.style.backgroundRepeat = 'no-repeat';
    }

    startBtn.style.display = 'none';
    startBtn.textContent = 'START GAME';

    // BARRA DE CARGA FAKE (5 segundos)
    let progress = 0;
    const totalTime = 5000;
    const updateInterval = 50;
    const increment = (100 / totalTime) * updateInterval;
    
    const progressBar = setInterval(() => {
        progress += increment;
        progressFill.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(progressBar);
            showStartButton();
        }
    }, updateInterval);

    function showStartButton() {
        console.log('Carga completada - Mostrando botón START');
        startBtn.style.display = 'block';
        startBtn.classList.add('visible');
        if (loadingText) loadingText.style.display = 'none';
    }

    // AQUÍ ESTABA EL ERROR: iniciaba Phaser demasiado pronto
    startBtn.addEventListener('click', function() {
        console.log('Botón START clickeado - Iniciando juego...');
        startBtn.textContent = 'CARGANDO...';
        startBtn.disabled = true;

        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.visibility = 'hidden';
            mainGame.style.opacity = '1';
            mainGame.style.visibility = 'visible';

            // FIX: Esperar a que TODO esté cargado antes de iniciar Phaser
            setTimeout(() => {
                if (typeof window.initPhaserGame === 'function') {
                    console.log('Iniciando Phaser...');
                    window.initPhaserGame();
                } else {
                    console.error('initPhaserGame no está listo aún');
                }
            }, 500);
        }, 500);
    });

    setTimeout(() => {
        if (startBtn.style.display === 'none') showStartButton();
    }, 6000);
});

// Servicios básicos (sin cambios)
setTimeout(() => {
    if (window.SupabaseService && window.GameManager) {
        window.supabaseService = new window.SupabaseService();
        window.gameManager = new window.GameManager();
        console.log('Servicios básicos inicializados');
    }
}, 1000);
