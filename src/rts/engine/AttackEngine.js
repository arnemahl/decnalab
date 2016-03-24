
class AttackEngine {

    applyAttack = (unit, target) => {
        const damage = Math.max(0, unit.stats.weapon.damage - target.stats.armor);

        target.health -= damage;
    }
}

export default new AttackEngine();
