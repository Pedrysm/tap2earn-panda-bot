const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check para Railway
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Crypto Panda Server Running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Crypto Panda Server running on port ${PORT}`);
  console.log(`📱 Game accessible at: http://localhost:${PORT}`);
});
