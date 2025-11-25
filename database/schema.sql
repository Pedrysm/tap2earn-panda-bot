-- =============================================
-- CRYPTO PANDA - SCHEMA COMPLETO CORREGIDO 2025
-- EJECUTAR TODO EN SUPABASE SQL EDITOR
-- =============================================

-- LIMPIAR TODO EXISTENTE (CORREGIDO PARA EVITAR ERRORES)
DROP TABLE IF EXISTS toncoin_transactions CASCADE;
DROP TABLE IF EXISTS airdrop_participants CASCADE;
DROP TABLE IF EXISTS airdrop_tasks CASCADE;
DROP TABLE IF EXISTS airdrop_campaigns CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;
DROP TABLE IF EXISTS user_inventory CASCADE;
DROP TABLE IF EXISTS daily_roulette CASCADE;
DROP TABLE IF EXISTS weekly_events CASCADE;
DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS social_tasks CASCADE;
DROP TABLE IF EXISTS shop_transactions CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS leaderboards CASCADE;
DROP TABLE IF EXISTS tournament_participants CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS clan_members CASCADE;
DROP TABLE IF EXISTS active_cards CASCADE;
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS collectible_cards CASCADE;
DROP TABLE IF EXISTS user_skins CASCADE;
DROP TABLE IF EXISTS panda_skins CASCADE;
DROP TABLE IF EXISTS panda_evolution CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS clans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS daily_missions CASCADE;
DROP TABLE IF EXISTS user_missions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS game_config CASCADE;

-- 1. USUARIOS PRINCIPAL CON TONCOIN
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100),
    language_code VARCHAR(10) DEFAULT 'es',
    ton_wallet_address VARCHAR(100),
    wallet_verified BOOLEAN DEFAULT FALSE,
    total_ton_earned DECIMAL(12,6) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_premium BOOLEAN DEFAULT FALSE,
    referred_by UUID REFERENCES users(id),
    login_streak INTEGER DEFAULT 0,
    last_login_date DATE DEFAULT CURRENT_DATE,
    total_earned DECIMAL(28,8) DEFAULT 0
);

-- 2. CLANES (ANTES DE USER_STATS PARA FK)
CREATE TABLE clans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    tag VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT DEFAULT 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/clans/default-clan.png',
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    total_coins DECIMAL(28,8) DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    max_members INTEGER DEFAULT 50,
    required_level INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    clan_perks JSONB DEFAULT '["daily_bonus", "tap_boost", "energy_boost"]'
);

-- 3. ESTADÍSTICAS AVANZADAS
CREATE TABLE user_stats (
    user_id UUID REFERENCES users(id) PRIMARY KEY,
    level INTEGER DEFAULT 1 NOT NULL,
    experience BIGINT DEFAULT 0,
    coins DECIMAL(28,8) DEFAULT 0,
    gems INTEGER DEFAULT 0,
    total_taps BIGINT DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    energy INTEGER DEFAULT 100,
    max_energy INTEGER DEFAULT 100,
    current_skin VARCHAR(50) DEFAULT 'panda-basico',
    clan_id UUID REFERENCES clans(id),
    last_energy_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tap_power DECIMAL(4,2) DEFAULT 1.0,
    critical_chance DECIMAL(4,3) DEFAULT 0.05,
    critical_multiplier DECIMAL(4,2) DEFAULT 2.0,
    lucky_strike_chance DECIMAL(4,3) DEFAULT 0.01,
    total_airdrop_earnings DECIMAL(28,8) DEFAULT 0
);

-- 4. EVOLUCIÓN ÉPICA DEL PANDA
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
    rewards JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SKINS LEGENDARIAS
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
    particle_effect VARCHAR(50),
    sound_effect VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SKINS DE USUARIOS
CREATE TABLE user_skins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    skin_id UUID REFERENCES panda_skins(id) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    is_equipped BOOLEAN DEFAULT FALSE,
    uses_count INTEGER DEFAULT 0,
    UNIQUE(user_id, skin_id)
);

