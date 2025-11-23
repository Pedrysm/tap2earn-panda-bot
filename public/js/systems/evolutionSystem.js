// Sistema avanzado de evolución de pandas
class EvolutionSystem {
    constructor() {
        this.levels = [];
        this.currentLevel = 1;
        this.evolutionProgress = 0;
        this.unlockedAbilities = [];
        this.loadEvolutionData();
    }

    async loadEvolutionData() {
        try {
            const response = await fetch('/api/evolution/levels');
            this.levels = await response.json();
            this.initializeEvolutionUI();
        } catch (error) {
            console.error('Error loading evolution data:', error);
        }
    }

    initializeEvolutionUI() {
        this.updateEvolutionDisplay();
        this.setupEvolutionEvents();
    }

    updateEvolutionDisplay() {
        const currentLevelData = this.getCurrentLevelData();
        const nextLevelData = this.getNextLevelData();

        if (currentLevelData) {
            document.getElementById('playerLevel').textContent = currentLevelData.level;
            this.updateLevelBadge(currentLevelData.level);
            this.updateAbilitiesDisplay(currentLevelData.abilities);
        }

        if (nextLevelData) {
            this.updateEvolutionProgress(nextLevelData);
        }
    }

    getCurrentLevelData() {
        return this.levels.find(level => level.level === this.currentLevel);
    }

    getNextLevelData() {
        return this.levels.find(level => level.level === this.currentLevel + 1);
    }

    updateEvolutionProgress(nextLevelData) {
        const currentCoins = window.gameState.coins;
        const requiredCoins = nextLevelData.required_coins;
        this.evolutionProgress = Math.min((currentCoins / requiredCoins) * 100, 100);

        const progressBar = document.getElementById('evolutionProgress');
        if (progressBar) {
            progressBar.style.width = this.evolutionProgress + '%';
        }

        // Actualizar texto de progreso
        const progressText = document.getElementById('evolutionProgressText');
        if (progressText) {
            progressText.textContent = 
                `${currentCoins.toLocaleString()}/${requiredCoins.toLocaleString()} $PANDA`;
        }
    }

    updateLevelBadge(level) {
        const levelBadge = document.getElementById('playerLevel');
        levelBadge.className = `level-badge level-${level}`;
        
        // Agregar clases específicas por nivel para estilos diferentes
        const levelClasses = {
            1: 'level-basic',
            2: 'level-bronze',
            3: 'level-silver', 
            4: 'level-gold',
            5: 'level-platinum',
            6: 'level-diamond',
            7: 'level-master',
            8: 'level-grandmaster',
            9: 'level-champion',
            10: 'level-legend'
        };
        
        levelBadge.classList.add(levelClasses[level] || 'level-basic');
    }

    updateAbilitiesDisplay(abilities) {
        const abilitiesContainer = document.getElementById('currentAbilities');
        if (!abilitiesContainer) return;

        abilitiesContainer.innerHTML = abilities
            .map(ability => `
                <div class="ability-item ${ability.unlocked ? 'unlocked' : 'locked'}">
                    <span class="ability-icon">${this.getAbilityIcon(ability.type)}</span>
                    <span class="ability-name">${ability.name}</span>
                    <span class="ability-desc">${ability.description}</span>
                </div>
            `).join('');
    }

    getAbilityIcon(abilityType) {
        const icons = {
            'tap_boost': '👆',
            'energy_boost': '⚡',
            'combo_boost': '🔥',
            'critical_chance': '🎯',
            'double_reward': '💰',
            'energy_save': '🛡️'
        };
        return icons[abilityType] || '❓';
    }

    setupEvolutionEvents() {
        document.addEventListener('coinsUpdated', () => {
            this.updateEvolutionProgress(this.getNextLevelData());
            this.checkEvolutionAvailability();
        });
    }

    checkEvolutionAvailability() {
        const nextLevel = this.getNextLevelData();
        const canEvolve = nextLevel && window.gameState.coins >= nextLevel.required_coins;
        
        const evolveBtn = document.getElementById('evolveButton');
        if (evolveBtn) {
            evolveBtn.disabled = !canEvolve;
            evolveBtn.classList.toggle('available', canEvolve);
        }
    }

    async evolve() {
        const nextLevel = this.getNextLevelData();
        if (!nextLevel || window.gameState.coins < nextLevel.required_coins) {
            return false;
        }

        try {
            const response = await fetch('/api/evolution/evolve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: window.gameState.userId,
                    currentLevel: this.currentLevel,
                    targetLevel: nextLevel.level
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.currentLevel = result.newLevel;
                this.unlockedAbilities = result.unlockedAbilities;
                
                // Actualizar estado del juego
                window.gameState.coins -= nextLevel.required_coins;
                window.gameState.level = this.currentLevel;
                
                // Disparar evento de evolución
                this.triggerEvolutionEvent(result);
                
                return true;
            }
        } catch (error) {
            console.error('Evolution error:', error);
        }
        
        return false;
    }

    triggerEvolutionEvent(evolutionData) {
        // Mostrar animación de evolución
        this.showEvolutionAnimation(evolutionData);
        
        // Actualizar UI
        this.updateEvolutionDisplay();
        
        // Notificar otros sistemas
        window.dispatchEvent(new CustomEvent('playerEvolved', {
            detail: evolutionData
        }));
    }

    showEvolutionAnimation(evolutionData) {
        const animationContainer = document.createElement('div');
        animationContainer.className = 'evolution-animation';
        animationContainer.innerHTML = `
            <div class="evolution-light-beam"></div>
            <div class="evolution-particles"></div>
            <div class="evolution-text">
                <h2>¡EVOLUCIÓN COMPLETADA!</h2>
                <p>Nivel ${evolutionData.newLevel} Desbloqueado</p>
                <div class="new-abilities">
                    ${evolutionData.unlockedAbilities.map(ability => `
                        <div class="new-ability">${ability}</div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(animationContainer);
        
        // Remover después de la animación
        setTimeout(() => {
            animationContainer.remove();
        }, 5000);
    }

    getEvolutionMultiplier() {
        const baseMultiplier = 1.0;
        const levelMultiplier = this.currentLevel * 0.1; // 10% por nivel
        return baseMultiplier + levelMultiplier;
    }
}

// Exportar el sistema
window.EvolutionSystem = EvolutionSystem;
export default EvolutionSystem;
