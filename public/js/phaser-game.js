// Sistema de imágenes con fallbacks robustos
const SKIN_URLS = {
    'panda-clasico': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-clasico.png',
    'panda-dorado': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-dorado.png',
    'panda-hielo': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-hielo.png',
    'panda-fuego': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-fuego.png',
    'panda-electrico': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-electrico.png'
};

// Crear placeholders programáticamente
function createPlaceholderTexture(scene, key, color = 0xFFFFFF) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 50);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(-15, -10, 8);
    graphics.fillCircle(15, -10, 8);
    graphics.generateTexture(key, 100, 100);
    graphics.destroy();
}

window.initPhaserGame = () => {
    if (typeof Phaser === 'undefined') {
        console.error('Phaser no está cargado. Recargando...');
        // Intentar cargar Phaser dinámicamente
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
        script.onload = () => {
            console.log('Phaser cargado dinámicamente, reiniciando juego...');
            setTimeout(() => window.initPhaserGame(), 1000);
        };
        document.head.appendChild(script);
        return;
    }

    console.log('Iniciando Crypto Panda Game...');

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight - 150,
        parent: 'panda-container',
        backgroundColor: '#0b0b0f',
        scene: {
            preload() {
                console.log('Precargando assets...');
                
                // Crear placeholder básico primero
                createPlaceholderTexture(this, 'panda-placeholder', 0x6bcf7f);
                
                // Intentar cargar skins con timeout
                Object.entries(SKIN_URLS).forEach(([key, url]) => {
                    this.load.image(key, url);
                });
                
                // Cargar placeholders para efectos
                this.load.image('coin', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNGRkQ5M0QiIHN0cm9rZT0iI0ZGRjIzMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjE2IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5KpPC90ZXh0Pgo8L3N2Zz4K');
                this.load.image('sparkle', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjQiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4K');
            },
            
            create() {
                console.log('Creando escena del juego...');
                
                // Verificar qué texturas se cargaron correctamente
                const loadedTextures = [];
                const failedTextures = [];
                
                Object.keys(SKIN_URLS).forEach(key => {
                    if (this.textures.exists(key)) {
                        loadedTextures.push(key);
                    } else {
                        failedTextures.push(key);
                        console.warn(`Texture ${key} no se pudo cargar, usando placeholder`);
                    }
                });
                
                console.log(`Texturas cargadas: ${loadedTextures.length}, Fallidas: ${failedTextures.length}`);
                
                // Inicializar estado del juego si no existe
                window.gameState = window.gameState || {
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
                    currentSkin: 'panda-placeholder',
                    skins: ['panda-placeholder'],
                    achievements: [],
                    clan: null,
                    activeCards: []
                };
                
                // Crear fondo animado
                this.createAnimatedBackground();
                
                // Crear panda (usará placeholder si es necesario)
                this.createPanda();
                
                // Sistema de partículas
                this.createParticleSystems();
                
                // Sistema de combo
                this.comboTimer = null;
                this.comboTimeout = 2000;
                
                // Actualizar UI
                this.updateGameUI();
                
                // Regenerar energía
                this.energyRegenTimer = this.time.addEvent({
                    delay: 1000,
                    callback: this.regenerateEnergy,
                    callbackScope: this,
                    loop: true
                });
                
                console.log('Escena del juego creada exitosamente');
            },
            
            update() {
                // Animaciones sutiles
                if (this.panda && this.panda.preFX) {
                    this.panda.rotation += 0.001;
                }
            }
        }
    };

    try {
        const game = new Phaser.Game(config);
        console.log('Juego Phaser creado:', game);
        return game;
    } catch (error) {
        console.error('Error crítico al crear juego Phaser:', error);
        // Intentar recuperación
        setTimeout(() => {
            console.log('Reintentando crear juego...');
            window.initPhaserGame();
        }, 2000);
    }
};

// ========== SISTEMA DEL JUEGO ==========

// Crear fondo animado
Phaser.Scene.prototype.createAnimatedBackground = function() {
    // Fondo de estrellas
    for (let i = 0; i < 30; i++) {
        const star = this.add.circle(
            Phaser.Math.Between(0, this.cameras.main.width),
            Phaser.Math.Between(0, this.cameras.main.height),
            Phaser.Math.FloatBetween(0.5, 1.5),
            0xFFFFFF,
            Phaser.Math.FloatBetween(0.3, 0.7)
        );
        
        this.tweens.add({
            targets: star,
            alpha: { from: 0.3, to: 0.7 },
            duration: Phaser.Math.Between(1000, 3000),
            yoyo: true,
            repeat: -1
        });
    }
};

// Crear panda con fallback
Phaser.Scene.prototype.createPanda = function() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Determinar qué skin usar
    let skinToUse = window.gameState.currentSkin;
    if (!this.textures.exists(skinToUse)) {
        skinToUse = 'panda-placeholder';
        console.warn(`Skin ${window.gameState.currentSkin} no disponible, usando placeholder`);
    }
    
    // Crear panda
    this.panda = this.add.image(centerX, centerY, skinToUse)
        .setScale(0.6)
        .setInteractive({ useHandCursor: true });
    
    // Efecto de glow
    const glow = this.add.circle(centerX, centerY, 180, 0xFFFFFF, 0.1);
    this.tweens.add({
        targets: glow,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 1500,
        yoyo: true,
        repeat: -1
    });
    
    // Evento de TAP
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
        fontFamily: 'Arial'
    }).setOrigin(0.5);
};

