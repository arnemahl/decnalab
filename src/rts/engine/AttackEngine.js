
class AttackEngine {

    applyAttack = (unit, target) => {
        const damage = unit.stats.weapon.damage - target.stats.armor;

        if (damage <= 0) {
            return false;
        }

        const targetHealth = target.healtLeftFactor * target.stats.maxHealth - damage;

        target.healtLeftFactor = targetHealth / target.stats.maxHealth;

        return targetHealth <= 0;
    }
}

export default new AttackEngine();
