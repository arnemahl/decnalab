import Vectors from '~/rts/spatial/Vectors';

import UnitStats from '~/rts/units/UnitStats';
import StructureStats from '~/rts/structure/StructureStats';

import {isBaseStructure} from '~/rts/structures/BaseStructure';


export default class Team {

    units = {}
    structures = {}

    constructor(id, game, startingResources) {
        this.id = id;
        this.game = game;
        this.resources = startingResources;

        this.structureStats = new StructureStats();
        this.unitStats = new UnitStats();
    }

    addUnit = (unit) => {
        unit.team = this;
        this.units[unit.id] = unit;
    }

    addStructure = (structure) => {
        structure.team = this;
        this.structures[structure.id] = structure;
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



}
