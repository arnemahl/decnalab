const maxDecimals = (decimals, number) => Number((number).toFixed(decimals));

class AttackEngine {

    applyAttack = (unit, target) => {
        const damage = unit.specs.weapon.damage - target.specs.armor;

        if (damage <= 0) {
            return false;
        }

        const targetHealth = Math.round(target.healthLeftFactor * target.specs.maxHealth - damage); // Round to int

        target.healthLeftFactor = maxDecimals(10, targetHealth / target.specs.maxHealth); // Mitigate inaccurate binary representation

        return targetHealth <= 0;
    }
}

export default new AttackEngine();
