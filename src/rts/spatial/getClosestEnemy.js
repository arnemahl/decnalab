import Vectors from '~/rts/spatial/Vectors';

export const byClosenessTo = (position) => (one, two) => Vectors.absoluteDistance(position, one.position) - Vectors.absoluteDistance(position, two.position);

const getClosestEnemy = (unit) => unit.team.visibleEnemyCommandables.sort(byClosenessTo(unit.position))[0];

export default getClosestEnemy;
