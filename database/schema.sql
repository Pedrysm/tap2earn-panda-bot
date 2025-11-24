-- =============================================
-- CRYPTO PANDA - SCHEMA COMPLETO 100% FUNCIONAL 2025
-- Ejecutar todo de una vez en Supabase SQL Editor
-- =============================================

-- 1. Tabla de usuarios principal
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100),
    language_code VARCHAR(10) DEFAULT 'es',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_premium BOOLEAN DEFAULT FALSE,
    referred_by UUID REFERENCES users(id)
);

-- 2. Clanes (antes que user_stats para evitar error de FK)
CREATE TABLE clans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    tag VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    total_coins DECIMAL(28,8) DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50,
    required_level INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Estadísticas del jugador
CREATE TABLE user_stats (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    level INTEGER DEFAULT 1 NOT NULL,
    experience BIGINT DEFAULT 0,
    coins DECIMAL(28,8) DEFAULT 0,
    gems INTEGER DEFAULT 0,
    total_taps BIGINT DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 6000,
    max_energy INTEGER DEFAULT 6000,
    current_skin VARCHAR(50) DEFAULT 'panda-clasico',
    clan_id UUID REFERENCES clans(id),
    last_energy_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Evolución del panda
CREATE TABLE panda_evolution (
    level INTEGER PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL,
    required_coins DECIMAL(28,8) NOT NULL,
    required_taps BIGINT,
    tap_multiplier DECIMAL(4,2) DEFAULT 1.0,
    energy_capacity INTEGER,
    unlockable_skins TEXT[],
    special_abilities JSONB,
    evolution_image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Skins (image_url OBLIGATORIO)
CREATE TABLE panda_skins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    image_url TEXT NOT NULL,
    animated_url TEXT,
    thumbnail_url TEXT,
    required_level INTEGER DEFAULT 1,
    price_coins DECIMAL(28,8),
    price_gems INTEGER,
    unlock_condition VARCHAR(100),
    tap_multiplier DECIMAL(3,2) DEFAULT 1.0,
    special_effect VARCHAR(100),
    animation_data JSONB,
    is_limited BOOLEAN DEFAULT FALSE,
    limited_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Skins desbloqueadas por usuarios
CREATE TABLE user_skins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    skin_id UUID REFERENCES panda_skins(id) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    is_equipped BOOLEAN DEFAULT FALSE,
    uses_count INTEGER DEFAULT 0,
    UNIQUE(unlocked_id, skin_id)
);

-- 7. Cartas coleccionables
CREATE TABLE collectible_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_name VARCHAR(100) NOT NULL,
    card_type VARCHAR(50) CHECK (card_type IN ('boost', 'ability', 'special', 'collector')),
    rarity VARCHAR(20) DEFAULT 'common',
    image_url TEXT NOT NULL,
    description TEXT,
    effect_type VARCHAR(50),
    effect_value DECIMAL(5,2),
    effect_duration INTEGER,
    max_uses INTEGER,
    required_level INTEGER DEFAULT 1,
    is_tradable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    card_id UUID REFERENCES collectible_cards(id) NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ,
    UNIQUE(user_id, card_id)
);

CREATE TABLE active_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    card_id UUID REFERENCES collectible_cards(id) NOT NULL,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_expired BOOLEAN DEFAULT FALSE
);

-- 8. Miembros del clan
CREATE TABLE clan_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clan_id UUID REFERENCES clans(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'co_leader', 'leader')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_coins DECIMAL(28,8) DEFAULT 0,
    contribution_taps BIGINT DEFAULT 0,
    last_contribution TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clan_id, user_id)
);

-- 9. Torneos y leaderboards
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    entry_fee_coins DECIMAL(28,8) DEFAULT 0,
    entry_fee_gems INTEGER DEFAULT 0,
    prize_pool_coins DECIMAL(28,8) DEFAULT 0,
    prize_pool_gems INTEGER DEFAULT 0,
    max_participants INTEGER,
    required_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    score BIGINT DEFAULT 0,
    position INTEGER,
    coins_earned DECIMAL(28,8) DEFAULT 0,
    gems_earned INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

CREATE TABLE leaderboards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    period_type VARCHAR(20) DEFAULT 'all_time' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
    period_date DATE DEFAULT CURRENT_DATE,
    score BIGINT DEFAULT 0,
    taps_count BIGINT DEFAULT 0,
    coins_earned DECIMAL(28,8) DEFAULT 0,
    rank_position INTEGER,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_date)
);

