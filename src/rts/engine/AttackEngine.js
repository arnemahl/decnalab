
class AttackEngine {

    applyAttack = (unit, target) => {
        const damage = unit.specs.weapon.damage - target.specs.armor;

        if (damage <= 0) {
            return false;
        }

        const targetHealth = target.healthLeftFactor * target.specs.maxHealth - damage;

        target.healthLeftFactor = targetHealth / target.specs.maxHealth;

        return targetHealth <= 0;
    }
}

export default new AttackEngine();
