export class SupabaseService {
    constructor() {
        this.supabase = window.supabase;
        console.log('✅ SupabaseService inicializado');
    }

    // ==================== USUARIOS ====================
    async getUserByTelegramId(telegramId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();
            
            if (error && error.code === 'PGRST116') {
                return { data: null, error: null }; // Usuario no encontrado
            }
            
            return { data, error };
        } catch (error) {
            console.error('Error en getUserByTelegramId:', error);
            return { data: null, error };
        }
    }

    async createUser(userData) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .insert([{
                    telegram_id: userData.telegram_id,
                    username: userData.username,
                    first_name: userData.first_name,
                    language_code: userData.language_code,
                    created_at: new Date().toISOString(),
                    last_active: new Date().toISOString()
                }])
                .select()
                .single();

            if (data && !error) {
                // Crear estadísticas iniciales para el usuario
                await this.createUserStats(data.id);
            }
            
            return { data, error };
        } catch (error) {
            console.error('Error en createUser:', error);
            return { data: null, error };
        }
    }

    async createUserStats(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_stats')
                .insert([{
                    user_id: userId,
                    level: 1,
                    coins: 100, // Monedas iniciales
                    energy: 100,
                    max_energy: 100,
                    tap_power: 1.0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
            
            return { data, error };
        } catch (error) {
            console.error('Error creando user_stats:', error);
            return { data: null, error };
        }
    }

    async updateUserLastActive(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .update({ 
                    last_active: new Date().toISOString() 
                })
                .eq('id', userId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en updateUserLastActive:', error);
            return { data: null, error };
        }
    }

    // ==================== ESTADÍSTICAS ====================
    async getUserStats(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            return { data, error };
        } catch (error) {
            console.error('Error en getUserStats:', error);
            return { data: null, error };
        }
    }

    async updateUserStats(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('user_stats')
                .update(updates)
                .eq('user_id', userId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en updateUserStats:', error);
            return { data: null, error };
        }
    }

    // ==================== SKINS ====================
    async getAvailableSkins() {
        try {
            const { data, error } = await this.supabase
                .from('panda_skins')
                .select('*')
                .order('price_coins', { ascending: true });
            
            return { data, error };
        } catch (error) {
            console.error('Error en getAvailableSkins:', error);
            return { data: null, error };
        }
    }

    async getUserSkins(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_skins')
                .select(`
                    id,
                    unlocked_at,
                    is_equipped,
                    uses_count,
                    panda_skins (*)
                `)
                .eq('user_id', userId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en getUserSkins:', error);
            return { data: null, error };
        }
    }

    async equipSkin(userId, skinId) {
        try {
            // Primero, desequipar todas las skins del usuario
            await this.supabase
                .from('user_skins')
                .update({ is_equipped: false })
                .eq('user_id', userId);

            // Luego, equipar la skin deseada
            const { data, error } = await this.supabase
                .from('user_skins')
                .update({ is_equipped: true })
                .eq('user_id', userId)
                .eq('skin_id', skinId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en equipSkin:', error);
            return { data: null, error };
        }
    }

    async buySkin(userId, skinId, price) {
        try {
            // 1. Verificar que el usuario tiene suficientes monedas
            const { data: stats } = await this.getUserStats(userId);
            if (!stats || stats.coins < price) {
                return false;
            }

            // 2. Restar las monedas
            await this.updateUserStats(userId, {
                coins: stats.coins - price
            });

            // 3. Añadir la skin al usuario
            const { error } = await this.supabase
                .from('user_skins')
                .insert([
                    { 
                        user_id: userId, 
                        skin_id: skinId,
                        unlocked_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                // Revertir la compra si hay error
                await this.updateUserStats(userId, {
                    coins: stats.coins
                });
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error en buySkin:', error);
            return false;
        }
    }

    // ==================== CLANES ====================
    async getClans() {
        try {
            const { data, error } = await this.supabase
                .from('clans')
                .select('*')
                .eq('is_public', true)
                .order('level', { ascending: false });
            
            return { data, error };
        } catch (error) {
            console.error('Error en getClans:', error);
            return { data: null, error };
        }
    }

    async getUserClan(userId) {
        try {
            const { data, error } = await this.supabase
                .from('clan_members')
                .select(`
                    clan_id,
                    role,
                    clans (*)
                `)
                .eq('user_id', userId)
                .single();
            
            return { data, error };
        } catch (error) {
            console.error('Error en getUserClan:', error);
            return { data: null, error };
        }
    }

    // ==================== CARTAS ====================
    async getCollectibleCards() {
        try {
            const { data, error } = await this.supabase
                .from('collectible_cards')
                .select('*')
                .order('rarity', { ascending: false });
            
            return { data, error };
        } catch (error) {
            console.error('Error en getCollectibleCards:', error);
            return { data: null, error };
        }
    }

    async getUserCards(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_cards')
                .select(`
                    id,
                    quantity,
                    is_active,
                    acquired_at,
                    last_used,
                    uses_remaining,
                    collectible_cards (*)
                `)
                .eq('user_id', userId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en getUserCards:', error);
            return { data: null, error };
        }
    }

    // ==================== LOGROS ====================
    async getAchievements() {
        try {
            const { data, error } = await this.supabase
                .from('achievements')
                .select('*')
                .order('requirement_value', { ascending: true });
            
            return { data, error };
        } catch (error) {
            console.error('Error en getAchievements:', error);
            return { data: null, error };
        }
    }

    async getUserAchievements(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_achievements')
                .select(`
                    id,
                    unlocked_at,
                    progress_current,
                    progress_target,
                    is_completed,
                    completed_at,
                    achievements (*)
                `)
                .eq('user_id', userId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en getUserAchievements:', error);
            return { data: null, error };
        }
    }

    // ==================== TAPPING ====================
    async recordTap(userId, tapData) {
        try {
            const { data, error } = await this.supabase
                .from('user_stats')
                .update({
                    total_taps: tapData.totalTaps,
                    coins: tapData.coins,
                    energy: tapData.energy,
                    last_energy_update: new Date().toISOString()
                })
                .eq('user_id', userId);
            
            return { data, error };
        } catch (error) {
            console.error('Error en recordTap:', error);
            return { data: null, error };
        }
    }
}
