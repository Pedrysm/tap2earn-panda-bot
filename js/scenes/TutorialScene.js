// TutorialScene.js - ESCENA DE TUTORIAL MEJORADA
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
