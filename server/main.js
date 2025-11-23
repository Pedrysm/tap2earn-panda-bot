import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Configuración Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.telegram.org", "ws:", "wss:"]
    }
  }
}));
app.use(compression());
app.use(cors());

// Rate limiting mejorado
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Importar rutas
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import leaderboardRoutes from './routes/leaderboard.js';
import clanRoutes from './routes/clan.js';

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/clan', clanRoutes);

// WebSocket para eventos en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('tap_event', async (data) => {
    const result = await processAdvancedTap(data);
    socket.emit('tap_result', result);
    
    // Actualizar leaderboard en tiempo real
    io.emit('leaderboard_update', await getLeaderboardUpdate());
  });

  socket.on('join_clan', (clanId) => {
    socket.join(`clan_${clanId}`);
  });

  socket.on('clan_chat', (data) => {
    socket.to(`clan_${data.clanId}`).emit('new_clan_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Sistema avanzado de taps
async function processAdvancedTap(data) {
  const { userId, combo, multipliers = {} } = data;
  
  // Cálculo complejo de recompensas
  const baseReward = 1;
  const levelMultiplier = multipliers.level || 1;
  const skinMultiplier = multipliers.skin || 1;
  const comboMultiplier = Math.min(combo * 0.1, 3); // Máximo 3x por combo
  const clanBonus = multipliers.clan || 1;
  
  const totalReward = Math.floor(
    baseReward * levelMultiplier * skinMultiplier * comboMultiplier * clanBonus
  );

  // Aplicar boost de cartas si existen
  const cardBoost = await getActiveCardBoost(userId);
  const finalReward = totalReward * (1 + cardBoost);

  // Actualizar base de datos
  const { error } = await supabase
    .from('user_stats')
    .update({
      coins: supabase.raw('coins + ?', [finalReward]),
      total_taps: supabase.raw('total_taps + 1'),
      max_combo: supabase.raw('GREATEST(max_combo, ?)', [combo]),
      energy: supabase.raw('GREATEST(energy - 1, 0)'),
      last_tap: new Date()
    })
    .eq('user_id', userId);

  // Verificar logros
  await checkAchievements(userId, combo, finalReward);

  return {
    success: !error,
    reward: finalReward,
    combo: combo,
    multipliers: {
      level: levelMultiplier,
      skin: skinMultiplier,
      combo: comboMultiplier,
      clan: clanBonus,
      card: cardBoost
    }
  };
}

async function getActiveCardBoost(userId) {
  const { data } = await supabase
    .from('active_cards')
    .select('boost_value')
    .eq('user_id', userId)
    .gt('expires_at', new Date())
    .single();
  
  return data?.boost_value || 0;
}

async function checkAchievements(userId, combo, reward) {
  // Lógica compleja de logros
  const achievements = [
    { type: 'combo', threshold: 10, name: 'Combo Novato' },
    { type: 'combo', threshold: 25, name: 'Combo Pro' },
    { type: 'combo', threshold: 50, name: 'Combo Maestro' },
    { type: 'taps', threshold: 1000, name: 'Tapper Novato' },
    { type: 'taps', threshold: 10000, name: 'Tapper Experto' }
  ];

  for (const achievement of achievements) {
    await verifyAndGrantAchievement(userId, achievement, combo, reward);
  }
}

async function verifyAndGrantAchievement(userId, achievement, combo, reward) {
  // Implementar lógica de verificación y concesión de logros
}

async function getLeaderboardUpdate() {
  const { data } = await supabase
    .from('leaderboard')
    .select(`
      user_id,
      weekly_coins,
      users:user_id(username, level, current_skin)
    `)
    .order('weekly_coins', { ascending: false })
    .limit(50);
  
  return data;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Crypto Panda Server running on port ${PORT}`);
  console.log(`📊 Advanced features: Evolution, Clans, Cards, Tournaments`);
});
