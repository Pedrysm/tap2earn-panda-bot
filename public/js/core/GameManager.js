export class GameManager {
    constructor() {
        this.userId = null;
        this.userStats = null;
        this.supabaseService = null;
        this.energyInterval = null;
        console.log('✅ GameManager inicializado');
    }

    async initialize(userId) {
        this.userId = userId;
        this.supabaseService = window.supabaseService;
        
        await this.loadUserStats();
        this.startEnergyRegeneration();
        
        console.log('✅ GameManager configurado para usuario:', userId);
    }

    async loadUserStats() {
        if (!this.supabaseService) {
            console.error('SupabaseService no disponible');
            return;
        }

        const { data, error } = await this.supabaseService.getUserStats(this.userId);
        if (error) {
            console.error('Error cargando estadísticas:', error);
            return;
        }
        
        this.userStats = data;
        console.log('✅ Estadísticas de usuario cargadas:', this.userStats);
    }

    startEnergyRegeneration() {
        // Limpiar intervalo anterior si existe
        if (this.energyInterval) {
            clearInterval(this.energyInterval);
        }

        // Regenerar energía cada minuto
        this.energyInterval = setInterval(async () => {
            if (!this.userStats) return;

            const now = new Date();
            const lastUpdate = new Date(this.userStats.last_energy_update);
            const diffMinutes = (now - lastUpdate) / (1000 * 60);

            if (diffMinutes >= 1) {
                const energyToAdd = Math.floor(diffMinutes); // 1 energía por minuto
                const newEnergy = Math.min(this.userStats.max_energy, this.userStats.energy + energyToAdd);

                if (newEnergy !== this.userStats.energy) {
                    this.userStats.energy = newEnergy;
                    this.userStats.last_energy_update = now.toISOString();

                    // Actualizar en Supabase
                    await this.supabaseService.updateUserStats(this.userId, {
                        energy: this.userStats.energy,
                        last_energy_update: this.userStats.last_energy_update
                    });

                    console.log(`🔋 Energía regenerada: ${this.userStats.energy}/${this.userStats.max_energy}`);
                }
            }
        }, 60000); // Verificar cada minuto
    }

    // Métodos de utilidad
    getCurrentEnergy() {
        return this.userStats ? this.userStats.energy : 0;
    }

    getMaxEnergy() {
        return this.userStats ? this.userStats.max_energy : 100;
    }

    getCoins() {
        return this.userStats ? this.userStats.coins : 0;
    }

    getLevel() {
        return this.userStats ? this.userStats.level : 1;
    }

    getTapPower() {
        return this.userStats ? this.userStats.tap_power : 1.0;
    }

    // Limpieza
    destroy() {
        if (this.energyInterval) {
            clearInterval(this.energyInterval);
            this.energyInterval = null;
        }
    }
}
