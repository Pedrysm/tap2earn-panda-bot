class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  preload() {
    console.log('📘 Precargando TutorialScene...');
    // Puedes agregar aquí imágenes o íconos si los necesitas
  }

  create() {
    console.log('🎓 Mostrando tutorial inicial...');

    const { centerX, centerY } = this.cameras.main;

    // Fondo semitransparente
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);

    // Texto principal
    this.add.text(centerX, centerY - 100, '¡Bienvenido a Crypto Panda!', {
      fontSize: '28px',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 40, 'Toca al panda para ganar monedas.\nGasta energía y sube de nivel.', {
      fontSize: '18px',
      fill: '#CCCCCC',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // Botón para continuar
    const startButton = this.add.text(centerX, centerY + 80, 'EMPEZAR JUEGO', {
      fontSize: '20px',
      backgroundColor: '#00c896',
      color: '#ffffff',
      padding: { x: 20, y: 10 },
      borderRadius: 8,
      fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startButton.on('pointerdown', () => {
      console.log('➡️ Transición a PandaGameScene');
      this.scene.start('PandaGameScene');
    });
  }
}

window.TutorialScene = TutorialScene;
