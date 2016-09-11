function calculateDistance(a, b) {
    const {x: ax, y: ay} = a.position;
    const {x: bx, y: by} = b.position;

    return Math.sqrt(
        Math.pow(ax - bx + b.radius),
        Math.pow(ay - by + b.radius)
    );
}

function canView(unit, thing) {
    return calculateDistance(unit, thing) <= unit.viewRange;
}

function calculateViewedThings(unit, things) {
    return things.reduce(
        (viewedThings, thing) => canView(unit, thing) && viewedThings.push(thing),
        []
    );
}

function canViewEnemyTeam(unit, enemyTeam) {
    const viewedUnits = calculateViewedThings(unit, enemyTeam.units);
    const viewedStructures = calculateViewedThings(unit, enemyTeam.structures);

    return {
        any: viewedUnits.length > 0 || viewedStructures.length > 0,
        viewedUnits,
        viewedStructures
    };
}

// @deprecated: Should not be used until adding different viewRange for different units/structures
class UnitViewHelper {
    getUnitViews(team, enemyTeam) {

        return team.units.reduce((result, unit) => {
            result[unit.id] = canViewEnemyTeam(unit, enemyTeam);
        }, {});
    }
}

export default new UnitViewHelper();
