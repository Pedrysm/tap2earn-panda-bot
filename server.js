const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Health check para Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Crypto Panda Server Running 🐼',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Ruta principal - servir el juego
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Crypto Panda Épico ejecutándose en puerto ${PORT}`);
  console.log(`🎮 Juego disponible en: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
