import * as Directions from '~/rts/spatial/Directions';

export default class Team {
    resources = {
        abundant: 50,
        sparse: 0
    }

    constructor({startingPosition, structures, units}) {
        this.startingPosition = startingPosition;
        this.structures = structures;
        this.units = units;
    }
}
