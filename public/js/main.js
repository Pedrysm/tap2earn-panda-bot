// ===== CONFIGURACIÓN DEL JUEGO ÉPICO =====
class CryptoPandaGame {
    constructor() {
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
            userId: null
        };

        this.init();
    }

    init() {
        console.log('🎮 Inicializando Crypto Panda Épico...');
        
        // Precargar imagen y iniciar secuencia
        this.preloadImageAndStart();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Inicializar sistemas
        this.initGameSystems();
    }

    async preloadImageAndStart() {
        const img = new Image();
        const startTime = Date.now();
        
        img.onload = () => {
            const loadTime = Date.now() - startTime;
            console.log(`✅ Imagen cargada en ${loadTime}ms`);
            this.startLoadingSequence();
        };
        
        img.onerror = () => {
            console.log('❌ Error cargando imagen, usando fondo alternativo');
            document.querySelector('.background-image').style.background = 
                'linear-gradient(135deg, #1a0033, #000)';
            this.startLoadingSequence();
        };
        
        img.src = 'https://i.ibb.co/396YRhyL/portada.jpg?' + Date.now();
    }

    startLoadingSequence() {
        console.log('🔄 Iniciando secuencia de carga épica...');
        
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        const totalTime = 5000;
        const intervalTime = 50;
        const steps = totalTime / intervalTime;
        const increment = 100 / steps;
        
        const progressInterval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                this.showStartButton();
            }
            progressFill.style.width = progress + '%';
        }, intervalTime);
    }

    showStartButton() {
        const progressContainer = document.getElementById('progressContainer');
        const startBtn = document.getElementById('startBtn');
        
        console.log('🎯 Mostrando botón de inicio épico...');
        
        progressContainer.classList.add('fade-out');
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
            startBtn.classList.add('visible');
        }, 500);
    }

    setupEventListeners() {
        // Botón de inicio
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Área de tap del panda
        document.getElementById('panda').addEventListener('click', (e) => {
            this.handleTap(e);
        });

        // Navegación por tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Botones de acción rápida
        document.getElementById('dailyRewardBtn').addEventListener('click', () => {
            this.showDailyReward();
        });
    }

    initGameSystems() {
        // Inicializar sistemas del juego
        this.energySystem = new EnergySystem(this);
        this.comboSystem = new ComboSystem(this);
        this.effectSystem = new EffectSystem(this);
        
        console.log('⚡ Sistemas del juego inicializados');
    }

    startGame() {
        console.log('🚀 Iniciando juego épico...');
        
        // Ocultar splash screen con transición épica
        const splash = document.getElementById('splash-screen');
        splash.style.opacity = '1';
        splash.style.transition = 'opacity 0.8s ease';
        
        setTimeout(() => {
            splash.style.opacity = '0';
            
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('main-game').style.display = 'flex';
                
                // Efecto de entrada épico
                this.effectSystem.flashScreen();
                this.showFloatingText('¡BIENVENIDO!', window.innerWidth / 2, window.innerHeight / 2);
                
                // Iniciar sistemas en tiempo real
                this.energySystem.start();
                this.updateDisplay();
                
                console.log('🎉 Juego completamente cargado y listo!');
            }, 800);
        }, 100);
    }

    handleTap(event) {
        if (this.gameState.energy <= 0) {
            this.showFloatingText('SIN ENERGÍA!', event.clientX, event.clientY);
            return;
        }

        // Consumir energía
        this.gameState.energy -= 1;
        
        // Calcular combo épico
        const now = Date.now();
        if (now - this.gameState.lastTap < 500) {
            this.gameState.combo++;
        } else {
            this.gameState.combo = 1;
        }
        this.gameState.lastTap = now;

        // Calcular ganancia ÉPICA con múltiples multiplicadores
        let baseEarn = this.gameState.tapPower;
        let totalMultiplier = this.gameState.skinMultiplier * 
                            this.gameState.levelMultiplier * 
                            this.gameState.cardMultiplier;

        // Bonus de combo progresivo
        const comboBonus = Math.min(this.gameState.combo * 0.1, 3);
        totalMultiplier *= (1 + comboBonus);

        const coinsEarned = Math.floor(baseEarn * totalMultiplier);

        // Efectos especiales basados en combo
        if (this.gameState.combo >= 5) {
            this.showCombo();
        }
        if (this.gameState.combo >= 10) {
            this.effectSystem.createConfetti();
            this.effectSystem.flashScreen();
        }
        if (this.gameState.combo >= 20) {
            this.effectSystem.createEpicExplosion(event.clientX, event.clientY);
        }

        this.gameState.coins += coinsEarned;

        // Efectos visuales épicos
        this.showFloatingText('+' + coinsEarned, event.clientX, event.clientY);
        this.animatePanda();
        this.updateDisplay();

        console.log(`💰 +${coinsEarned} monedas | Combo: ${this.gameState.combo}x | Energía: ${this.gameState.energy}`);
    }

    showFloatingText(text, x, y) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.left = (x - 50) + 'px';
        floatingText.style.top = (y - 50) + 'px';
        
        // Color diferente para mensajes especiales
        if (text.includes('SIN ENERGÍA')) {
            floatingText.style.color = '#ff4444';
            floatingText.style.textShadow = '0 0 10px rgba(255, 68, 68, 0.8)';
        } else if (text.includes('+') && parseInt(text.replace('+', '')) > 50) {
            floatingText.style.color = '#00ff88';
            floatingText.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.8)';
        }
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            if (floatingText.parentNode) {
                document.body.removeChild(floatingText);
            }
        }, 1000);
    }

    animatePanda() {
        const panda = document.getElementById('panda');
        
        // Animación de escala
        panda.style.transform = 'scale(0.9)';
        
        // Efecto de brillo en combo alto
        if (this.gameState.combo >= 10) {
            panda.style.boxShadow = 
                '0 0 80px rgba(255, 215, 0, 0.8), inset 0 0 60px rgba(0, 0, 0, 0.1)';
        }
        
        setTimeout(() => {
            panda.style.transform = 'scale(1)';
            if (this.gameState.combo < 10) {
                panda.style.boxShadow = 
                    '0 0 60px rgba(255, 215, 0, 0.6), inset 0 0 60px rgba(0, 0, 0, 0.1)';
            }
        }, 100);
    }

    showCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        comboDisplay.textContent = `COMBO x${this.gameState.combo}!`;
        comboDisplay.style.display = 'block';
        
        // Cambiar color basado en el nivel de combo
        if (this.gameState.combo >= 20) {
            comboDisplay.style.background = 'linear-gradient(135deg, #ff00ff, #ff0080)';
        } else if (this.gameState.combo >= 15) {
            comboDisplay.style.background = 'linear-gradient(135deg, #00ffff, #0080ff)';
        } else if (this.gameState.combo >= 10) {
            comboDisplay.style.background = 'linear-gradient(135deg, #ffff00, #ff8000)';
        }
        
        setTimeout(() => {
            comboDisplay.style.display = 'none';
        }, 1000);
    }

    updateDisplay() {
        // Actualizar monedas
        document.getElementById('playerCoins').textContent = 
            this.gameState.coins.toLocaleString();
        
        // Actualizar energía
        document.getElementById('energyText').textContent = 
            `${this.gameState.energy}/${this.gameState.maxEnergy}`;
        
        // Actualizar barra de energía
        const energyFill = document.getElementById('energyFill');
        const energyPercent = (this.gameState.energy / this.gameState.maxEnergy) * 100;
        energyFill.style.width = energyPercent + '%';
        
        // Actualizar nivel
        document.getElementById('playerLevel').textContent = this.gameState.level;
        
        // Actualizar multiplicadores
        document.getElementById('skinBoost').querySelector('.boost-value').textContent = 
            this.gameState.skinMultiplier.toFixed(1) + 'x';
        document.getElementById('levelBoost').querySelector('.boost-value').textContent = 
            this.gameState.levelMultiplier.toFixed(1) + 'x';
    }

    switchTab(tabName) {
        console.log(`Cambiando a tab: ${tabName}`);
        
        // Actualizar tabs activos
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Aquí cargaríamos el contenido del tab
        // Por ahora solo mostramos un mensaje
        this.showFloatingText(`${tabName.toUpperCase()} pronto!`, 
            window.innerWidth / 2, window.innerHeight / 2);
    }

    showDailyReward() {
        this.showFloatingText('🎁 Recompensa Diaria Pronto!', 
            window.innerWidth / 2, window.innerHeight / 2);
    }
}

