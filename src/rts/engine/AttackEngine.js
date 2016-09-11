
class AttackEngine {

    applyAttack = (unit, target) => {
        const damage = unit.specs.weapon.damage - target.specs.armor;

        if (damage <= 0) {
            return false;
        }

        const targetHealth = target.healtLeftFactor * target.specs.maxHealth - damage;

        target.healtLeftFactor = targetHealth / target.specs.maxHealth;

        return targetHealth <= 0;
    }
}

export default new AttackEngine();
