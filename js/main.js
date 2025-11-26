// Configuración global - VERSIÓN SIMPLIFICADA QUE SÍ FUNCIONA
const SUPABASE_URL = 'https://vrbxeerfvoaukcopydpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjU2MTksImV4cCI6MjAzNzUwMTYxOX0.7M7Hce-E1pXr_ldc6dMMT2rJp5jWY6kU-2jQ5q1x1kE';

// Inicializar Supabase
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Juego Crypto Panda iniciando...');
    
    const splashScreen = document.getElementById('splash-screen');
    const mainGame = document.getElementById('main-game');
    const progressFill = document.getElementById('progressFill');
    const startBtn = document.getElementById('startBtn');
    const splashBg = document.getElementById('splashBg');
    const loadingText = document.getElementById('loadingText');

    // URL de la imagen de portada
    const SPLASH_PNG = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/ui/splash_screen.png';
    
    // Configurar imagen de fondo INMEDIATAMENTE - sin oscurecer
    if (splashBg) {
        splashBg.style.backgroundImage = `url('${SPLASH_PNG}')`;
        splashBg.style.backgroundSize = 'cover';
        splashBg.style.backgroundPosition = 'center';
        splashBg.style.backgroundRepeat = 'no-repeat';
        // Quitar cualquier overlay oscuro
        splashBg.style.filter = 'brightness(1)';
    }

    // Ocultar botón inicialmente
    startBtn.style.display = 'none';
    startBtn.textContent = 'START GAME';

    // =============================================
    // SISTEMA DE CARGA MEJORADO - 5 SEGUNDOS
    // =============================================
    let progress = 0;
    const totalTime = 5000; // 5 segundos
    const updateInterval = 50; // Actualizar cada 50ms
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
        console.log('✅ Carga completada - Mostrando botón START');
        startBtn.style.display = 'block';
        startBtn.classList.add('visible');
        
        // Ocultar texto "Loading"
        if (loadingText) {
            loadingText.style.display = 'none';
        }
    }

    // =============================================
    // EVENTO DEL BOTÓN START - SUPER SIMPLE
    // =============================================
    startBtn.addEventListener('click', function() {
        console.log('🎯 Botón START clickeado - Iniciando juego...');
        
        // Cambiar texto del botón
        startBtn.textContent = '🎮 CARGANDO...';
        startBtn.disabled = true;
        
        // Transición suave
        setTimeout(() => {
            // Ocultar splash screen
            splashScreen.style.opacity = '0';
            splashScreen.style.visibility = 'hidden';
            
            // Mostrar juego principal
            mainGame.style.opacity = '1';
            mainGame.style.visibility = 'visible';
            
            // Iniciar Phaser después de la transición
            setTimeout(() => {
                if (typeof window.initPhaserGame === 'function') {
                    console.log('🎮 Iniciando Phaser...');
                    window.initPhaserGame();
                } else {
                    console.error('❌ initPhaserGame no encontrado');
                }
            }, 300);
            
        }, 500);
    });

    // Fallback: Si después de 6 segundos no se mostró el botón, forzar
    setTimeout(() => {
        if (startBtn.style.display === 'none') {
            console.log('⚠️ Fallback: Mostrando botón START forzadamente');
            showStartButton();
        }
    }, 6000);
});

// Inicialización de servicios básica
setTimeout(() => {
    if (window.SupabaseService && window.GameManager) {
        window.supabaseService = new window.SupabaseService();
        window.gameManager = new window.GameManager();
        console.log('✅ Servicios básicos inicializados');
    }
}, 1000);
