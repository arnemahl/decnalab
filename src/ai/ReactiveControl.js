import Vectors from '~/rts/spatial/Vectors';
import {isIdle} from '~/rts/commandable/Commandable';

export default class ReactiveControl {

    constructor(team, map) {
        this.team = team;
        this.map = map;
    }

    attackWith = (units) => {
        const idleUnits = units.filter(isIdle);
        const position = this.getStartingPositionOfOtherTeam();

        console.log('attacking with units', units.length);

        idleUnits
            .filter(this.isCloseTo(position))
            .forEach(this.aMove(position));
    }

    getStartingPositionOfOtherTeam() {
        return this.map.startingPositions[this.getIndexOfOtherTeam()];
    }

    getIndexOfOtherTeam() {
        switch (this.team.index) {
            case 0:
                return 1;
            case 1:
                return 0;
        }
    }

    isCloseTo = (position) => (unit) => {
        return Vectors.absoluteDistance(unit.position, position) < 50;
    }

    aMove = (position) => (unit) => {
        unit.getCommander().attackMove(position);
    }

}
