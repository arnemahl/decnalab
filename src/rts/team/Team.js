import Vectors from '~/rts/spatial/Vectors';
import {isBaseStructure} from '~/rts/structures/BaseStructure';

export default class Team {

    constructor(game, {StructureStats, UnitStats, structures, units, resources}) {
        this.game = game;
        this.StructureStats = StructureStats;
        this.UnitStats = UnitStats;
        this.structures = structures;
        this.units = units;
        this.resources = resources;

        units.forEach(unit => {
            unit.team = this;
            unit.game = game;
        });
        // structures.forEach(structure => structure.team = this);
    }

    getClosestBaseStructure = (fromPosition) => {
        const distanceTo = baseStructure => Vectors.absoluteDistance(fromPosition, baseStructure.position);

        return (
            this.structures
                .filter(isBaseStructure)
                .sort((one, two) => distanceTo(one) - distanceTo(two))
                [0]
        );
    }



    // moveUnit = (unit, targetLocation) => {
    //     unit.currentSpeed = Vectors.direction(unit.position, targetPosition, unit.stats.speed);
    // }



}