// ===== SISTEMA DE ENERGÍA =====
class EnergySystem {
    constructor(game) {
        this.game = game;
        this.rechargeInterval = null;
    }

    start() {
        // Recargar energía cada segundo
        this.rechargeInterval = setInterval(() => {
            if (this.game.gameState.energy < this.game.gameState.maxEnergy) {
                this.game.gameState.energy += 1;
                this.game.updateDisplay();
            }
        }, 1000);
    }

    stop() {
        if (this.rechargeInterval) {
            clearInterval(this.rechargeInterval);
        }
    }
}

// ===== SISTEMA DE COMBO =====
class ComboSystem {
    constructor(game) {
        this.game = game;
        this.comboTimeout = null;
    }

    resetCombo() {
        this.game.gameState.combo = 0;
        this.game.updateDisplay();
    }
}

// ===== SISTEMA DE EFECTOS VISUALES =====
class EffectSystem {
    constructor(game) {
        this.game = game;
    }

    flashScreen() {
        const flash = document.createElement('div');
        flash.className = 'flash-overlay';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                document.body.removeChild(flash);
            }
        }, 300);
    }

    createConfetti() {
        // Confetti épico con múltiples emojis
        const emojis = ['🎉', '💰', '⭐', '🔥', '💎', '🚀', '👑', '💯'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                this.game.showFloatingText(
                    randomEmoji,
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight
                );
            }, i * 50);
        }
    }

    createEpicExplosion(x, y) {
        // Efecto de explosión épica para combos altos
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.game.showFloatingText('💥', x, y);
            }, i * 100);
        }
    }
}

// ===== INICIALIZACIÓN DEL JUEGO =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el juego épico
    window.cryptoPandaGame = new CryptoPandaGame();
    
    // Integración con Telegram Web App
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        console.log('✅ Integrado con Telegram Web App');
    }
    
    console.log('🎮 Crypto Panda Épico completamente inicializado!');
});
