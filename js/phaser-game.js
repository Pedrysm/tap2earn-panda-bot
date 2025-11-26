window.initPhaserGame = () => {
  const PandaGameScene = window.PandaGameScene;
  const TutorialScene = window.TutorialScene;

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - 150,
    parent: 'panda-container',
    backgroundColor: '#0b0b0f',
    scene: [TutorialScene, PandaGameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  const game = new Phaser.Game(config);
};
