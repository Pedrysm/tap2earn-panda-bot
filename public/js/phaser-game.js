import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.esm.js'

// Claves seguras desde variables de entorno (nunca en GitHub)
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || window.SUPABASE_URL || 'https://vrbxeerfvoaukcopydpt.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || window.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnhlZXJmdm9hdWtjb3B5ZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjY3NzEsImV4cCI6MjA3OTUwMjc3MX0.DvITFxrcIcF3E-ZHveHZxNhSFaHCxb_r_KvqjUAtIhM'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

class TapScene extends Phaser.Scene {
  constructor() { super('TapScene') }

  async preload() {
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345
    const { data } = await supabase
      .from('user_stats')
      .select('equipped_skin')
      .eq('telegram_id', userId)
      .single()

    const skinFile = data?.equipped_skin || '../assets/skins/panda1.png'
    const skinUrl = `https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/${skinFile}`
    this.load.image('panda', skinUrl)
    this.load.image('star', 'https://cdn.jsdelivr.net/npm/phaser@3/examples/assets/particles/yellow.png')
  }

  create() {
    const panda = this.add.image(400, 320, 'panda')
      .setScale(0.85)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (window.isTapping) return
        window.isTapping = true
        this.particles.explode(45, panda.x, panda.y)
        panda.setTint(0xffffff)
        this.time.delayedCall(80, () => panda.clearTint())
        if (typeof window.handleTap === 'function') window.handleTap()
        setTimeout(() => window.isTapping = false, 60)
      })

    this.tweens.add({ targets: panda, y: '+=35', duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    this.particles = this.add.particles(0, 0, 'star', {
      speed: { min: 200, max: 400 }, scale: { start: 1.2, end: 0 },
      blendMode: 'ADD', lifespan: 800, gravityY: 300,
      tint: [0x9b59b6, 0xf1c40f, 0xffffff, 0x8e44ad], frequency: -1
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tapTab = document.querySelector('[data-tab="tap"]')
  if (tapTab && tapTab.classList.contains('active')) {
    new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'panda-container',
      width: 800,
      height: 600,
      transparent: true,
      scene: TapScene
    })
  }
})
