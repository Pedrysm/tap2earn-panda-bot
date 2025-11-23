// ===== CONFIGURACIÓN DEL JUEGO ÉPICO =====
class CryptoPandaGame {
    constructor() {
        this.isTelegram = window.isTelegram || false;
        this.gameState = {
            coins: 0,
            energy: 6000,
            maxEnergy: 6000,
            level: 1,
            tapPower: 1,
            combo: 0,
            lastTap: 0,
            skinMultiplier: 1.0,
            levelMultiplier: 1.0,
            cardMultiplier: 1.0,
            userId: this.generateUserId()
        };

        console.log('🎮 Inicializando Crypto Panda...');
        console.log('📱 En Telegram:', this.isTelegram);
        
        this.init();
    }

    generateUserId() {
        if (this.isTelegram && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
            return 'tg_' + window.Telegram.WebApp.initDataUnsafe.user.id;
        }
        return 'demo_' + Math.floor(Math.random() * 1000000);
    }

    init() {
        // Precargar imagen y iniciar secuencia
        this.preloadImageAndStart();
        
        // Configurar eventos MEJORADO
        this.setupEventListeners();
        
        // Inicializar sistemas
        this.initGameSystems();
    }

    async preloadImageAndStart() {
        console.log('🖼️ Precargando imagen de portada...');
        const img = new Image();
        
        img.onload = () => {
            console.log('✅ Imagen cargada correctamente');
            this.startLoadingSequence();
        };
        
        img.onerror = () => {
            console.log('⚠️  Usando fondo alternativo');
            document.querySelector('.background-image').style.background = 
                'linear-gradient(135deg, #1a0033, #000)';
            this.startLoadingSequence();
        };
        
        img.src = 'https://i.ibb.co/396YRhyL/portada.jpg?' + Date.now();
    }