-- 7. CARTAS PODEROSAS
CREATE TABLE collectible_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_name VARCHAR(100) NOT NULL,
    card_type VARCHAR(50) CHECK (card_type IN ('boost', 'ability', 'special', 'collector', 'ultimate')),
    rarity VARCHAR(20) DEFAULT 'common',
    image_url TEXT NOT NULL,
    description TEXT,
    effect_type VARCHAR(50),
    effect_value DECIMAL(5,2),
    effect_duration INTEGER,
    max_uses INTEGER,
    required_level INTEGER DEFAULT 1,
    is_tradable BOOLEAN DEFAULT TRUE,
    animation_script JSONB,
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
    uses_remaining INTEGER,
    UNIQUE(user_id, card_id)
);

CREATE TABLE active_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    card_id UUID REFERENCES collectible_cards(id) NOT NULL,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_expired BOOLEAN DEFAULT FALSE,
    effect_strength DECIMAL(5,2) DEFAULT 1.0
);

-- 8. SISTEMA DE CLANES AVANZADO
CREATE TABLE clan_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clan_id UUID REFERENCES clans(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'co_leader', 'leader')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_coins DECIMAL(28,8) DEFAULT 0,
    contribution_taps BIGINT DEFAULT 0,
    last_contribution TIMESTAMPTZ DEFAULT NOW(),
    weekly_contribution DECIMAL(28,8) DEFAULT 0,
    UNIQUE(clan_id, user_id)
);

-- 9. TORNEOS COMPETITIVOS
CREATE TABLE tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('daily', 'weekly', 'monthly', 'special', 'clan_war')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    entry_fee_coins DECIMAL(28,8) DEFAULT 0,
    entry_fee_gems INTEGER DEFAULT 0,
    prize_pool_coins DECIMAL(28,8) DEFAULT 0,
    prize_pool_gems INTEGER DEFAULT 0,
    max_participants INTEGER,
    required_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tournament_rules JSONB,
    special_conditions JSONB
);

CREATE TABLE tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    score BIGINT DEFAULT 0,
    rank_position INTEGER,
    coins_earned DECIMAL(28,8) DEFAULT 0,
    gems_earned INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_score_update TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- 10. LEADERBOARDS GLOBALES
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

-- 11. LOGROS ÉPICOS
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('tapping', 'collection', 'social', 'progression', 'special', 'hidden')),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    reward_coins DECIMAL(28,8),
    reward_gems INTEGER,
    reward_skin UUID REFERENCES panda_skins(id),
    reward_card UUID REFERENCES collectible_cards(id),
    is_secret BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    achievement_tier VARCHAR(20) DEFAULT 'bronze'
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

-- 12. SISTEMA DE REFERIDOS
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

-- 13. TIENDA Y TRANSACCIONES
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

-- 14. MISIONES DIARIAS Y SEMANALES
CREATE TABLE daily_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    reward_coins DECIMAL(28,8) NOT NULL,
    reward_gems INTEGER NOT NULL,
    day_of_week INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    mission_difficulty VARCHAR(20) DEFAULT 'normal'
);

CREATE TABLE user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    mission_id UUID REFERENCES daily_missions(id) NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, mission_id)
);

-- 15. EVENTOS ESPECIALES
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('halloween', 'navidad', 'especial', 'anniversary', 'seasonal')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    special_skin UUID REFERENCES panda_skins(id),
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_quests JSONB
);

-- 16. CONFIGURACIÓN DEL JUEGO
CREATE TABLE game_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. RULETA DIARIA
CREATE TABLE daily_roulette (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    spin_date DATE DEFAULT CURRENT_DATE,
    prize_type VARCHAR(20) CHECK (prize_type IN ('coins', 'gems', 'energy', 'card', 'skin', 'ton')),
    prize_value DECIMAL(28,8),
    prize_description TEXT,
    spin_result INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, spin_date)
);

-- 18. EVENTOS SEMANALES CON TONCOIN
CREATE TABLE weekly_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    total_prize_pool DECIMAL(12,6) DEFAULT 0,
    owner_rake_percent DECIMAL(5,2) DEFAULT 15.0,
    participant_limit INTEGER,
    entry_requirement VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES weekly_events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    score BIGINT DEFAULT 0,
    rank_position INTEGER,
    ton_earned DECIMAL(12,6) DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 19. TRANSACCIONES TONCOIN
