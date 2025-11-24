// Configuración de Supabase
const SUPABASE_URL = 'https://vrbxeerfvoaukcopydpt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjU2MTksImV4cCI6MjAzNzUwMTYxOX0.7M7Hce-E1pXr_ldc6dMMT2rJp5jWY6kU-2jQ5q1x1kE';

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.gameState = {
    coins: 0,
    gems: 0,
    level: 1,
    experience: 0,
    energy: 100,
    maxEnergy: 100,
    totalTaps: 0,
    currentMultiplier: 1.0,
    combo: 0,
    maxCombo: 0,
    currentSkin: 'panda-clasico',
    skins: ['panda-clasico'],
    achievements: [],
    clan: null,
    activeCards: []
};

window.initPhaserGame = () => {
    if (typeof Phaser === 'undefined') {
        console.error('Phaser no está cargado');
        return;
    }

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight - 150, // Ajustar para la UI
        parent: 'panda-container',
        backgroundColor: '#0b0b0f',
        scene: {
            preload() {
                console.log('Cargando assets del juego...');
                
                // Cargar skins desde Supabase
                this.load.image('panda-clasico', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-clasico.png');
                this.load.image('panda-dorado', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-dorado.png');
                this.load.image('panda-hielo', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-hielo.png');
                this.load.image('panda-fuego', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-fuego.png');
                this.load.image('panda-electrico', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-electrico.png');
                
                // Efectos de partículas
                this.load.image('coin', 'https://placehold.co/32x32/FFD700/000000/png?text=🪙');
                this.load.image('sparkle', 'https://placehold.co/16x16/FFFFFF/000000/png?text=✨');
            },
            
            create() {
                console.log('Iniciando juego Crypto Panda...');
                
                // Cargar datos del jugador
                this.loadPlayerData();
                
                // Crear fondo animado
                this.createAnimatedBackground();
                
                // Crear panda interactivo
                this.createPanda();
                
                // Sistema de partículas
                this.createParticleSystems();
                
                // Sistema de combo
                this.comboTimer = null;
                this.comboTimeout = 2000; // 2 segundos para mantener combo
                
                // Actualizar UI
                this.updateGameUI();
                
                // Regenerar energía cada segundo
                this.energyRegenTimer = this.time.addEvent({
                    delay: 1000,
                    callback: this.regenerateEnergy,
                    callbackScope: this,
                    loop: true
                });
                
                console.log('Juego Crypto Panda iniciado correctamente');
            },
            
            update() {
                // Animaciones continuas
                if (this.panda) {
                    this.panda.rotation += 0.001; // Rotación sutil
                }
            }
        }
    };

    try {
        const game = new Phaser.Game(config);
        console.log('Phaser Game instanciado:', game);
        return game;
    } catch (error) {
        console.error('Error al crear juego Phaser:', error);
    }
};

// ========== SISTEMA DEL JUEGO ==========

// Cargar datos del jugador desde Supabase
Phaser.Scene.prototype.loadPlayerData = async function() {
    try {
        console.log('Cargando datos del jugador...');
        
        // Por ahora simulamos datos, luego conectarás con tu base de datos
        const mockData = {
            coins: 1500,
            gems: 5,
            level: 3,
            experience: 75,
            energy: 85,
            maxEnergy: 120,
            totalTaps: 342,
            currentMultiplier: 1.2,
            combo: 0,
            maxCombo: 15,
            currentSkin: 'panda-clasico',
            skins: ['panda-clasico', 'panda-dorado'],
            achievements: ['primeros_10_taps', 'nivel_3_alcanzado'],
            clan: null,
            activeCards: []
        };
        
        Object.assign(window.gameState, mockData);
        this.updateGameUI();
        
    } catch (error) {
        console.error('Error cargando datos del jugador:', error);
    }
};

// Crear fondo animado
Phaser.Scene.prototype.createAnimatedBackground = function() {
    // Fondo con estrellas animadas
    for (let i = 0; i < 50; i++) {
        const star = this.add.circle(
            Phaser.Math.Between(0, this.cameras.main.width),
            Phaser.Math.Between(0, this.cameras.main.height),
            Phaser.Math.FloatBetween(0.5, 2),
            0xFFFFFF,
            Phaser.Math.FloatBetween(0.3, 0.8)
        );
        
        // Animación de parpadeo
        this.tweens.add({
            targets: star,
            alpha: { from: 0.3, to: 0.8 },
            duration: Phaser.Math.Between(1000, 3000),
            yoyo: true,
            repeat: -1
        });
    }
};

// Crear panda interactivo principal
Phaser.Scene.prototype.createPanda = function() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Crear panda con la skin actual
    this.panda = this.add.image(centerX, centerY, window.gameState.currentSkin)
        .setScale(0.6)
        .setInteractive({ useHandCursor: true });
    
    // Efecto de brillo alrededor del panda
    const glow = this.add.circle(centerX, centerY, 180, 0xFFFFFF, 0.1);
    this.tweens.add({
        targets: glow,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1500,
        yoyo: true,
        repeat: -1
    });
    
    // ¡EVENTO DE TAP PRINCIPAL!
    this.panda.on('pointerdown', (pointer) => {
        this.handleTap(pointer);
    });
    
    // Efectos hover
    this.panda.on('pointerover', () => {
        this.panda.setTint(0xDDDDFF);
        this.panda.setScale(0.62);
    });
    
    this.panda.on('pointerout', () => {
        this.panda.clearTint();
        this.panda.setScale(0.6);
    });
    
    // Texto de instrucción
    this.add.text(centerX, centerY + 150, '¡TOCA AL PANDA PARA GANAR!', {
        fontSize: '20px',
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
};

// Manejar el evento de tap
Phaser.Scene.prototype.handleTap = function(pointer) {
    if (window.gameState.energy <= 0) {
        this.showEnergyWarning();
        return;
    }
    
    // Calcular recompensa
    const baseReward = 1;
    const coinsEarned = Math.floor(baseReward * window.gameState.currentMultiplier);
    const expEarned = 1;
    
    // Actualizar estado del juego
    window.gameState.energy -= 1;
    window.gameState.totalTaps += 1;
    window.gameState.coins += coinsEarned;
    window.gameState.experience += expEarned;
    
    // Manejar combo
    this.handleCombo();
    
    // Efectos visuales
    this.createTapEffects(pointer.x, pointer.y, coinsEarned);
    this.animatePandaTap();
    
    // Verificar logros
    this.checkAchievements();
    
    // Verificar subida de nivel
    this.checkLevelUp();
    
    // Actualizar UI
    this.updateGameUI();
    
    // Guardar progreso (cada 10 taps)
    if (window.gameState.totalTaps % 10 === 0) {
        this.saveGameProgress();
    }
};

// Sistema de combo
Phaser.Scene.prototype.handleCombo = function() {
    window.gameState.combo += 1;
    
    // Reiniciar timer de combo
    if (this.comboTimer) {
        this.comboTimer.remove();
    }
    
    this.comboTimer = this.time.delayedCall(this.comboTimeout, () => {
        window.gameState.combo = 0;
        this.updateGameUI();
    });
    
    // Actualizar máximo combo
    if (window.gameState.combo > window.gameState.maxCombo) {
        window.gameState.maxCombo = window.gameState.combo;
    }
    
    // Bonus por combo
    if (window.gameState.combo % 10 === 0) {
        this.createComboBonus();
    }
};

// Efectos visuales del tap
Phaser.Scene.prototype.createTapEffects = function(x, y, coinsEarned) {
    // Efecto de ondas concéntricas
    const circle = this.add.circle(x, y, 10, 0xFFFFFF, 0.5);
    this.tweens.add({
        targets: circle,
        radius: 100,
        alpha: 0,
        duration: 500,
        onComplete: () => circle.destroy()
    });
    
    // Texto de recompensa
    const rewardText = this.add.text(x, y - 30, `+${coinsEarned} 🪙`, {
        fontSize: '24px',
        fill: '#FFD700',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: rewardText,
        y: y - 100,
        alpha: 0,
        duration: 1000,
        onComplete: () => rewardText.destroy()
    });
    
    // Partículas de coins
    for (let i = 0; i < 3; i++) {
        const coin = this.add.image(x, y, 'coin');
        this.tweens.add({
            targets: coin,
            x: x + Phaser.Math.Between(-50, 50),
            y: y - Phaser.Math.Between(50, 100),
            alpha: 0,
            rotation: Phaser.Math.Between(0, 6),
            duration: 800,
            onComplete: () => coin.destroy()
        });
    }
};

// Animación del panda al hacer tap
Phaser.Scene.prototype.animatePandaTap = function() {
    this.tweens.add({
        targets: this.panda,
        scaleX: 0.65,
        scaleY: 0.65,
        duration: 80,
        yoyo: true,
        ease: 'Back.easeOut'
    });
};

// Bonus por combo
Phaser.Scene.prototype.createComboBonus = function() {
    const centerX = this.cameras.main.centerX;
    
    const comboText = this.add.text(centerX, 200, `COMBO x${window.gameState.combo}!`, {
        fontSize: '32px',
        fill: '#FF5555',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: comboText,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 1000,
        onComplete: () => comboText.destroy()
    });
};

// Sistema de partículas
Phaser.Scene.prototype.createParticleSystems = function() {
    // Sistema de partículas para efectos especiales
    this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
        speed: 20,
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 1000,
        frequency: 100
    });
};

// Regenerar energía
Phaser.Scene.prototype.regenerateEnergy = function() {
    if (window.gameState.energy < window.gameState.maxEnergy) {
        window.gameState.energy += 1;
        this.updateGameUI();
    }
};

// Verificar subida de nivel
Phaser.Scene.prototype.checkLevelUp = function() {
    const expNeeded = window.gameState.level * 100;
    
    if (window.gameState.experience >= expNeeded) {
        window.gameState.level += 1;
        window.gameState.experience = 0;
        window.gameState.maxEnergy += 10;
        window.gameState.energy = window.gameState.maxEnergy;
        
        this.showLevelUpEffect();
    }
};

// Efecto de subida de nivel
Phaser.Scene.prototype.showLevelUpEffect = function() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    const levelUpText = this.add.text(centerX, centerY - 50, `¡NIVEL ${window.gameState.level}!`, {
        fontSize: '48px',
        fill: '#00FF00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5);
    
    // Efecto de explosión de partículas
    this.sparkleEmitter.explode(50, centerX, centerY);
    
    this.tweens.add({
        targets: levelUpText,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 2000,
        onComplete: () => levelUpText.destroy()
    });
};

// Verificar logros
Phaser.Scene.prototype.checkAchievements = function() {
    const newAchievements = [];
    
    // Logro: Primeros 10 taps
    if (window.gameState.totalTaps >= 10 && !window.gameState.achievements.includes('primeros_10_taps')) {
        newAchievements.push('primeros_10_taps');
    }
    
    // Logro: Combo de 10
    if (window.gameState.combo >= 10 && !window.gameState.achievements.includes('combo_10')) {
        newAchievements.push('combo_10');
    }
    
    // Añadir nuevos logros
    newAchievements.forEach(achievement => {
        window.gameState.achievements.push(achievement);
        this.showAchievementUnlocked(achievement);
    });
};

// Mostrar logro desbloqueado
Phaser.Scene.prototype.showAchievementUnlocked = function(achievement) {
    const centerX = this.cameras.main.centerX;
    
    const achievementText = this.add.text(centerX, 100, `🏆 Logro Desbloqueado!`, {
        fontSize: '24px',
        fill: '#FFD700',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: achievementText,
        y: 150,
        alpha: 0,
        duration: 3000,
        onComplete: () => achievementText.destroy()
    });
};

// Advertencia de energía agotada
Phaser.Scene.prototype.showEnergyWarning = function() {
    const centerX = this.cameras.main.centerX;
    
    const warningText = this.add.text(centerX, 100, '⚡ Energía agotada!', {
        fontSize: '24px',
        fill: '#FF5555',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: warningText,
        alpha: 0,
        duration: 2000,
        onComplete: () => warningText.destroy()
    });
};

// Actualizar interfaz de usuario
Phaser.Scene.prototype.updateGameUI = function() {
    // Actualizar textos en la UI HTML
    if (document.getElementById('energy-text')) {
        document.getElementById('energy-text').textContent = 
            `${window.gameState.energy}/${window.gameState.maxEnergy}`;
    }
    if (document.getElementById('coins-text')) {
        document.getElementById('coins-text').textContent = window.gameState.coins;
    }
    if (document.getElementById('gems-text')) {
        document.getElementById('gems-text').textContent = window.gameState.gems;
    }
    if (document.getElementById('level-text')) {
        document.getElementById('level-text').textContent = `Nvl ${window.gameState.level}`;
    }
    if (document.getElementById('multiplier-text')) {
        document.getElementById('multiplier-text').textContent = `${window.gameState.currentMultiplier}x`;
    }
    if (document.getElementById('combo-text')) {
        document.getElementById('combo-text').textContent = window.gameState.combo;
    }
    if (document.getElementById('total-taps')) {
        document.getElementById('total-taps').textContent = window.gameState.totalTaps;
    }
    if (document.getElementById('exp-text')) {
        document.getElementById('exp-text').textContent = 
            `${window.gameState.experience}/${window.gameState.level * 100}`;
    }
};

// Guardar progreso en Supabase
Phaser.Scene.prototype.saveGameProgress = async function() {
    try {
        console.log('Guardando progreso del juego...');
        // Aquí implementarás la conexión con tu base de datos Supabase
        // usando window.supabase
    } catch (error) {
        console.error('Error guardando progreso:', error);
    }
};