// Manejar tap (mantener la misma lógica robusta)
Phaser.Scene.prototype.handleTap = function(pointer) {
    if (window.gameState.energy <= 0) {
        this.showEnergyWarning();
        return;
    }
    
    const baseReward = 1;
    const coinsEarned = Math.floor(baseReward * window.gameState.currentMultiplier);
    const expEarned = 1;
    
    window.gameState.energy -= 1;
    window.gameState.totalTaps += 1;
    window.gameState.coins += coinsEarned;
    window.gameState.experience += expEarned;
    
    this.handleCombo();
    this.createTapEffects(pointer.x, pointer.y, coinsEarned);
    this.animatePandaTap();
    this.checkAchievements();
    this.checkLevelUp();
    this.updateGameUI();
};

// Sistema de combo
Phaser.Scene.prototype.handleCombo = function() {
    window.gameState.combo += 1;
    
    if (this.comboTimer) {
        this.comboTimer.remove();
    }
    
    this.comboTimer = this.time.delayedCall(this.comboTimeout, () => {
        window.gameState.combo = 0;
        this.updateGameUI();
    });
    
    if (window.gameState.combo > window.gameState.maxCombo) {
        window.gameState.maxCombo = window.gameState.combo;
    }
    
    if (window.gameState.combo % 10 === 0) {
        this.createComboBonus();
    }
};

// Efectos de tap
Phaser.Scene.prototype.createTapEffects = function(x, y, coinsEarned) {
    // Efecto de onda
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
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: rewardText,
        y: y - 100,
        alpha: 0,
        duration: 1000,
        onComplete: () => rewardText.destroy()
    });
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
        fontFamily: 'Arial'
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
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
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
    
    if (window.gameState.totalTaps >= 10 && !window.gameState.achievements.includes('primeros_10_taps')) {
        newAchievements.push('primeros_10_taps');
    }
    
    if (window.gameState.combo >= 10 && !window.gameState.achievements.includes('combo_10')) {
        newAchievements.push('combo_10');
    }
    
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
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: achievementText,
        y: 150,
        alpha: 0,
        duration: 3000,
        onComplete: () => achievementText.destroy()
    });
};

// Advertencia de energía
Phaser.Scene.prototype.showEnergyWarning = function() {
    const centerX = this.cameras.main.centerX;
    
    const warningText = this.add.text(centerX, 100, '⚡ Energía agotada!', {
        fontSize: '24px',
        fill: '#FF5555',
        fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.tweens.add({
        targets: warningText,
        alpha: 0,
        duration: 2000,
        onComplete: () => warningText.destroy()
    });
};

// Actualizar UI
Phaser.Scene.prototype.updateGameUI = function() {
    const elements = {
        'energy-text': `${window.gameState.energy}/${window.gameState.maxEnergy}`,
        'coins-text': window.gameState.coins,
        'gems-text': window.gameState.gems,
        'level-text': `Nvl ${window.gameState.level}`,
        'multiplier-text': `${window.gameState.currentMultiplier}x`,
        'combo-text': window.gameState.combo,
        'total-taps': window.gameState.totalTaps,
        'exp-text': `${window.gameState.experience}/${window.gameState.level * 100}`
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
};
