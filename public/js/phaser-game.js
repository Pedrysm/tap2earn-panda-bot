window.initPhaserGame = () => {
  // Verifica que Phaser esté cargado
  if (typeof Phaser === 'undefined') {
    console.error('Phaser no está cargado');
    return;
  }

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'panda-container',
    backgroundColor: '#0b0b0f',
    scene: {
      preload() {
        console.log('Cargando assets...');
        // Carga múltiples assets para el juego
        this.load.image('panda', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/crypto_panda_portada.png');
        this.load.image('background', 'https://placehold.co/800x600/1a1a2e/FFFFFF/png?text=Crypto+Panda');
      },
      
      create() {
        console.log('Creando escena...');
        
        // Fondo
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
          .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Panda INTERACTIVO
        const panda = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'panda')
          .setScale(0.5)
          .setInteractive({ useHandCursor: true }); // Manito al pasar sobre el panda
        
        // Texto de instrucciones
        this.add.text(this.cameras.main.centerX, 100, '¡TOCA AL PANDA!', {
          fontSize: '32px',
          fill: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 4
        }).setOrigin(0.5);
        
        // Contador de taps
        this.tapCount = 0;
        this.tapText = this.add.text(this.cameras.main.centerX, 150, 'Taps: 0', {
          fontSize: '24px',
          fill: '#FFD700',
          fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // ¡EVENTO DE TAP! - Aquí está la magia
        panda.on('pointerdown', () => {
          console.log('¡TAP en el panda!');
          this.tapCount++;
          this.tapText.setText('Taps: ' + this.tapCount);
          
          // Efecto visual al hacer tap
          this.tweens.add({
            targets: panda,
            scaleX: 0.55,
            scaleY: 0.55,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          });
          
          // Partículas o efecto de texto
          const tapEffect = this.add.text(panda.x, panda.y - 50, '+1', {
            fontSize: '20px',
            fill: '#00FF00',
            fontFamily: 'Arial'
          }).setOrigin(0.5);
          
          this.tweens.add({
            targets: tapEffect,
            y: tapEffect.y - 100,
            alpha: 0,
            duration: 1000,
            onComplete: () => tapEffect.destroy()
          });
        });
        
        // Efecto hover
        panda.on('pointerover', () => {
          panda.setTint(0xDDDDDD);
        });
        
        panda.on('pointerout', () => {
          panda.clearTint();
        });
        
        console.log('Juego Phaser iniciado correctamente');
      },
      
      update() {
        // Lógica de actualización (si necesitas animaciones continuas)
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
