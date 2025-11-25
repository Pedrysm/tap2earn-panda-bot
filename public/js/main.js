// Configuración global
const SUPABASE_URL = 'https://vrbxeerfvoaukcopydpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjU2MTksImV4cCI6MjAzNzUwMTYxOX0.7M7Hce-E1pXr_ldc6dMMT2rJp5jWY6kU-2jQ5q1x1kE';

// Inicializar Supabase
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Servicios globales (se inicializarán después)
window.supabaseService = null;
window.gameManager = null;
window.currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const SPLASH_PNG = 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/crypto_panda_portada.png';
    const FALLBACK_SPLASH = 'https://placehold.co/600x800/1a1a2e/FFFFFF/png?text=Crypto+Panda\\nTap2Earn\\n🐼';

    const splashScreen = document.getElementById('splash-screen');
    const mainGame = document.getElementById('main-game');
    const progressFill = document.getElementById('progressFill');
    const startBtn = document.getElementById('startBtn');
    const splashBg = document.getElementById('splashBg');

    // Elementos de navegación
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    startBtn.style.display = 'none';

    // =============================================
    // INICIALIZACIÓN DE SERVICIOS - NUEVO
    // =============================================
    async function initializeServices() {
        try {
            // Cargar servicios dinámicamente
            await loadScript('js/core/SupabaseService.js');
            await loadScript('js/core/GameManager.js');
            
            // Inicializar servicios
            window.supabaseService = new SupabaseService();
            window.gameManager = new GameManager();
            
            console.log('✅ Servicios inicializados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando servicios:', error);
            return false;
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // =============================================
    // MANEJO DE USUARIO DE TELEGRAM - NUEVO
    // =============================================
    async function initializeTelegramUser() {
        if (!window.Telegram?.WebApp) {
            console.warn('⚠️ Telegram WebApp no detectado. Usando modo desarrollo.');
            // Modo desarrollo - usuario de prueba
            return {
                id: 123456789,
                first_name: 'Test',
                username: 'test_user',
                language_code: 'es'
            };
        }

        try {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            const user = tg.initDataUnsafe?.user;
            if (user) {
                console.log('✅ Usuario de Telegram detectado:', user);
                return user;
            } else {
                throw new Error('No se pudo obtener usuario de Telegram');
            }
        } catch (error) {
            console.error('❌ Error con Telegram WebApp:', error);
            throw error;
        }
    }

    // =============================================
    // SISTEMA DE AUTENTICACIÓN - NUEVO
    // =============================================
    async function authenticateUser(telegramUser) {
        try {
            if (!window.supabaseService) {
                throw new Error('SupabaseService no inicializado');
            }

            // Verificar si el usuario existe
            const { data: existingUser, error } = await window.supabaseService.getUserByTelegramId(telegramUser.id);
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = no encontrado
                throw error;
            }

            let user;
            if (existingUser) {
                // Usuario existe - actualizar última actividad
                user = existingUser;
                await window.supabaseService.updateUserLastActive(user.id);
                console.log('✅ Usuario existente cargado:', user);
            } else {
                // Crear nuevo usuario
                user = await window.supabaseService.createUser({
                    telegram_id: telegramUser.id,
                    username: telegramUser.username,
                    first_name: telegramUser.first_name,
                    language_code: telegramUser.language_code || 'es'
                });
                console.log('✅ Nuevo usuario creado:', user);
            }

            window.currentUser = user;
            await window.gameManager.initialize(user.id);
            
            return user;
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            throw error;
        }
    }

    // Función mejorada para precargar imagen con timeout
    function preloadImage(url, fallbackUrl, onProgress, onComplete, onError) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        let loaded = false;
        let simulated = 0;
        
        const simInterval = setInterval(() => {
            simulated = Math.min(90, simulated + Math.random() * 10);
            onProgress(simulated);
        }, 120);

        const timeout = setTimeout(() => {
            if (!loaded) {
                clearInterval(simInterval);
                console.warn('Timeout cargando imagen, usando fallback');
                onError();
            }
        }, 5000);

        img.onload = () => {
            loaded = true;
            clearTimeout(timeout);
            clearInterval(simInterval);
            onProgress(100);
            onComplete(img);
        };

        img.onerror = () => {
            loaded = true;
            clearTimeout(timeout);
            clearInterval(simInterval);
            onError();
        };

        img.src = url;
    }

    function setProgress(p) {
        if (progressFill) {
            progressFill.style.width = p + '%';
        }
    }

    function showStartButton() {
        startBtn.classList.add('visible');
        startBtn.style.display = 'inline-block';
        startBtn.style.animation = 'pulse 2s infinite';
    }

    function applyFallbackBackground() {
        const fallbackStyle = {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };

        if (splashBg) {
            Object.assign(splashBg.style, fallbackStyle);
            splashBg.innerHTML = '<div style="text-align: center; color: white; font-size: 24px; font-weight: bold;">🐼 CRYPTO PANDA<br><span style="font-size: 16px;">Tap2Earn Game</span></div>';
        } else {
            Object.assign(splashScreen.style, fallbackStyle);
        }
    }

    function fallbackShowStart() {
        setProgress(100);
        applyFallbackBackground();
        setTimeout(showStartButton, 300);
    }

    // =============================================
    // SISTEMA DE NAVEGACIÓN MEJORADO
    // =============================================
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
    async function loadTabContent(tabName) {
        if (!window.supabaseService || !window.currentUser) {
            console.warn('Servicios no inicializados para cargar pestaña:', tabName);
            return;
        }

        try {
            switch(tabName) {
                case 'shop':
                    await loadShopContent();
                    break;
                case 'clans':
                    await loadClansContent();
                    break;
                case 'cards':
                    await loadCardsContent();
                    break;
                case 'achievements':
                    await loadAchievementsContent();
                    break;
            }
        } catch (error) {
            console.error(`Error cargando pestaña ${tabName}:`, error);
        }
    }

    // =============================================
    // CARGAR CONTENIDO REAL DESDE SUPABASE - NUEVO
    // =============================================
    async function loadShopContent() {
        const skinsGrid = document.getElementById('skins-grid');
        if (!skinsGrid) return;

        try {
            // Cargar skins disponibles desde Supabase
            const { data: skins, error } = await window.supabaseService.getAvailableSkins();
            if (error) throw error;

            // Cargar skins del usuario
            const { data: userSkins, error: userError } = await window.supabaseService.getUserSkins(window.currentUser.id);
            if (userError) throw userError;

            const userSkinIds = userSkins.map(us => us.skin_id);
            const equippedSkin = userSkins.find(us => us.is_equipped);

            skinsGrid.innerHTML = skins.map(skin => {
                const owned = userSkinIds.includes(skin.id);
                const isEquipped = equippedSkin?.skin_id === skin.id;
                const fallbackImage = `https://placehold.co/100x100/333333/FFFFFF/png?text=${encodeURIComponent(skin.name)}`;
                
                return `
                    <div class="skin-item ${owned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}">
                        <img src="${skin.image_url}" alt="${skin.name}" class="skin-image" onerror="this.src='${fallbackImage}'">
                        <div class="skin-info">
                            <h4>${skin.name}</h4>
                            <div class="skin-rarity ${skin.rarity}">${skin.rarity.toUpperCase()}</div>
                            <div class="skin-price">${skin.price_coins} 🪙</div>
                            <div class="skin-stats">Multiplicador: ${skin.tap_multiplier}x</div>
                            <button class="skin-action-btn ${owned ? (isEquipped ? 'equipped' : 'equip') : 'buy'}" 
                                    data-skin-id="${skin.id}" 
                                    data-owned="${owned}" 
                                    data-price="${skin.price_coins}">
                                ${owned ? (isEquipped ? '✅ EQUIPADO' : '🎯 EQUIPAR') : `🛒 COMPRAR`}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Agregar event listeners a los botones
            skinsGrid.querySelectorAll('.skin-action-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const skinId = e.target.getAttribute('data-skin-id');
                    const owned = e.target.getAttribute('data-owned') === 'true';
                    const price = parseFloat(e.target.getAttribute('data-price'));

                    if (owned) {
                        // Equipar skin
                        await window.supabaseService.equipSkin(window.currentUser.id, skinId);
                        await loadShopContent(); // Recargar
                    } else {
                        // Comprar skin
                        const success = await window.supabaseService.buySkin(window.currentUser.id, skinId, price);
                        if (success) {
                            await loadShopContent(); // Recargar
                        } else {
                            alert('❌ No tienes suficientes monedas');
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Error cargando tienda:', error);
            skinsGrid.innerHTML = '<div class="error-message">❌ Error cargando la tienda</div>';
        }
    }

    async function loadClansContent() {
        const clanInfo = document.getElementById('clan-info');
        if (!clanInfo) return;

        try {
            // Cargar clanes desde Supabase
            const { data: clans, error } = await window.supabaseService.getClans();
            if (error) throw error;

            // Cargar clan del usuario
            const { data: userClan, error: userError } = await window.supabaseService.getUserClan(window.currentUser.id);

            if (userClan) {
                // Usuario está en un clan
                clanInfo.innerHTML = `
                    <div class="clan-info">
                        <h4>${userClan.name} [${userClan.tag}]</h4>
                        <p>Nivel: ${userClan.level} | Miembros: ${userClan.member_count}/${userClan.max_members}</p>
                        <p>${userClan.description}</p>
                        <div class="clan-perks">
                            <strong>Beneficios:</strong>
                            <ul>
                                ${userClan.clan_perks.map(perk => `<li>✅ ${perk}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="clan-actions">
                            <button class="action-btn primary" id="view-clan">Ver Clan</button>
                            <button class="action-btn secondary" id="leave-clan">Salir del Clan</button>
                        </div>
                    </div>
                `;
            } else {
                // Usuario no está en un clan
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
                            <button class="action-btn primary" id="create-clan">Crear Clan (5,000 🪙)</button>
                            <button class="action-btn secondary" id="search-clans">Buscar Clanes</button>
                        </div>
                    </div>
                    <div class="clans-list">
                        <h4>Clanes Disponibles</h4>
                        ${clans.map(clan => `
                            <div class="clan-item">
                                <div class="clan-logo">
                                    <img src="${clan.logo_url}" alt="${clan.name}">
                                </div>
                                <div class="clan-details">
                                    <h5>${clan.name} [${clan.tag}]</h5>
                                    <p>Nivel ${clan.level} | ${clan.member_count}/${clan.max_members} miembros</p>
                                    <p>${clan.description}</p>
                                </div>
                                <button class="clan-join-btn" data-clan-id="${clan.id}">Unirse</button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error cargando clanes:', error);
            clanInfo.innerHTML = '<div class="error-message">❌ Error cargando clanes</div>';
        }
    }

    async function loadCardsContent() {
        const cardsGrid = document.getElementById('cards-grid');
        if (!cardsGrid) return;

        try {
            // Cargar cartas disponibles
            const { data: cards, error } = await window.supabaseService.getCollectibleCards();
            if (error) throw error;

            // Cargar cartas del usuario
            const { data: userCards, error: userError } = await window.supabaseService.getUserCards(window.currentUser.id);
            if (userError) throw userError;

            cardsGrid.innerHTML = cards.map(card => {
                const userCard = userCards.find(uc => uc.card_id === card.id);
                const quantity = userCard ? userCard.quantity : 0;
                
                return `
                    <div class="card-item ${card.rarity}">
                        <div class="card-image">
                            <img src="${card.image_url}" alt="${card.card_name}">
                        </div>
                        <div class="card-info">
                            <h5>${card.card_name}</h5>
                            <p>${card.description}</p>
                            <div class="card-effect">Efecto: ${card.effect_type} - ${card.effect_value}</div>
                            <div class="card-rarity ${card.rarity}">${card.rarity.toUpperCase()}</div>
                            <div class="card-quantity">Cantidad: ${quantity}</div>
                            <button class="card-action-btn" data-card-id="${card.id}" ${quantity === 0 ? 'disabled' : ''}>
                                ACTIVAR
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error cargando cartas:', error);
            cardsGrid.innerHTML = '<div class="error-message">❌ Error cargando cartas</div>';
        }
    }

    async function loadAchievementsContent() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;

        try {
            // Cargar logros disponibles
            const { data: achievements, error } = await window.supabaseService.getAchievements();
            if (error) throw error;

            // Cargar progreso del usuario
            const { data: userAchievements, error: userError } = await window.supabaseService.getUserAchievements(window.currentUser.id);
            if (userError) throw userError;

            achievementsList.innerHTML = achievements.map(achievement => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                const completed = userAchievement?.is_completed || false;
                const progress = userAchievement?.progress_current || 0;
                const target = achievement.requirement_value;

                return `
                    <div class="achievement-item ${completed ? 'completed' : 'locked'}">
                        <div class="achievement-icon">${completed ? '🏆' : '🔒'}</div>
                        <div class="achievement-info">
                            <h5>${achievement.name}</h5>
                            <p>${achievement.description}</p>
                            <div class="achievement-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(progress / target) * 100}%"></div>
                                </div>
                                <span>${progress}/${target}</span>
                            </div>
                            <div class="achievement-reward">
                                Recompensa: ${achievement.reward_coins} 🪙 + ${achievement.reward_gems} 💎
                            </div>
                        </div>
                        <div class="achievement-status">
                            ${completed ? '✅ COMPLETADO' : '🔒 BLOQUEADO'}
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Error cargando logros:', error);
            achievementsList.innerHTML = '<div class="error-message">❌ Error cargando logros</div>';
        }
    }

    // =============================================
    // FLUJO PRINCIPAL MEJORADO
    // =============================================
    async function initializeApp() {
        try {
            // 1. Inicializar servicios
            const servicesReady = await initializeServices();
            if (!servicesReady) {
                throw new Error('No se pudieron inicializar los servicios');
            }

            // 2. Obtener usuario de Telegram
            const telegramUser = await initializeTelegramUser();

            // 3. Autenticar usuario en Supabase
            await authenticateUser(telegramUser);

            console.log('✅ Aplicación inicializada correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando aplicación:', error);
            return false;
        }
    }

    // Precargar imagen de splash
    preloadImage(
        SPLASH_PNG,
        FALLBACK_SPLASH,
        (p) => setProgress(p),
        (img) => {
            console.log('Imagen de portada cargada exitosamente');
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
            console.warn('Error cargando portada desde Supabase. Aplicando fallback...');
            fallbackShowStart();
        }
    );

    // Evento del botón START
    startBtn.addEventListener('click', async () => {
        startBtn.style.animation = 'none';
        startBtn.textContent = '¡INICIALIZANDO...!';
        startBtn.disabled = true;

        try {
            // Inicializar aplicación
            const appReady = await initializeApp();
            
            if (!appReady) {
                throw new Error('La aplicación no se pudo inicializar');
            }

            // Transición a la pantalla principal
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
                loadTabContent('shop');

                // Iniciar juego Phaser
                if (typeof window.initPhaserGame === 'function') {
                    try { 
                        window.initPhaserGame(); 
                        console.log('Juego Phaser iniciado correctamente');
                    } catch (e) { 
                        console.error('Error iniciando Phaser:', e); 
                    }
                }

                // Integración con Telegram Web App
                if (window.Telegram?.WebApp) {
                    try {
                        Telegram.WebApp.ready();
                        Telegram.WebApp.expand();
                        console.log('Telegram WebApp integrado');
                    } catch (e) {
                        console.error('Error con Telegram WebApp:', e);
                    }
                }
            }, 600);

        } catch (error) {
            console.error('Error crítico al iniciar:', error);
            startBtn.textContent = '❌ ERROR - RECARGAR';
            startBtn.disabled = false;
            alert('Error al inicializar el juego. Por favor, recarga la página.');
        }
    });

    // Fallback por si la carga tarda demasiado
    setTimeout(() => {
        if (startBtn.style.display === 'none') {
            console.log('Timeout: Mostrando botón START por fallback');
            fallbackShowStart();
        }
    }, 3000);
});
