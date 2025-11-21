const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let userId = tg.initDataUnsafe.user?.id || 123456789;
let coins = 0;
let energy = 5000;
let maxEnergy = 5000;
let multitap = 5;
let rechargeSpeed = 3;

const coinsEl = document.getElementById('coins');
const energyFill = document.getElementById('energyFill');
const energyText = document.getElementById('energyText');
const panda = document.getElementById('panda');

const SUPABASE_URL = "https://mixbbsgniudsgcucyfwe.supabase.co";
const SUPABASE_KEY = "tu_anon_key_larga_aqui";

function updateDisplay() {
  coinsEl.textContent = Number(coins).toLocaleString() + " $PANDA";
  energyText.textContent = energy + " / " + maxEnergy + " ⚡️";
  energyFill.style.width = (energy / maxEnergy * 100) + "%";
}

// Cargar datos
fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
  headers: { "apikey": SUPABASE_KEY }
})
.then(r => r.json())
.then(data => {
  if (data[0]) {
    coins = data[0].coins || 0;
    energy = data[0].energy || 5000;
    maxEnergy = data[0].max_energy || 5000;
    multitap = data[0].multitap || 5;
    rechargeSpeed = data[0].recharge_speed || 3;
    updateDisplay();
  }
});

// TAP
panda.addEventListener('click', () => {
  if (energy < 1) {
    tg.showAlert("⚡️ Sin energía!");
    return;
  }
  energy--;
  coins += multitap;
  updateDisplay();

  // Explosión de monedas
  for (let i = 0; i < 10; i++) {
    let coin = document.createElement('div');
    coin.textContent = "🪙";
    coin.style.position = 'absolute';
    coin.style.left = '50%';
    coin.style.top = '50%';
    coin.style.fontSize = '2em';
    coin.style.pointerEvents = 'none';
    coin.style.animation = 'floatUp 1s forwards';
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
  }

  // Guardar
  fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json", "Prefer": "return=minimal" },
    body: JSON.stringify({ coins, energy, last_energy_update: new Date().toISOString() })
  });
});

// Recarga energía
setInterval(() => {
  if (energy < maxEnergy) {
    energy += rechargeSpeed;
    if (energy > maxEnergy) energy = maxEnergy;
    updateDisplay();
  }
}, 1000);
