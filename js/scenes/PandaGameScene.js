class PandaGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PandaGameScene' });
    this.userStats = null;
    this.panda = null;
  }

  preload() {
    console.log('📦 Precargando assets del juego...');
    this.load.image('panda-basico', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-basico.png');
  }

  create() {
    console.log('🚀 Creando escena PandaGameScene...');
    this.userStats = {
      energy: 10,
      coins: 0,
      experience: 0,
      level: 1,
      max_energy: 10,
      tap_power: 1.0,
      total_taps: 0,
      gems: 0,
      current_skin: 'panda-basico'
    };

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.panda = this.add.image(centerX, centerY, this.userStats.current_skin)
      .setScale(0.6)
      .setInteractive({ useHandCursor: true });

    this.panda.on('pointerdown', (pointer) => {
      this.handleTap(pointer);
    });

    this.add.text(centerX, centerY + 150, '¡TOCA AL PANDA PARA GANAR!', {
      fontSize: '20px',
      fill: '#FFFFFF',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  handleTap(pointer) {
    if (this.userStats.energy <= 0) {
      this.showEnergyWarning();
      return;
    }

    const baseReward = 1;
    const tapPower = this.userStats.tap_power || 1.0;
    const coinsEarned = Math.floor(baseReward * tapPower);

    this.userStats.energy -= 1;
    this.userStats.total_taps += 1;
    this.userStats.coins += coinsEarned;
    this.userStats.experience += 1;

    this.createTapEffect(pointer.x, pointer.y, coinsEarned);
    this.animatePandaTap();
    this.updateGameUI();
  }

  createTapEffect(x, y, coinsEarned) {
    const circle = this.add.circle(x, y, 10, 0xFFFFFF, 0.5);
    this.tweens.add({
      targets: circle,
      radius: 100,
      alpha: 0,
      duration: 500,
      onComplete: () => circle.destroy()
    });

    const rewardText = this.add.text(x, y - 30, `+${coinsEarned}`, {
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
    const elements = {
      'energy-text': `${this.userStats.energy}/${this.userStats.max_energy}`,
      'coins-text': Math.floor(this.userStats.coins),
      'level-text': `Nvl ${this.userStats.level}`,
      'total-taps': this.userStats.total_taps,
      'exp-text': `${this.userStats.experience}/${this.userStats.level * 100}`
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  update() {
    if (this.panda) {
      this.panda.rotation += 0.001;
    }
  }
}

window.PandaGameScene = PandaGameScene;
