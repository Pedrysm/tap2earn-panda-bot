import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js'

export function showConfetti() {
  confetti({particleCount:100,spread:70,origin:{y:0.6}})
}

export function flashScreen() {
  const flash = document.createElement('div')
  flash.style.position = 'fixed'
  flash.style.top = '0'
  flash.style.left = '0'
  flash.style.width = '100%'
  flash.style.height = '100%'
  flash.style.background = 'white'
  flash.style.opacity = '0.6'
  flash.style.zIndex = '1000'
  flash.style.pointerEvents = 'none'
  document.body.appendChild(flash)
  setTimeout(() => {
    document.body.removeChild(flash)
  }, 200)
}

export function bouncePanda() {
  const panda = document.getElementById('panda')
  panda.style.transform = 'scale(0.85)'
  setTimeout(() => panda.style.transform = '', 150)
}

export function playSound(soundName) {
  // Por ahora no implementamos sonidos, pero se puede extender
  console.log('Play sound: ' + soundName)
}

export function showFloatingText(text, x, y) {
  let fx = document.createElement('div')
  fx.className = 'tap'
  fx.textContent = text
  fx.style.left = x + 'px'
  fx.style.top = y + 'px'
  document.body.appendChild(fx)
  setTimeout(() => fx.remove(), 1000)
}
