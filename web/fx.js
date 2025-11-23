import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js'

export function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ffd700', '#ffaa00', '#ffffff', '#ff4444']
  })
}

export function flashScreen() {
  const flash = document.createElement('div')
  flash.className = 'flash-overlay'
  document.body.appendChild(flash)
  setTimeout(() => {
    if (flash.parentNode) {
      document.body.removeChild(flash)
    }
  }, 300)
}

export function bouncePanda() {
  const panda = document.getElementById('panda')
  if (!panda) return
  
  panda.style.transform = 'scale(0.85)'
  setTimeout(() => {
    panda.style.transform = 'scale(1)'
  }, 150)
}

export function playSound(soundName) {
  // Para futura implementación de sonidos
  console.log('Playing sound:', soundName)
  // Podemos agregar aquí la lógica para reproducir sonidos
  try {
    // Ejemplo básico para futuros sonidos
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (soundName === 'combo') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // Do
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // Mi
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // Sol
    } else {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log('Audio not supported:', error)
  }
}

export function showFloatingText(text, x, y) {
  const fx = document.createElement('div')
  fx.className = 'tap'
  fx.textContent = text
  fx.style.left = x + 'px'
  fx.style.top = y + 'px'
  fx.style.color = text.includes('NO ENERGY') ? '#ff4444' : '#ffffff'
  document.body.appendChild(fx)
  
  setTimeout(() => {
    if (fx.parentNode) {
      document.body.removeChild(fx)
    }
  }, 1000)
}