CREATE TABLE toncoin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('airdrop', 'weekly_event', 'withdrawal', 'purchase')),
    amount DECIMAL(12,6) NOT NULL,
    ton_wallet_address VARCHAR(100),
    transaction_hash VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 20. SISTEMA DE AIRDROPS
CREATE TABLE airdrop_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_reward_pool DECIMAL(28,8) DEFAULT 0,
    reward_per_user DECIMAL(28,8) DEFAULT 0,
    participant_limit INTEGER,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    requirements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE airdrop_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES airdrop_campaigns(id) NOT NULL,
    task_type VARCHAR(50) CHECK (task_type IN ('join_telegram', 'join_twitter', 'join_youtube', 'invite_friends', 'watch_ad', 'daily_login', 'social_share')),
    task_description TEXT NOT NULL,
    reward_coins DECIMAL(28,8) NOT NULL,
    reward_ton DECIMAL(12,6) DEFAULT 0,
    verification_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    max_completions INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE airdrop_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES airdrop_campaigns(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    total_earned DECIMAL(28,8) DEFAULT 0,
    ton_earned DECIMAL(12,6) DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- 21. TAREAS SOCIALES
CREATE TABLE social_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    platform VARCHAR(50) CHECK (platform IN ('telegram', 'twitter', 'youtube', 'discord')),
    task_url VARCHAR(255),
    proof_url VARCHAR(255),
    reward_coins DECIMAL(28,8) NOT NULL,
    reward_ton DECIMAL(12,6) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. VISUALIZACIONES DE ANUNCIOS
CREATE TABLE ad_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    ad_type VARCHAR(50) CHECK (ad_type IN ('telegram', 'external', 'video', 'banner')),
    ad_provider VARCHAR(100),
    revenue_earned DECIMAL(12,6) DEFAULT 0,
    user_reward DECIMAL(28,8) DEFAULT 0,
    view_duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. INVENTARIO DE USUARIOS
CREATE TABLE user_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_tradable BOOLEAN DEFAULT TRUE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- 24. MERCADO INTERNO
CREATE TABLE marketplace_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES users(id) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    price_coins DECIMAL(28,8),
    price_ton DECIMAL(12,6),
    quantity INTEGER DEFAULT 1,
    listing_type VARCHAR(20) DEFAULT 'sell' CHECK (listing_type IN ('sell', 'auction', 'trade')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    buyer_id UUID REFERENCES users(id),
    sold_at TIMESTAMPTZ,
    transaction_fee DECIMAL(5,2) DEFAULT 5.0
);

-- =============================================
-- FUNCIONES Y TRIGGERS AVANZADOS - CORREGIDOS
-- =============================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular premios TON semanales - CORREGIDA
CREATE OR REPLACE FUNCTION calculate_ton_prizes()
RETURNS TABLE(event_id UUID, user_id UUID, prize_rank INTEGER, ton_prize DECIMAL)
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_participants AS (
        SELECT
            ep.event_id,
            ep.user_id,
            ep.score,
            ROW_NUMBER() OVER (PARTITION BY ep.event_id ORDER BY ep.score DESC) as rank_num,
            we.total_prize_pool,
            we.owner_rake_percent
        FROM event_participants ep
        JOIN weekly_events we ON ep.event_id = we.id
        WHERE we.is_active = true
    ),
    prize_calculation AS (
        SELECT
            rp.event_id,
            rp.user_id,
            rp.rank_num,
            CASE
                WHEN rp.rank_num = 1 THEN (rp.total_prize_pool * 0.5)
                WHEN rp.rank_num = 2 THEN (rp.total_prize_pool * 0.3)
                WHEN rp.rank_num = 3 THEN (rp.total_prize_pool * 0.2)
                ELSE 0
            END * (1 - rp.owner_rake_percent / 100) as net_prize
        FROM ranked_participants rp
        WHERE rp.rank_num <= 3
    )
    SELECT
        pc.event_id,
        pc.user_id,
        pc.rank_num::INTEGER as prize_rank,
        pc.net_prize
    FROM prize_calculation pc;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar transacciones de marketplace
CREATE OR REPLACE FUNCTION process_marketplace_sale()
RETURNS TRIGGER AS $$
DECLARE
    transaction_fee DECIMAL;
    owner_earnings DECIMAL;
BEGIN
    IF NEW.status = 'sold' AND OLD.status != 'sold' THEN
        -- Calcular fee de transacción (5%)
        transaction_fee := COALESCE(NEW.price_coins, 0) * 0.05;
        owner_earnings := transaction_fee;

        -- Aquí iría la lógica para:
        -- 1. Transferir coins/ton al vendedor (menos el fee)
        -- 2. Registrar las ganancias del dueño
        -- 3. Actualizar inventarios

        RAISE NOTICE 'Venta procesada: Fee de % coins para el dueño', owner_earnings;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar tareas de airdrop
CREATE OR REPLACE FUNCTION verify_airdrop_task(
    p_user_id UUID,
    p_task_id UUID,
    p_proof_url VARCHAR DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    task_reward DECIMAL;
    ton_reward DECIMAL;
    campaign_id UUID;
BEGIN
    -- Obtener información de la tarea
    SELECT at.reward_coins, at.reward_ton, at.campaign_id
    INTO task_reward, ton_reward, campaign_id
    FROM airdrop_tasks at
    WHERE at.id = p_task_id AND at.is_active = true;

    IF task_reward IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Registrar la tarea completada
    INSERT INTO social_tasks (user_id, task_type, proof_url, reward_coins, reward_ton, status, completed_at)
    SELECT
        p_user_id,
        at.task_type,
        p_proof_url,
        at.reward_coins,
        at.reward_ton,
        'verified',
        NOW()
    FROM airdrop_tasks at
    WHERE at.id = p_task_id;

    -- Actualizar estadísticas del usuario
    UPDATE user_stats
    SET coins = coins + task_reward,
        total_airdrop_earnings = total_airdrop_earnings + task_reward
    WHERE user_id = p_user_id;

    -- Actualizar participante de airdrop
    INSERT INTO airdrop_participants (campaign_id, user_id, tasks_completed, total_earned, ton_earned)
    VALUES (campaign_id, p_user_id, 1, task_reward, ton_reward)
    ON CONFLICT (campaign_id, user_id)
    DO UPDATE SET
        tasks_completed = airdrop_participants.tasks_completed + 1,
        total_earned = airdrop_participants.total_earned + task_reward,
        ton_earned = airdrop_participants.ton_earned + ton_reward;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON user_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clans_updated_at
BEFORE UPDATE ON clans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER marketplace_sale_processed
AFTER UPDATE ON marketplace_listings
FOR EACH ROW EXECUTE FUNCTION process_marketplace_sale();

-- =============================================
-- VISTAS PARA ANALÍTICAS - CORREGIDAS
-- =============================================

-- Vista para leaderboard global
CREATE OR REPLACE VIEW global_leaderboard_view AS
SELECT
    u.telegram_id,
    u.username,
    us.level,
    us.coins,
    us.total_taps,
    us.max_combo,
    RANK() OVER (ORDER BY us.coins DESC) as global_rank
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.coins > 0;

-- Vista para earnings de TON
CREATE OR REPLACE VIEW ton_earnings_view AS
SELECT
    u.telegram_id,
    u.username,
    u.ton_wallet_address,
    u.total_ton_earned,
    COUNT(tt.id) as total_transactions,
    SUM(CASE WHEN tt.status = 'completed' THEN tt.amount ELSE 0 END) as total_withdrawn
FROM users u
LEFT JOIN toncoin_transactions tt ON u.id = tt.user_id
GROUP BY u.id, u.telegram_id, u.username, u.ton_wallet_address, u.total_ton_earned;

-- Vista para marketplace activo
CREATE OR REPLACE VIEW active_marketplace_view AS
SELECT
    ml.id,
    u.username as seller,
    ml.item_type,
    ml.item_name,
    ml.price_coins,
    ml.price_ton,
    ml.quantity,
    ml.created_at
FROM marketplace_listings ml
JOIN users u ON ml.seller_id = u.id
WHERE ml.status = 'active'
ORDER BY ml.created_at DESC;

-- Vista para airdrops activos
CREATE OR REPLACE VIEW active_airdrops_view AS
SELECT
    ac.name,
    ac.description,
    ac.total_reward_pool,
    ac.reward_per_user,
    ac.end_date,
    COUNT(ap.id) as current_participants,
    (ac.participant_limit - COUNT(ap.id)) as slots_remaining
FROM airdrop_campaigns ac
LEFT JOIN airdrop_participants ap ON ac.id = ap.campaign_id
WHERE ac.is_active = true AND ac.end_date > NOW()
GROUP BY ac.id, ac.name, ac.description, ac.total_reward_pool, ac.reward_per_user,
ac.end_date, ac.participant_limit;

-- =============================================
-- DATOS INICIALES - SISTEMA COMPLETO
-- =============================================

-- EVOLUCIÓN ÉPICA DEL PANDA
INSERT INTO panda_evolution (level, level_name, required_coins, tap_multiplier, energy_capacity, special_abilities, description, rewards) VALUES
(1, 'Panda Bebé', 0, 1.0, 100, '["tap_basico"]', '¡Comienza tu aventura épica!', '{"coins": 100, "gems": 1}'),
(2, 'Panda Aprendiz', 1000, 1.3, 120, '["tap_basico", "recarga_rapida"]', 'Aprendiendo los secretos', '{"coins": 300, "gems": 3}'),
(3, 'Panda Guerrero', 5000, 1.7, 150, '["tap_basico", "recarga_rapida", "combo_boost"]', 'Poder en crecimiento', '{"coins": 1000, "gems": 5}'),
(4, 'Panda Maestro', 15000, 2.2, 180, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico"]', 'Dominio del tapping', '{"coins": 3000, "gems": 10}'),
(5, 'Panda Leyenda', 50000, 2.8, 220, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico", "ahorro_energia"]', 'Leyenda viviente', '{"coins": 10000, "gems": 20}'),
(6, 'Panda Épico', 150000, 3.5, 270, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico", "ahorro_energia", "doble_recompensa"]', 'Poderes épicos', '{"coins": 25000, "gems": 35}'),
(7, 'Panda Mítico', 500000, 4.3, 330, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico", "ahorro_energia", "doble_recompensa"]', 'Mitología viva', '{"coins": 50000, "gems": 50}'),
(8, 'Panda Divino', 1500000, 5.2, 400, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico", "ahorro_energia", "doble_recompensa", "mega_combo"]', 'Poder divino', '{"coins": 100000, "gems": 75}'),
(9, 'Panda Celestial', 5000000, 6.5, 500, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico", "ahorro_energia", "doble_recompensa", "mega_combo", "energia_ilimitada"]', 'Poder celestial', '{"coins": 250000, "gems": 100}'),
(10, 'Panda Cósmico', 15000000, 8.0, 650, '["tap_basico", "recarga_rapida", "combo_boost", "golpe_critico", "ahorro_energia", "doble_recompensa", "mega_combo", "energia_ilimitada", "modo_dios"]', '¡Controla el cosmos!', '{"coins": 500000, "gems": 200}')
ON CONFLICT (level) DO NOTHING;

-- SKINS LEGENDARIAS
INSERT INTO panda_skins (name, rarity, required_level, price_coins, price_gems, image_url, tap_multiplier, special_effect, particle_effect) VALUES
('Panda Básico', 'common', 1, 0, 0, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-basico.png', 1.0, 'none', 'none'),
('Panda Dorado', 'uncommon', 3, 5000, 0, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-dorado.png', 1.3, '+30% monedas', 'gold_sparks'),
('Panda de Hielo', 'rare', 5, 25000, 5, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-hielo.png', 1.7, 'Energía +20', 'ice_crystals'),
('Panda de Fuego', 'epic', 7, 100000, 20, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-fuego.png', 2.2, 'Combo x2.5', 'fire_embers'),
('Panda Eléctrico', 'legendary', 9, 500000, 50, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-electrico.png', 2.8, 'Golpes críticos', 'lightning_bolts'),
('Panda Cósmico', 'mythic', 10, 2000000, 100, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-cosmico.png', 3.5, 'Poder cósmico', 'cosmic_energy'),
('Panda Ninja', 'rare', 4, 15000, 3, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-ninja.png', 1.4, 'Tap silencioso', 'smoke_puffs'),
('Panda Samurái', 'epic', 6, 75000, 15, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-samurai.png', 1.9, 'Corte preciso', 'sword_slashes'),
('Panda Dragón', 'legendary', 8, 300000, 35, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-dragon.png', 2.5, 'Aliento de fuego', 'dragon_breath'),
('Panda Fantasma', 'mythic', 12, 3000000, 150, 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/skins/panda-fantasma.png', 4.0, 'Taps fantasmas', 'ghostly_wisp')
ON CONFLICT (name) DO NOTHING;

-- CARTAS PODEROSAS
INSERT INTO collectible_cards (card_name, card_type, rarity, image_url, description, effect_type, effect_value, effect_duration, max_uses) VALUES
('Boost de Tap', 'boost', 'common', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/boost-tap.png', 'Aumenta potencia de taps', 'tap_boost', 2.0, 300, 5),
('Ahorro de Energía', 'boost', 'uncommon', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/ahorro-energia.png', 'Reduce consumo energía', 'energy_save', 0.3, 600, 3),
('Combo Dorado', 'ability', 'rare', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/combo-dorado.png', 'Aumenta multiplicador combo', 'combo_boost', 3.0, 180, 2),
('Suerte Crítica', 'special', 'epic', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/suerte-critica.png', 'Más probabilidad crítico', 'critical_chance', 0.25, 900, 1),
('Doble Recompensa', 'special', 'legendary', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/doble-recompensa.png', 'Duplica recompensas', 'double_reward', 1.0, 120, 1),
('Energía Ilimitada', 'boost', 'mythic', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/energia-ilimitada.png', 'Energía infinita temporal', 'unlimited_energy', 1.0, 300, 1),
('Multiplicador x5', 'boost', 'epic', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/multiplicador-x5.png', 'Quintuplica ganancias', 'multiplier', 5.0, 120, 2),
('Protector de Combo', 'ability', 'rare', 'https://vrbxeerfvoaukcopydpt.supabase.co/storage/v1/object/public/assets/cards/protector-combo.png', 'Combo no se rompe', 'combo_protector', 1.0, 300, 3)
ON CONFLICT DO NOTHING;

-- LOGROS ÉPICOS
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, reward_coins, reward_gems, is_secret, achievement_tier) VALUES
('Primeros Pasos', '10 taps', 'tapping', 'total_taps', 10, 100, 1, false, 'bronze'),
('Tapper Novato', '100 taps', 'tapping', 'total_taps', 100, 500, 5, false, 'bronze'),
('Combo Maestro', 'Combo de 50', 'tapping', 'max_combo', 50, 2000, 10, false, 'gold'),
('Coleccionista', 'Primera skin', 'collection', 'skins_owned', 1, 1000, 5, false, 'bronze'),
('Nivel 10', 'Alcanza nivel 10', 'progression', 'level', 10, 10000, 25, false, 'gold'),
('Rico y Poderoso', '100,000 coins', 'progression', 'coins', 100000, 5000, 20, false, 'silver'),
('Leyenda Panda', 'Nivel 20', 'progression', 'level', 20, 50000, 50, false, 'platinum'),
('Millonario Panda', '1,000,000 coins', 'progression', 'coins', 1000000, 100000, 100, true, 'diamond'),
('Maestro de Combos', 'Combo de 100', 'tapping', 'max_combo', 100, 50000, 75, false, 'platinum'),
('Dios del Tapping', '50,000 taps', 'tapping', 'total_taps', 50000, 200000, 300, true, 'mythic')
ON CONFLICT DO NOTHING;

-- MISIONES DIARIAS
INSERT INTO daily_missions (mission_type, description, requirement_value, reward_coins, reward_gems, mission_difficulty) VALUES
('daily_taps', '100 taps hoy', 100, 500, 2, 'easy'),
('daily_combo', 'Combo de 20', 20, 800, 3, 'medium'),
('daily_energy', 'Gasta 150 energía', 150, 600, 2, 'medium'),
('daily_level', 'Sube 1 nivel', 1, 1000, 5, 'hard'),
('daily_skin', 'Usa 2 skins', 2, 700, 3, 'easy'),
('daily_clan', 'Contribuye 1000 coins', 1000, 1200, 6, 'hard')
ON CONFLICT DO NOTHING;

-- CONFIGURACIÓN DEL JUEGO
INSERT INTO game_config (key, value, description) VALUES
('energy_config', '{"regen_rate": 1, "regen_interval_seconds": 60, "max_energy": 100}', 'Sistema de energía'),
('tap_config', '{"base_reward": 1, "base_experience": 1, "combo_timeout_seconds": 3}', 'Sistema de tapping'),
('level_config', '{"base_exp_required": 100, "exp_growth_factor": 1.5, "max_level": 50}', 'Sistema de niveles'),
('economy_config', '{"referral_bonus": 1000, "daily_login_bonus": 100, "achievement_multiplier": 1.2}', 'Configuración económica'),
('toncoin_config', '{"weekly_prize_pool": 5.0, "owner_rake_percent": 15.0, "min_withdrawal": 0.1}', 'Configuración Toncoin'),
('airdrop_config', '{"daily_limit": 10, "task_reward_base": 100, "ton_reward_chance": 0.1}', 'Configuración Airdrops'),
('marketplace_config', '{"transaction_fee": 5.0, "max_listings": 10, "trade_cooldown_hours": 24}', 'Configuración Mercado'),
('roulette_config', '{"daily_spins": 1, "premium_spins": 3, "jackpot_chance": 0.01}', 'Configuración Ruleta')
ON CONFLICT (key) DO NOTHING;

-- EVENTOS SEMANALES CON TONCOIN (EJEMPLO)
INSERT INTO weekly_events (name, description, start_date, end_date, total_prize_pool, owner_rake_percent, participant_limit, entry_requirement) VALUES
('Torneo Semanal TON', '¡Gana Toncoin real! Top 3 reciben premios', NOW(), NOW() + INTERVAL '7 days', 2.0, 15.0, 1000, 'Nivel 5+'),
('Carrera de Clanes TON', 'Clanes compiten por Toncoin', NOW(), NOW() + INTERVAL '7 days', 1.5, 15.0, 500, 'Clan nivel 2+')
ON CONFLICT DO NOTHING;

-- CAMPAÑAS DE AIRDROP (EJEMPLO)
INSERT INTO airdrop_campaigns (name, description, total_reward_pool, reward_per_user, participant_limit, start_date, end_date, requirements) VALUES
('Lanzamiento Oficial', '¡Airdrop de lanzamiento! Completa tareas para ganar', 1000000, 5000, 5000, NOW(), NOW() + INTERVAL '30 days', '{"min_level": 1, "verified_wallet": false}'),
('Evento Telegram', 'Únete a nuestros canales', 500000, 2000, 2000, NOW(), NOW() + INTERVAL '14 days', '{"min_level": 3, "verified_wallet": true}')
ON CONFLICT DO NOTHING;

-- TAREAS DE AIRDROP (EJEMPLO)
INSERT INTO airdrop_tasks (campaign_id, task_type, task_description, reward_coins, reward_ton, verification_url) VALUES
((SELECT id FROM airdrop_campaigns WHERE name = 'Lanzamiento Oficial'), 'join_telegram', 'Únete al canal oficial de Telegram', 1000, 0.001, 'https://t.me/cryptopanda'),
((SELECT id FROM airdrop_campaigns WHERE name = 'Lanzamiento Oficial'), 'join_twitter', 'Síguenos en Twitter/X', 800, 0.0005, 'https://twitter.com/cryptopanda'),
((SELECT id FROM airdrop_campaigns WHERE name = 'Lanzamiento Oficial'), 'invite_friends', 'Invita 3 amigos', 2000, 0.002, NULL),
((SELECT id FROM airdrop_campaigns WHERE name = 'Lanzamiento Oficial'), 'watch_ad', 'Mira un anuncio', 500, 0.0001, NULL),
((SELECT id FROM airdrop_campaigns WHERE name = 'Lanzamiento Oficial'), 'daily_login', 'Inicia sesión 7 días seguidos', 3000, 0.003, NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- =============================================

-- Usuarios
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_ton_wallet ON users(ton_wallet_address) WHERE ton_wallet_address IS NOT NULL;
CREATE INDEX idx_users_login_streak ON users(login_streak DESC);

-- Estadísticas
CREATE INDEX idx_user_stats_coins ON user_stats(coins DESC);
CREATE INDEX idx_user_stats_level ON user_stats(level DESC);
CREATE INDEX idx_user_stats_taps ON user_stats(total_taps DESC);

-- Leaderboards
CREATE INDEX idx_leaderboards_period ON leaderboards(period_type, period_date, score DESC);

-- Torneos
CREATE INDEX idx_tournaments_active ON tournaments(is_active, start_time, end_time);

-- Marketplace
CREATE INDEX idx_marketplace_active ON marketplace_listings(status, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_marketplace_price_coins ON marketplace_listings(price_coins) WHERE status = 'active';
CREATE INDEX idx_marketplace_price_ton ON marketplace_listings(price_ton) WHERE status = 'active';

-- Airdrops
CREATE INDEX idx_airdrop_active ON airdrop_campaigns(is_active, end_date DESC);
CREATE INDEX idx_airdrop_participants ON airdrop_participants(campaign_id, user_id);

-- Eventos semanales
CREATE INDEX idx_weekly_events_active ON weekly_events(is_active, end_date DESC);
CREATE INDEX idx_event_participants_score ON event_participants(event_id, score DESC);

-- Transacciones Toncoin
CREATE INDEX idx_toncoin_transactions_user ON toncoin_transactions(user_id, created_at DESC);
CREATE INDEX idx_toncoin_transactions_status ON toncoin_transactions(status) WHERE status = 'pending';

-- =============================================
-- FUNCIONES Y TRIGGERS AVANZADOS - CORREGIDOS
-- =============================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON user_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clans_updated_at
BEFORE UPDATE ON clans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER marketplace_sale_processed
AFTER UPDATE ON marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION process_marketplace_sale();

-- =============================================
-- VISTAS PARA ANALÍTICAS - CORREGIDAS
-- =============================================

CREATE OR REPLACE VIEW global_leaderboard_view AS
SELECT
    u.telegram_id,
    u.username,
    us.level,
    us.coins,
    us.total_taps,
    us.max_combo,
    RANK() OVER (ORDER BY us.coins DESC) as global_rank
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.coins > 0;

CREATE OR REPLACE VIEW ton_earnings_view AS
SELECT
    u.telegram_id,
    u.username,
    u.ton_wallet_address,
    u.total_ton_earned,
    COUNT(tt.id) as total_transactions,
    SUM(CASE WHEN tt.status = 'completed' THEN tt.amount ELSE 0 END) as total_withdrawn
FROM users u
LEFT JOIN toncoin_transactions tt ON u.id = tt.user_id
GROUP BY u.id, u.telegram_id, u.username, u.ton_wallet_address, u.total_ton_earned;

CREATE OR REPLACE VIEW active_marketplace_view AS
SELECT
    ml.id,
    u.username as seller,
    ml.item_type,
    ml.item_name,
    ml.price_coins,
    ml.price_ton,
    ml.quantity,
    ml.created_at
FROM marketplace_listings ml
JOIN users u ON ml.seller_id = u.id
WHERE ml.status = 'active'
ORDER BY ml.created_at DESC;

CREATE OR REPLACE VIEW active_airdrops_view AS
SELECT
    ac.name,
    ac.description,
    ac.total_reward_pool,
    ac.reward_per_user,
    ac.end_date,
    COUNT(ap.id) as current_participants,
    (ac.participant_limit - COUNT(ap.id)) as slots_remaining
FROM airdrop_campaigns ac
LEFT JOIN airdrop_participants ap ON ac.id = ap.campaign_id
WHERE ac.is_active = true AND ac.end_date > NOW()
GROUP BY ac.id, ac.name, ac.description, ac.total_reward_pool, ac.reward_per_user, ac.end_date, ac.participant_limit;

