// Configuración global
const SUPABASE_URL = 'https://vrbxeerfvoaukcopydpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjU2MTksImV4cCI6MjAzNzUwMTYxOX0.7M7Hce-E1pXr_ldc6dMMT2rJp5jWY6kU-2jQ5q1x1kE';

// Inicializar Supabase
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const SPLASH_PNG = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/crypto_panda_portada.png';

    const splashScreen = document.getElementById('splash-screen');
    const mainGame = document.getElementById('main-game');
    const progressFill = document.getElementById('progressFill');
    const startBtn = document.getElementById('startBtn');
    const splashBg = document.getElementById('splashBg');

    // Elementos de navegación
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    startBtn.style.display = 'none';

    // Función para precargar imagen
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

    // Sistema de navegación por pestañas
    function setupNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remover activo de todos los botones
                navButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Activar botón y pestaña seleccionados
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Cargar contenido específico de la pestaña
                loadTabContent(targetTab);
            });
        });
    }

    // Cargar contenido de cada pestaña
    function loadTabContent(tabName) {
        switch(tabName) {
            case 'shop':
                loadShopContent();
                break;
            case 'clans':
                loadClansContent();
                break;
            case 'cards':
                loadCardsContent();
                break;
            case 'achievements':
                loadAchievementsContent();
                break;
        }
    }

    // Cargar contenido de la tienda
    function loadShopContent() {
        const skinsGrid = document.getElementById('skins-grid');
        if (!skinsGrid) return;

        const skins = [
            { id: 'panda-clasico', name: 'Panda Clásico', price: 'Gratis', owned: true, image: 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-clasico.png' },
            { id: 'panda-dorado', name: 'Panda Dorado', price: '1,000 🪙', owned: false, image: 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-dorado.png' },
            { id: 'panda-hielo', name: 'Panda de Hielo', price: '5,000 🪙', owned: false, image: 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-hielo.png' },
            { id: 'panda-fuego', name: 'Panda de Fuego', price: '20,000 🪙', owned: false, image: 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-fuego.png' }
        ];

        skinsGrid.innerHTML = skins.map(skin => `
            <div class="skin-item ${skin.owned ? 'owned' : ''}">
                <img src="${skin.image}" alt="${skin.name}" class="skin-image">
                <div class="skin-info">
                    <h4>${skin.name}</h4>
                    <div class="skin-price">${skin.price}</div>
                    <button class="skin-action-btn ${skin.owned ? 'equip' : 'buy'}">
                        ${skin.owned ? '🎯 EQUIPAR' : '🛒 COMPRAR'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Cargar contenido de clanes
    function loadClansContent() {
        const clanInfo = document.getElementById('clan-info');
        if (!clanInfo) return;

        clanInfo.innerHTML = `
            <div class="clan-features">
                <h4>🏆 Beneficios de los Clanes</h4>
                <ul>
                    <li>✅ Bonus de taps por clan</li>
                    <li>✅ Torneos exclusivos</li>
                    <li>✅ Recompensas diarias</li>
                    <li>✅ Chat y comunidad</li>
                </ul>
                <div class="clan-actions">
                    <button class="action-btn primary">Crear Clan (5,000 🪙)</button>
                    <button class="action-btn secondary">Buscar Clanes</button>
                </div>
            </div>
        `;
    }

    // Cargar contenido de cartas
    function loadCardsContent() {
        const cardsGrid = document.getElementById('cards-grid');
        if (!cardsGrid) return;

        const cards = [
            { name: 'Boost de Tap', effect: '+50% Taps por 5min', price: '100 🪙', image: '🃏' },
            { name: 'Energía Extra', effect: '+50 Energía instantánea', price: '50 🪙', image: '⚡' },
            { name: 'Multiplicador x2', effect: 'Doble recompensa 10min', price: '200 🪙', image: '🎯' },
            { name: 'Combo Protector', effect: 'Combo no se rompe 15min', price: '150 🪙', image: '🛡️' }
        ];

        cardsGrid.innerHTML = cards.map(card => `
            <div class="card-item">
                <div class="card-image">${card.image}</div>
                <div class="card-info">
                    <h5>${card.name}</h5>
                    <p>${card.effect}</p>
                    <div class="card-price">${card.price}</div>
                    <button class="card-action-btn">ACTIVAR</button>
                </div>
            </div>
        `).join('');
    }

    // Cargar contenido de logros
    function loadAchievementsContent() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;

        const achievements = [
            { name: 'Primeros Pasos', description: 'Realiza 10 taps', reward: '100 🪙', completed: true },
            { name: 'Tapper Novato', description: 'Realiza 100 taps', reward: '500 🪙', completed: false },
            { name: 'Combo Maestro', description: 'Alcanza combo de 20', reward: '1,000 🪙', completed: false },
            { name: 'Coleccionista', description: 'Compra tu primera skin', reward: '2 💎', completed: false }
        ];

        achievementsList.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.completed ? 'completed' : 'locked'}">
                <div class="achievement-icon">${achievement.completed ? '🏆' : '🔒'}</div>
                <div class="achievement-info">
                    <h5>${achievement.name}</h5>
                    <p>${achievement.description}</p>
                    <div class="achievement-reward">Recompensa: ${achievement.reward}</div>
                </div>
                <div class="achievement-status">
                    ${achievement.completed ? '✅ COMPLETADO' : '🔒 BLOQUEADO'}
                </div>
            </div>
        `).join('');
    }

    // Precargar imagen de splash
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

    // Evento del botón START
    startBtn.addEventListener('click', () => {
        startBtn.style.animation = 'none';
        startBtn.textContent = '¡CARGANDO JUEGO!';
        startBtn.style.transform = 'scale(1.05)';

        setTimeout(() => {
            splashScreen.classList.add('hidden');
            splashScreen.style.opacity = '0';
            splashScreen.style.visibility = 'hidden';

            mainGame.classList.remove('hidden');
            mainGame.style.opacity = '1';
            mainGame.style.visibility = 'visible';

            // Configurar navegación
            setupNavigation();
            
            // Cargar contenido inicial
            loadShopContent();
            loadClansContent();
            loadCardsContent();
            loadAchievementsContent();

            // Iniciar juego Phaser
            if (typeof window.initPhaserGame === 'function') {
                try { 
                    window.initPhaserGame(); 
                } catch (e) { 
                    console.error('Error iniciando Phaser:', e); 
                }
            } else {
                console.error('initPhaserGame no está definido');
            }

            // Integración con Telegram Web App
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

    // Fallback por si la carga tarda demasiado
    setTimeout(() => {
        if (startBtn.style.display === 'none') {
            fallbackShowStart();
        }
    }, 8000);
});