-- 10. Logros, referidos y tienda
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('tapping', 'collection', 'social', 'progression', 'special')),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    reward_coins DECIMAL(28,8),
    reward_gems INTEGER,
    reward_skin UUID REFERENCES panda_skins(id),
    reward_card UUID REFERENCES collectible_cards(id),
    is_secret BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    achievement_id UUID REFERENCES achievements(id) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress_current INTEGER DEFAULT 0,
    progress_target INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_id UUID REFERENCES users(id) NOT NULL,
    level INTEGER DEFAULT 1,
    bonus_claimed BOOLEAN DEFAULT FALSE,
    bonus_coins DECIMAL(28,8) DEFAULT 0,
    bonus_gems INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id)
);

CREATE TABLE shop_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_id UUID,
    item_name VARCHAR(100) NOT NULL,
    price_coins DECIMAL(28,8),
    price_gems INTEGER,
    quantity INTEGER DEFAULT 1,
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- DATOS INICIALES
INSERT INTO panda_evolution (level, level_name, required_coins, tap_multiplier, energy_capacity, special_abilities) VALUES
(1, 'Panda Bebé', 0, 1.0, 6000, '["basic_tap"]'),
(2, 'Panda Aprendiz', 1000, 1.2, 6500, '["basic_tap", "fast_recharge_1"]'),
(3, 'Panda Guerrero', 5000, 1.5, 7000, '["basic_tap", "fast_recharge_1", "combo_boost_1"]'),
(4, 'Panda Maestro', 15000, 1.8, 8000, '["basic_tap", "fast_recharge_1", "combo_boost_1", "critical_chance_1"]'),
(5, 'Panda Leyenda', 50000, 2.2, 9000, '["basic_tap", "fast_recharge_2", "combo_boost_1", "critical_chance_1", "energy_save_1"]'),
(6, 'Panda Épico', 150000, 2.7, 10000, '["basic_tap", "fast_recharge_2", "combo_boost_2", "critical_chance_1", "energy_save_1", "double_reward_chance"]'),
(7, 'Panda Mítico', 500000, 3.3, 12000, '["basic_tap", "fast_recharge_3", "combo_boost_2", "critical_chance_2", "energy_save_2", "double_reward_chance"]'),
(8, 'Panda Divino', 1500000, 4.0, 15000, '["basic_tap", "fast_recharge_3", "combo_boost_3", "critical_chance_2", "energy_save_2", "double_reward_chance", "mega_combo"]'),
(9, 'Panda Celestial', 5000000, 5.0, 20000, '["basic_tap", "fast_recharge_4", "combo_boost_3", "critical_chance_3", "energy_save_3", "double_reward_chance", "mega_combo", "energy_overflow"]'),
(10, 'Panda Cósmico', 15000000, 6.5, 30000, '["basic_tap", "fast_recharge_5", "combo_boost_4", "critical_chance_3", "energy_save_3", "double_reward_chance", "mega_combo", "energy_overflow", "god_mode"]')
ON CONFLICT DO NOTHING;

INSERT INTO panda_skins (name, rarity, required_level, price_coins, image_url, tap_multiplier) VALUES
('Panda Clásico', 'common', 1, 0, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-clasico.png', 1.0),
('Panda Dorado', 'uncommon', 3, 5000, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-dorado.png', 1.2),
('Panda de Hielo', 'rare', 5, 25000, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-hielo.png', 1.5),
('Panda de Fuego', 'epic', 7, 100000, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-fuego.png', 1.8),
('Panda Eléctrico', 'legendary', 9, 500000, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-electrico.png', 2.2),
('Panda Cósmico', 'mythic', 10, 2000000, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/skins/panda-cosmico.png', 3.0)
ON CONFLICT (name) DO NOTHING;

INSERT INTO collectible_cards (card_name, card_type, rarity, effect_type, effect_value, effect_duration) VALUES
('Boost de Tap', 'boost', 'common', 'tap_boost', 1.5, 300),
('Ahorro de Energía', 'boost', 'uncommon', 'energy_save', 0.5, 600),
('Combo Dorado', 'ability', 'rare', 'combo_boost', 2.0, 180),
('Suerte Crítica', 'special', 'epic', 'critical_chance', 0.15, 900),
('Doble Recompensa', 'special', 'legendary', 'double_reward', 1.0, 120)
ON CONFLICT DO NOTHING;

-- Índices y triggers
CREATE INDEX idx_user_stats_coins ON user_stats(coins DESC);
CREATE INDEX idx_leaderboards_period ON leaderboards(period_type, period_date, score DESC);
CREATE INDEX idx_tournaments_active ON tournaments(is_active, start_time, end_time);
CREATE INDEX idx_user_skins_equipped ON user_skins(user_id, is_equipped);
CREATE INDEX idx_clan_members_contrib ON clan_members(clan_id, contribution_coins DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clans_updated_at BEFORE UPDATE ON clans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ¡BASE DE DATOS 100% LISTA!
