import Vectors from '~/rts/spatial/Vectors';

export const byClosenessTo = (position) => (one, two) => Vectors.absoluteDistance(position, one.position) - Vectors.absoluteDistance(position, two.position);

export const getClosestEnemyUnitWithinRange = (unit) => unit.team.visibleEnemyCommandables
    .filter(commandable => commandable.type === 'unit')
    .filter(enemyUnit => Vectors.absoluteDistance(unit.position, enemyUnit.position) <= unit.specs.weapon.range)
    .sort(byClosenessTo(unit.position))
    [0];

const getClosestEnemy = (unit) => unit.team.visibleEnemyCommandables.sort(byClosenessTo(unit.position))[0];

export default getClosestEnemy;
