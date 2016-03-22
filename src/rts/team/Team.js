import Vectors from '~/rts/spatial/Vectors';
import {isBaseStructure} from '~/rts/structures/BaseStructure';

export default class Team {

    constructor({StructureStats, UnitStats, structures, units, resources}) {
        this.StructureStats = StructureStats;
        this.UnitStats = UnitStats;
        this.structures = structures;
        this.units = units;
        this.resources = resources;
    }

    getClosestBaseStructure = (fromPosition) => {
        const distanceTo = baseStructure => Vectors.absoluteDistance(fromPosition, baseStructure.position);

        return (
            this.structures
                .filter(isBaseStructure)
                .sort((one, two) => distanceTo(one) - distanceTo(two))
                .find(any => any)
        );
    }
}
