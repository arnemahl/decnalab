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

function getAllUnitsAndStructuresInViewRange(unit, enemyTeam) {
    const viewedUnits = calculateViewedThings(unit, enemyTeam.units);
    const viewedStructures = calculateViewedThings(unit, enemyTeam.structures);

    return {
        seesAny: viewedUnits.length > 0 || viewedStructures.length > 0,
        units: viewedUnits,
        structures: viewedStructures
    };
}

class TeamVisionHelper {

    getViewsForEachTeam({blueTeam, redTeam}) {
        const blueVision = {
            units: [],
            structures: []
        };
        const redVision = {
            units: [],
            structures: []
        };

        const unseenRed = {
            units: redTeam.units,
            structures: redTeam.structures
        };

        blueTeam.units.forEach(blueUnit => {
            const blueUnitVision = getAllUnitsAndStructuresInViewRange(blueUnit, unseenRed);

            if (blueUnitVision.seesAny) {
                // Update vision
                redVision.units.push(blueUnit);
                blueVision.units.push(blueUnitVision.units);
                blueVision.structures.push(blueUnitVision.structures);

                // Filter unseen
                unseenRed.units = unseenRed.units.filter(redUnit => blueUnitVision.units.indexOf(redUnit) === -1);
                unseenRed.structures = unseenRed.structures.filter(redStructure => blueUnitVision.structures.indexOf(redStructure) === -1);
            }
        });

        blueTeam.structures.forEach(blueStructure => {
            const blueStructureVision = getAllUnitsAndStructuresInViewRange(blueStructure, unseenRed);

            if (blueStructureVision.seesAny) {
                // Update vision
                redVision.structures.push(blueStructure);
                blueVision.units.push(blueStructureVision.units);
                blueVision.structures.push(blueStructureVision.structures);

                // Filter unseen
                unseenRed.units = unseenRed.units.filter(redUnit => blueStructureVision.units.indexOf(redUnit) === -1);
                unseenRed.structures = unseenRed.structures.filter(redStructure => blueStructureVision.structures.indexOf(redStructure) === -1);
            }
        });

        return {red: redVision, blue: blueVision};
    }
}

export default new TeamVisionHelper();
