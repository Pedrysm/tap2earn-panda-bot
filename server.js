const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para forzar HTTPS en producción
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Crypto Panda HTTPS Ready 🚀',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Crypto Panda Server running on port ${PORT}`);
  console.log(`🔒 HTTPS Ready: ${process.env.NODE_ENV === 'production' ? 'YES' : 'NO'}`);
});
