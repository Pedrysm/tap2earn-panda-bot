// phaser-game.js - ARCHIVO ÚNICO CON TUTORIAL Y JUEGO

// =============================================
// TUTORIAL SCENE - Integrada en el mismo archivo
// =============================================
class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }

    init(data) {
        this.userId = data.userId;
        this.onTutorialComplete = data.onTutorialComplete;
        this.supabaseService = data.supabaseService;
        this.tutorialCompleted = false;
    }

    async create() {
        const { width, height } = this.cameras.main;

        // Fondo semitransparente
        this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
        
        // Crear texturas básicas
        this.createBasicTextures();

        // Partículas de fondo
        this.createBackgroundParticles();

        // Panel principal
        const panel = this.add.container(width / 2, height / 2);
        
        // Fondo del panel
        const panelBg = this.add.rectangle(0, 0, 360, 450, 0x1a1a2e)
            .setStrokeStyle(3, 0x4a4a8a);
        
        // Efecto de brillo interior
        const innerGlow = this.add.rectangle(0, 0, 354, 444, 0x2a2a4a, 0.3)
            .setStrokeStyle(1, 0x6a6aaa);

        panel.add([panelBg, innerGlow]);

        // Header del panel
        const header = this.add.rectangle(0, -190, 360, 60, 0x151525)
            .setStrokeStyle(2, 0x3a3a6a);
        panel.add(header);

        // Icono de bienvenida
        const welcomeIcon = this.add.text(-150, -190, '👋', { 
            fontSize: '32px' 
        }).setOrigin(0.5);
        panel.add(welcomeIcon);

        // Título
        const title = this.add.text(0, -190, '¡Bienvenido!', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        panel.add(title);

        // Imagen del panda central
        let pandaDisplay;
        if (this.textures.exists('panda-basico')) {
            pandaDisplay = this.add.image(0, -100, 'panda-basico').setScale(0.35);
        } else {
            pandaDisplay = this.add.circle(0, -100, 45, 0x4CAF50);
            this.add.text(0, -100, '🐼', { fontSize: '40px' }).setOrigin(0.5);
        }
        panel.add(pandaDisplay);

        // Animación de latido del panda
        this.tweens.add({
            targets: pandaDisplay,
            scale: 0.38,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Lista de instrucciones
        const instructions = [
            { icon: '👆', text: 'Toca al panda para ganar monedas' },
            { icon: '⚡', text: 'Gasta energía con cada tap' },
            { icon: '🏆', text: 'Completa misiones y logros' },
            { icon: '🔄', text: 'La energía se recupera con el tiempo' },
            { icon: '🎨', text: 'Compra skins en la tienda' }
        ];

        // Contenedor de instrucciones
        const instructionsContainer = this.add.container(0, 20);
        panel.add(instructionsContainer);

        // Crear cada línea de instrucción
        instructions.forEach((item, index) => {
            const yPos = index * 40;
            
            const icon = this.add.text(-140, yPos, item.icon, {
                fontSize: '20px'
            }).setOrigin(0.5);
            instructionsContainer.add(icon);

            const text = this.add.text(-110, yPos, item.text, {
                fontSize: '16px',
                fill: '#E0E0E0',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);
            instructionsContainer.add(text);

            this.tweens.add({
                targets: [icon, text],
                alpha: { from: 0, to: 1 },
                x: { from: icon.x - 20, to: icon.x },
                duration: 400,
                delay: index * 100,
                ease: 'Back.easeOut'
            });
        });

        // Botón de acción principal
        const buttonContainer = this.add.container(0, 180);
        panel.add(buttonContainer);

        const buttonBg = this.add.rectangle(0, 0, 200, 50, 0x00C853)
            .setStrokeStyle(2, 0x00E676);
        buttonContainer.add(buttonBg);

        const buttonText = this.add.text(0, 0, '¡Empezar a Jugar!', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        buttonContainer.add(buttonText);

        const buttonGlow = this.add.rectangle(0, 0, 210, 60, 0x00E676, 0.3)
            .setVisible(false);
        buttonContainer.add(buttonGlow);

        buttonBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                buttonBg.setFillStyle(0x00E676);
                buttonGlow.setVisible(true);
                buttonText.setScale(1.05);
            })
            .on('pointerout', () => {
                buttonBg.setFillStyle(0x00C853);
                buttonGlow.setVisible(false);
                buttonText.setScale(1.0);
            })
            .on('pointerdown', async () => {
                await this.handleButtonClick(buttonBg, buttonText, panel);
            });

        this.tweens.add({
            targets: panel,
            scale: { from: 0.8, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 600,
            ease: 'Back.easeOut'
        });
    }

    createBasicTextures() {
        if (!this.textures.exists('sparkle')) {
            const graphics = this.add.graphics();
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(0, 0, 2);
            graphics.generateTexture('sparkle', 4, 4);
            graphics.destroy();
        }
    }

    createBackgroundParticles() {
        this.particles = this.add.particles(0, 0, 'sparkle', {
            x: { min: 0, max: this.cameras.main.width },
            y: { min: 0, max: this.cameras.main.height },
            speed: { min: 10, max: 20 },
            scale: { start: 0.1, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            frequency: 80
        });
    }

    async handleButtonClick(buttonBg, buttonText, panel) {
        if (this.tutorialCompleted) return;
        
        buttonBg.disableInteractive();
        buttonText.setText('🎁 Obteniendo recompensa...');

        this.tweens.add({
            targets: buttonBg,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 200,
            yoyo: true
        });

        try {
            await this.completeTutorial();
            this.tutorialCompleted = true;
            
            buttonText.setText('✅ ¡Listo!');
            buttonBg.setFillStyle(0x4CAF50);
            
            this.createSuccessEffects();
            
            this.time.delayedCall(800, () => {
                this.closeTutorial(panel);
            });
            
        } catch (error) {
            console.error('Error:', error);
            buttonText.setText('❌ Error - Reintentar');
            buttonBg.setFillStyle(0xF44336);
            buttonBg.setInteractive();
        }
    }

    createSuccessEffects() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        if (this.particles) {
            this.particles.explode(30, centerX, centerY);
        }
        
        const successText = this.add.text(centerX, centerY - 200, '🎉 ¡Recompensa Obtenida!', {
            fontSize: '20px',
            fill: '#4CAF50',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: successText,
            alpha: 1,
            y: centerY - 220,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: successText,
            alpha: 0,
            duration: 500,
            delay: 1500,
            ease: 'Power2'
        });
    }

    closeTutorial(panel) {
        this.tweens.add({
            targets: panel,
            scale: 0.8,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                this.scene.stop();
                if (this.onTutorialComplete && !this.tutorialCompleted) {
                    this.onTutorialComplete();
                }
            }
        });
    }

    async completeTutorial() {
        console.log('🎁 Otorgando recompensa de tutorial...');
        
        if (this.supabaseService) {
            const { error } = await this.supabaseService.updateUserStats(this.userId, {
                tutorial_seen: true,
                coins: 100,
                experience: 50,
                energy: 100
            });

            if (error) {
                console.warn('⚠️ No se pudo actualizar tutorial:', error);
            }
        }

        console.log('✅ Tutorial completado');
    }
}

// =============================================
// PANDA GAME SCENE - Juego principal
// =============================================
class PandaGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PandaGameScene' });
        this.supabaseService = null;
        this.gameManager = null;
        this.userData = null;
        this.userStats = null;
        this.telegramUser = null;
        this.tutorialCompleted = false;
    }

    preload() {
        console.log('🔄 Precargando assets...');
        
        // Cargar placeholder básico
        this.createPlaceholderTexture('panda-placeholder', 0x6bcf7f);
        
        // Cargar skins por defecto
        this.loadDefaultSkins();
        
        // Efectos básicos
        this.load.image('coin', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/effects/coin.png');
        this.load.image('sparkle', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/effects/sparkle.png');
    }

    async create() {
        console.log('🎮 Creando escena del juego...');
        
        // VERIFICACIÓN CRÍTICA: Obtener usuario de Telegram
        await this.initializeTelegramUser();
        
        // Inicializar servicios
        await this.initializeServices();
        
        // Cargar datos del usuario desde Supabase
        await this.loadUserData();
        
        console.log('✅ Escena del juego creada exitosamente');
    }

    async initializeTelegramUser() {
        console.log('🔐 Inicializando usuario de Telegram...');
        
        if (window.tg && window.tg.initDataUnsafe && window.tg.initDataUnsafe.user) {
            this.telegramUser = window.tg.initDataUnsafe.user;
            console.log('✅ Usuario de Telegram detectado:', this.telegramUser);
            window.currentUser = this.telegramUser;
        } else {
            console.error('❌ No se pudo obtener usuario de Telegram');
            this.showTelegramError();
            throw new Error('Usuario de Telegram no disponible');
        }
    }

    showTelegramError() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
            'ERROR: No se pudo autenticar con Telegram\n\nPor favor, abre el juego desde @CryptoPandaBot', {
            fontSize: '18px',
            fill: '#ff4444',
            align: 'center',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
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
            'panda-basico': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-basico.webp',
            'panda-clasico': 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-clasico.webp'
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
            console.log('👤 Cargando datos del usuario...');
            this.userData = this.telegramUser;
            
            if (!this.userData || !this.userData.id) {
                throw new Error('No hay usuario autenticado de Telegram');
            }

            console.log('📊 Buscando estadísticas para usuario ID:', this.userData.id);
            
            const { data: stats, error } = await this.supabaseService.getUserStats(this.userData.id);
            
            if (error) {
                console.error('Error al cargar stats:', error);
                await this.createNewUser();
            } else {
                this.userStats = stats;
                console.log('✅ Estadísticas cargadas:', this.userStats);
                
                // VERIFICAR SI NECESITA TUTORIAL
                if (!this.userStats.tutorial_seen) {
                    console.log('🎓 Usuario nuevo - Mostrando tutorial...');
                    this.showTutorial();
                    return;
                } else {
                    console.log('✅ Usuario existente - Saltando tutorial');
                    this.setupGameSystems();
                }
            }
            
            await this.loadUserSkins();
            
        } catch (error) {
            console.error('❌ Error cargando datos del usuario:', error);
            this.showError('Error cargando datos del usuario');
            throw error;
        }
    }

    async createNewUser() {
        console.log('👤 Creando nuevo usuario en Supabase...');
        
        const newUserStats = {
            user_id: this.userData.id,
            username: this.userData.username || `user_${this.userData.id}`,
            first_name: this.userData.first_name || 'Usuario',
            level: 1,
            experience: 0,
            coins: 0,
            gems: 0,
            energy: 100,
            max_energy: 100,
            total_taps: 0,
            tap_power: 1.0,
            max_combo: 0,
            current_skin: 'panda-basico',
            tutorial_seen: false,
            created_at: new Date().toISOString(),
            last_energy_update: new Date().toISOString()
        };

        const { data, error } = await this.supabaseService.createUserStats(newUserStats);
        
        if (error) {
            console.error('❌ Error creando usuario:', error);
            throw error;
        }
        
        this.userStats = data;
        console.log('✅ Nuevo usuario creado:', this.userStats);
        
        // Mostrar tutorial para usuario nuevo
        this.showTutorial();
    }

    showTutorial() {
        console.log('🚀 Lanzando escena de tutorial...');
        this.scene.launch('TutorialScene', {
            userId: this.userData.id,
            supabaseService: this.supabaseService,
            onTutorialComplete: () => {
                console.log('🎉 Tutorial completado - Iniciando juego principal');
                this.tutorialCompleted = true;
                this.userStats.tutorial_seen = true;
                this.setupGameSystems();
            }
        });
    }

    async loadUserSkins() {
        try {
            console.log('🎨 Cargando skins del usuario...');
            const { data: userSkins, error } = await this.supabaseService.getUserSkins(this.userData.id);
            
            if (error) {
                console.warn('⚠ No se pudieron cargar las skins:', error);
                return;
            }

            if (userSkins && userSkins.length > 0) {
                for (const userSkin of userSkins) {
                    const skinData = userSkin.panda_skins;
                    if (skinData && skinData.image_url) {
                        if (!this.textures.exists(skinData.name)) {
                            console.log('📥 Cargando skin:', skinData.name);
                            this.load.image(skinData.name, skinData.image_url);
                        }
                    }
                }
                
                return new Promise((resolve) => {
                    this.load.once('complete', () => {
                        console.log('✅ Todas las skins cargadas');
                        resolve();
                    });
                    this.load.start();
                });
            }
        } catch (error) {
            console.error('❌ Error cargando skins del usuario:', error);
        }
    }

    setupGameSystems() {
        console.log('🎯 Configurando sistemas del juego...');
        
        // Solo configurar si no hay tutorial activo
        if (this.scene.isActive('TutorialScene')) {
            console.log('⏳ Tutorial activo, esperando a que termine...');
            return;
        }

        this.createAnimatedBackground();
        this.createPanda();
        this.createParticleSystems();
        
        this.comboTimer = null;
        this.comboTimeout = 2000;
        this.currentCombo = 0;
        
        this.showUserInfo();
        this.updateGameUI();
        
        console.log('✅ Sistemas del juego configurados');
    }

    showUserInfo() {
        const userInfoText = `Jugador: ${this.userData.first_name}`;
        this.add.text(10, 10, userInfoText, {
            fontSize: '12px',
            fill: '#AAAAAA',
            fontFamily: 'Arial'
        }).setOrigin(0, 0);
    }

    createAnimatedBackground() {
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
        
        let currentSkin = this.userStats?.current_skin || 'panda-basico';
        
        if (!this.textures.exists(currentSkin)) {
            currentSkin = 'panda-placeholder';
            console.warn(`Skin ${this.userStats?.current_skin} no disponible, usando placeholder`);
        }
        
        this.panda = this.add.image(centerX, centerY, currentSkin)
            .setScale(0.6)
            .setInteractive({ useHandCursor: true });
        
        const glow = this.add.circle(centerX, centerY, 180, 0xFFFFFF, 0.1);
        this.tweens.add({
            targets: glow,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        this.panda.on('pointerdown', (pointer) => {
            this.handleTap(pointer);
        });
        
        this.panda.on('pointerover', () => {
            this.panda.setTint(0xDDDDFF);
            this.panda.setScale(0.62);
        });
        
        this.panda.on('pointerout', () => {
            this.panda.clearTint();
            this.panda.setScale(0.6);
        });
        
        this.add.text(centerX, centerY + 150, '¡TOCA AL PANDA PARA GANAR!', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    async handleTap(pointer) {
        if (this.userStats.energy <= 0) {
            this.showEnergyWarning();
            return;
        }
        
        try {
            const baseReward = 1;
            const tapPower = this.userStats.tap_power || 1.0;
            const coinsEarned = Math.floor(baseReward * tapPower);
            const expEarned = 1;
            
            this.userStats.energy -= 1;
            this.userStats.total_taps += 1;
            this.userStats.coins += coinsEarned;
            this.userStats.experience += expEarned;
            
            this.handleCombo();
            this.createTapEffects(pointer.x, pointer.y, coinsEarned);
            this.animatePandaTap();
            
            await this.syncTapToSupabase();
            await this.checkAchievements();
            await this.checkLevelUp();
            
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
            
        } catch (error) {
            console.error('❌ Error sincronizando tap:', error);
        }
    }

    handleCombo() {
        this.currentCombo += 1;
        
        if (this.comboTimer) {
            this.comboTimer.remove();
        }
        
        this.comboTimer = this.time.delayedCall(this.comboTimeout, () => {
            this.currentCombo = 0;
            this.updateGameUI();
        });
        
        if (this.currentCombo > this.userStats.max_combo) {
            this.userStats.max_combo = this.currentCombo;
        }
        
        if (this.currentCombo % 10 === 0) {
            this.createComboBonus();
        }
    }

    createTapEffects(x, y, coinsEarned) {
        const circle = this.add.circle(x, y, 10, 0xFFFFFF, 0.5);
        this.tweens.add({
            targets: circle,
            radius: 100,
            alpha: 0,
            duration: 500,
            onComplete: () => circle.destroy()
        });
        
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
            this.userStats.level += 1;
            this.userStats.experience = 0;
            this.userStats.max_energy += 10;
            this.userStats.energy = this.userStats.max_energy;
            
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

    showError(message) {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
            message, {
            fontSize: '16px',
            fill: '#ff4444',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
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

    console.log('🎯 Iniciando Crypto Panda Game con Tutorial...');

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight - 150,
        parent: 'panda-container',
        backgroundColor: '#0b0b0f',
        scene: [TutorialScene, PandaGameScene], // ← CORRECTO: referencias directas
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    try {
        const game = new Phaser.Game(config);
        console.log('✅ Juego Phaser creado exitosamente');
        return game;
    } catch (error) {
        console.error('❌ Error crítico al crear juego Phaser:', error);
    }
};
