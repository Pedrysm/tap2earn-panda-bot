window.initPhaserGame = () => {
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'panda-container',
    backgroundColor: '#0b0b0f',
    scene: {
      preload() {
        this.load.image('panda', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/crypto_panda_portada.png');
      },
      create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.add.image(centerX, centerY, 'panda').setScale(0.5);
      }
    }
  };

  new Phaser.Game(config);
};