    startLoadingSequence() {
        console.log('🔄 Iniciando secuencia de carga...');
        
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        const totalTime = 4000; // Reducido a 4 segundos
        const intervalTime = 40;
        const steps = totalTime / intervalTime;
        const increment = 100 / steps;
        
        const progressInterval = setInterval(() => {
            progress += increment;
            progressFill.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.showStartButton();
            }
        }, intervalTime);
    }

    showStartButton() {
        const progressContainer = document.getElementById('progressContainer');
        const startBtn = document.getElementById('startBtn');
        
        console.log('🎯 Mostrando botón START...');
        
        // Transición suave
        progressContainer.style.opacity = '0';
        progressContainer.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
            startBtn.style.display = 'block';
            
            // Animación de aparición
            setTimeout(() => {
                startBtn.classList.add('visible');
                console.log('✅ Botón START visible y listo');
            }, 50);
        }, 500);
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        
        console.log('🔧 Configurando eventos del botón START...');
        
        // MÚLTIPLOS MÉTODOS para máxima compatibilidad
        const startGameHandler = (event) => {
            console.log('🎮 Intentando iniciar juego...', event.type);
            event.preventDefault();
            event.stopPropagation();
            this.startGame();
            return false;
        };

        // Eventos para desktop
        startBtn.addEventListener('click', startGameHandler);
        
        // Eventos para móvil
        startBtn.addEventListener('touchstart', startGameHandler, { passive: false });
        startBtn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
        
        // Eventos para accesibilidad
        startBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                startGameHandler(e);
            }
        });

        // Panda tappable
        const panda = document.getElementById('panda');
        panda.addEventListener('click', (e) => this.handleTap(e));
        panda.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTap(e);
        }, { passive: false });

        console.log('✅ Todos los eventos configurados');
    }

    initGameSystems() {
        this.energySystem = new EnergySystem(this);
        this.comboSystem = new ComboSystem(this);
        this.effectSystem = new EffectSystem(this);
    }

    startGame() {
        console.log('🚀 INICIANDO JUEGO...');
        
        const startBtn = document.getElementById('startBtn');
        startBtn.disabled = true;
        startBtn.textContent = '🎮 CARGANDO...';
        startBtn.style.background = '#666';
        
        // Transición épica
        const splash = document.getElementById('splash-screen');
        splash.style.transition = 'opacity 0.8s ease';
        splash.style.opacity = '0';
        
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('main-game').style.display = 'flex';
            
            // Efectos de entrada
            this.effectSystem.flashScreen();
            this.showFloatingText('¡BIENVENIDO!', window.innerWidth / 2, window.innerHeight / 2);
            
            // Iniciar sistemas
            this.energySystem.start();
            this.updateDisplay();
            
            console.log('🎉 JUEGO INICIADO CORRECTAMENTE');
            
        }, 800);
    }

    handleTap(event) {
        if (this.gameState.energy <= 0) {
            this.showFloatingText('SIN ENERGÍA!', event.clientX, event.clientY);
            return;
        }

        this.gameState.energy--;
        
        // Cálculo de combo
        const now = Date.now();
        if (now - this.gameState.lastTap < 500) {
            this.gameState.combo++;
        } else {
            this.gameState.combo = 1;
        }
        this.gameState.lastTap = now;

        // Cálculo de recompensa
        const baseEarn = this.gameState.tapPower;
        const totalMultiplier = this.gameState.skinMultiplier * 
                              this.gameState.levelMultiplier * 
                              this.gameState.cardMultiplier;
        const comboBonus = Math.min(this.gameState.combo * 0.1, 3);
        const coinsEarned = Math.floor(baseEarn * totalMultiplier * (1 + comboBonus));

        this.gameState.coins += coinsEarned;

        // Efectos
        if (this.gameState.combo >= 5) this.showCombo();
        if (this.gameState.combo >= 10) {
            this.effectSystem.createConfetti();
            this.effectSystem.flashScreen();
        }

        this.showFloatingText('+' + coinsEarned, event.clientX, event.clientY);
        this.animatePanda();
        this.updateDisplay();
    }

    showFloatingText(text, x, y) {
        const element = document.createElement('div');
        element.className = 'floating-text';
        element.textContent = text;
        element.style.left = (x - 50) + 'px';
        element.style.top = (y - 50) + 'px';
        
        if (text.includes('SIN ENERGÍA')) {
            element.style.color = '#ff4444';
        }
        
        document.body.appendChild(element);
        setTimeout(() => element.remove(), 1000);
    }

    animatePanda() {
        const panda = document.getElementById('panda');
        panda.style.transform = 'scale(0.9)';
        setTimeout(() => panda.style.transform = 'scale(1)', 100);
    }

    showCombo() {
        const display = document.getElementById('comboDisplay');
        display.textContent = `COMBO x${this.gameState.combo}!`;
        display.style.display = 'block';
        setTimeout(() => display.style.display = 'none', 1000);
    }

    updateDisplay() {
        document.getElementById('playerCoins').textContent = this.gameState.coins.toLocaleString();
        document.getElementById('energyText').textContent = `${this.gameState.energy}/${this.gameState.maxEnergy}`;
        
        const energyPercent = (this.gameState.energy / this.gameState.maxEnergy) * 100;
        document.getElementById('energyFill').style.width = energyPercent + '%';
        
        document.getElementById('playerLevel').textContent = this.gameState.level;
    }
}

// Sistemas del juego (EnergySystem, ComboSystem, EffectSystem)...
class EnergySystem {
    constructor(game) {
        this.game = game;
    }
    start() {
        setInterval(() => {
            if (this.game.gameState.energy < this.game.gameState.maxEnergy) {
                this.game.gameState.energy++;
                this.game.updateDisplay();
            }
        }, 1000);
    }
}

class ComboSystem {
    constructor(game) {
        this.game = game;
    }
}

class EffectSystem {
    constructor(game) {
        this.game = game;
    }
    flashScreen() {
        const flash = document.createElement('div');
        flash.className = 'flash-overlay';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
    createConfetti() {
        const emojis = ['🎉', '💰', '⭐', '🔥', '💎'];
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.game.showFloatingText(
                    emojis[Math.floor(Math.random() * emojis.length)],
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight
                );
            }, i * 100);
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando juego...');
    window.cryptoPandaGame = new CryptoPandaGame();
});
