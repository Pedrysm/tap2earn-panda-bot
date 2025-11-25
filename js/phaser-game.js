// phaser-game.js - VERSIÓN CORREGIDA PARA SUPABASE

class PandaGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PandaGameScene' });
        this.supabaseService = null;
        this.gameManager = null;
        this.userData = null;
        this.userStats = null;
    }

    preload() {
        console.log('🔄 Precargando assets...');
        
        // Cargar placeholder básico
        this.createPlaceholderTexture('panda-placeholder', 0x6bcf7f);
        
        // Las skins reales se cargarán dinámicamente desde Supabase
        this.loadDefaultSkins();
        
        // Efectos básicos
        this.load.image('coin', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiNGRkQ5M0QiIHN0cm9rZT0iI0ZGRjIzMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjE2IiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5KpPC90ZXh0Pgo8L3N2Zz4K');
        this.load.image('sparkle', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjQiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOCIvPgo8L3N2Zz4K');
    }

    async create() {
        console.log('🎮 Creando escena del juego...');
        
        // Inicializar servicios
        await this.initializeServices();
        
        // Cargar datos del usuario desde Supabase
        await this.loadUserData();
        
        // Configurar sistemas del juego
        this.setupGameSystems();
        
        console.log('✅ Escena del juego creada exitosamente');
    }

    createPlaceholderTexture(key, color = 0xFFFFFF) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0, 50);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-15, -10, 8);
        graphics.fillCircle(15, -10, 8);
        graphics.generateTexture(key, 100, 100);
        graphics.destroy();
    }

    loadDefaultSkins() {
        const defaultSkins = {
            'panda-basico': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-basico.png',
            'panda-clasico': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-clasico.png'
        };

        Object.entries(defaultSkins).forEach(([key, url]) => {
            this.load.image(key, url);
        });
    }

    async initializeServices() {
        this.supabaseService = window.supabaseService;
        this.gameManager = window.gameManager;
        
        if (!this.supabaseService || !this.gameManager) {
            console.error('❌ Servicios no inicializados');
            throw new Error('GameManager o SupabaseService no disponibles');
        }
        
        console.log('✅ Servicios de juego inicializados');
    }

    async loadUserData() {
        try {
            // Obtener datos del usuario actual
            this.userData = window.currentUser;
            if (!this.userData) {
                throw new Error('No hay usuario autenticado');
            }

            // Cargar estadísticas del usuario
            const { data: stats, error } = await this.supabaseService.getUserStats(this.userData.id);
            if (error) throw error;
            
            this.userStats = stats;
            
            // Cargar skins del usuario
            await this.loadUserSkins();
            
            console.log('✅ Datos de usuario cargados:', this.userStats);
            
        } catch (error) {
            console.error('❌ Error cargando datos del usuario:', error);
            throw error;
        }
    }

    async loadUserSkins() {
        try {
            const { data: userSkins, error } = await this.supabaseService.getUserSkins(this.userData.id);
            if (error) throw error;

            // Cargar texturas de las skins del usuario
            if (userSkins && userSkins.length > 0) {
                for (const userSkin of userSkins) {
                    const skinData = userSkin.panda_skins;
                    if (skinData && skinData.image_url) {
                        // Cargar skin dinámicamente si no existe
                        if (!this.textures.exists(skinData.name)) {
                            this.load.image(skinData.name, skinData.image_url);
                        }
                    }
                }
                
                // Esperar a que carguen las texturas
                this.load.once('complete', () => {
                    console.log('✅ Skins del usuario cargadas');
                });
                this.load.start();
            }
            
        } catch (error) {
            console.error('❌ Error cargando skins del usuario:', error);
        }
    }

    setupGameSystems() {
        // Crear elementos del juego
        this.createAnimatedBackground();
        this.createPanda();
        this.createParticleSystems();
        
        // Sistema de combo
        this.comboTimer = null;
        this.comboTimeout = 2000;
        this.currentCombo = 0;
        
        // Actualizar UI inicial
        this.updateGameUI();
        
        // Sistema de energía (usando el de GameManager)
        console.log('✅ Sistemas del juego configurados');
    }

    createAnimatedBackground() {
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
    }

    createPanda() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Determinar skin actual del usuario
        let currentSkin = this.userStats?.current_skin || 'panda-basico';
        
        // Verificar si la skin existe, sino usar placeholder
        if (!this.textures.exists(currentSkin)) {
            currentSkin = 'panda-placeholder';
            console.warn(`Skin ${this.userStats?.current_skin} no disponible, usando placeholder`);
        }
        
        // Crear panda
        this.panda = this.add.image(centerX, centerY, currentSkin)
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
    }

    async handleTap(pointer) {
        // Verificar energía
        if (this.userStats.energy <= 0) {
            this.showEnergyWarning();
            return;
        }
        
        try {
            // Calcular recompensa con multiplicadores
            const baseReward = 1;
            const tapPower = this.userStats.tap_power || 1.0;
            const coinsEarned = Math.floor(baseReward * tapPower);
            const expEarned = 1;
            
            // Actualizar stats locales
            this.userStats.energy -= 1;
            this.userStats.total_taps += 1;
            this.userStats.coins += coinsEarned;
            this.userStats.experience += expEarned;
            
            // Manejar combo
            this.handleCombo();
            
            // Efectos visuales
            this.createTapEffects(pointer.x, pointer.y, coinsEarned);
            this.animatePandaTap();
            
            // Sincronizar con Supabase
            await this.syncTapToSupabase();
            
            // Verificar logros y nivel
            await this.checkAchievements();
            await this.checkLevelUp();
            
            // Actualizar UI
            this.updateGameUI();
            
        } catch (error) {
            console.error('❌ Error en handleTap:', error);
        }
    }

    async syncTapToSupabase() {
        if (!this.supabaseService || !this.userData) {
            console.error('No se puede sincronizar: servicios no disponibles');
            return;
        }

        try {
            const updates = {
                total_taps: this.userStats.total_taps,
                coins: this.userStats.coins,
                energy: this.userStats.energy,
                experience: this.userStats.experience,
                last_energy_update: new Date().toISOString()
            };

            const { error } = await this.supabaseService.updateUserStats(this.userData.id, updates);
            if (error) throw error;
            
            console.log('✅ Tap sincronizado con Supabase');
        } catch (error) {
            console.error('❌ Error sincronizando tap:', error);
        }
    }

    handleCombo() {
        this.currentCombo += 1;
        
        // Reiniciar timer de combo
        if (this.comboTimer) {
            this.comboTimer.remove();
        }
        
        this.comboTimer = this.time.delayedCall(this.comboTimeout, () => {
            this.currentCombo = 0;
            this.updateGameUI();
        });
        
        // Actualizar max combo si es necesario
        if (this.currentCombo > this.userStats.max_combo) {
            this.userStats.max_combo = this.currentCombo;
        }
        
        // Bonus cada 10 combos
        if (this.currentCombo % 10 === 0) {
            this.createComboBonus();
        }
    }

    createTapEffects(x, y, coinsEarned) {
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
    }

    animatePandaTap() {
        this.tweens.add({
            targets: this.panda,
            scaleX: 0.65,
            scaleY: 0.65,
            duration: 80,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    createComboBonus() {
        const centerX = this.cameras.main.centerX;
        
        const comboText = this.add.text(centerX, 200, `COMBO x${this.currentCombo}!`, {
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
    }

    createParticleSystems() {
        this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
            speed: 20,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            frequency: 100
        });
    }

    async checkLevelUp() {
        const expNeeded = this.userStats.level * 100;
        
        if (this.userStats.experience >= expNeeded) {
            // Subir de nivel
            this.userStats.level += 1;
            this.userStats.experience = 0;
            this.userStats.max_energy += 10;
            this.userStats.energy = this.userStats.max_energy;
            
            // Guardar en Supabase
            await this.supabaseService.updateUserStats(this.userData.id, {
                level: this.userStats.level,
                experience: this.userStats.experience,
                max_energy: this.userStats.max_energy,
                energy: this.userStats.energy
            });
            
            this.showLevelUpEffect();
        }
    }

    showLevelUpEffect() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        const levelUpText = this.add.text(centerX, centerY - 50, `¡NIVEL ${this.userStats.level}!`, {
            fontSize: '48px',
            fill: '#00FF00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        if (this.sparkleEmitter) {
            this.sparkleEmitter.explode(50, centerX, centerY);
        }
        
        this.tweens.add({
            targets: levelUpText,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 2000,
            onComplete: () => levelUpText.destroy()
        });
    }

    async checkAchievements() {
        // Aquí implementarías la lógica para verificar logros
        // basado en this.userStats y this.currentCombo
        // Por ahora es un placeholder
        console.log('🔍 Verificando logros...');
    }

    showEnergyWarning() {
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
    }

    updateGameUI() {
        if (!this.userStats) return;

        const elements = {
            'energy-text': `${this.userStats.energy}/${this.userStats.max_energy || 100}`,
            'coins-text': Math.floor(this.userStats.coins || 0),
            'gems-text': this.userStats.gems || 0,
            'level-text': `Nvl ${this.userStats.level || 1}`,
            'multiplier-text': `${this.userStats.tap_power || 1.0}x`,
            'combo-text': this.currentCombo,
            'total-taps': this.userStats.total_taps || 0,
            'exp-text': `${this.userStats.experience || 0}/${(this.userStats.level || 1) * 100}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    update() {
        // Animaciones sutiles
        if (this.panda) {
            this.panda.rotation += 0.001;
        }
    }
}

// =============================================
// INICIALIZACIÓN GLOBAL DEL JUEGO
// =============================================

window.initPhaserGame = () => {
    if (typeof Phaser === 'undefined') {
        console.error('❌ Phaser no está cargado');
        return;
    }

    console.log('🎯 Iniciando Crypto Panda Game con Supabase...');

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight - 150,
        parent: 'panda-container',
        backgroundColor: '#0b0b0f',
        scene: PandaGameScene
    };

    try {
        const game = new Phaser.Game(config);
        console.log('✅ Juego Phaser creado exitosamente');
        return game;
    } catch (error) {
        console.error('❌ Error crítico al crear juego Phaser:', error);
    }
};
