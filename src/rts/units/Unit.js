import Vectors from '~/rts/spatial/Vectors';
import {generateUnitId} from '~/rts/units/UnitIdGenerator';

class SafeUnitCommander {
    constructor(unit) {
        ['move', 'attack'].forEach(command => {
            this[command] = unit[command].bind(unit);
        });
        this.unitType = unit.constructor.name;
    }
}

export default class Unit {

    constructor(stats, position, team) {
        this.id = generateUnitId();
        this.team = team;

        this.stats = stats;
        this.position = position;

        this.currentCommand = false;
        this.isIdle = true;

        const {
            moveTo,
            attack
        } = this;

        this.callableActions = {
            moveTo,
            attack
        };
    }

    getSafeCommander = () => {
        return this.safeCommander || (this.safeCommander = new SafeUnitCommander(this));
    }

    tick = () => {
        if (this.isIdle) {
            return false;
        }

        if (this.actions.length === 0) {
            this.error(`has no actions but is not idle`);
        }

        const action = this.actions.pop();
        const fn = this[action.type];

        if (!fn) {
            this.error(`has no method for "${action.type}`);
        }

        fn(action.props);
    }

    error(message) {
        throw `${this.constructor.name} (${this.id}) ${message}`;
    }

    isAt(somePosition) {
        return Vectors.distance(this.position, somePosition) < 50;
    }

    moveTo(targetPosition) {
        return new Promise((resolve, reject) => {
            if (this.isAt(targetPosition)) {
                resolve();
            } else {
                // this.currentSpeed = Vectors.direction(this.position, targetPosition, this.stats.speed);
                // this.command = {
                //     type: 'move'
                // };
                this.team.moveUnit(this, targetPosition, this.isAt.bind(this, targetPosition), );
            }
        });
    }

    move() {
        this.position = Vectors.add(this.position, this.currentSpeed);
    }

    attack(enemy) {
        this.attackTarget = enemy;
        this.isIdle = false;
    }

    command = (command) => {
        console.log('received command:', command); // DEBUG
        this.currentCommand = command;
        this.idle = false;
    }

    getSafeAccessor = () => {
        const {
            command
        } = this;

        return {
            command
        };
    }

}
