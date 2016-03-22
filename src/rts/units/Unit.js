import Vectors from '~/rts/spatial/Vectors';

const generateUnitId = (() => {
    const unitIdGenerator = (function*() {
        let id = 0;
        while (true) { //eslint-disable-line no-constant-condition
            yield `unit-${id++}`;
        }
    })();

    return () => unitIdGenerator.next().value;
})();

// function stacktrace() {
//   function st2(f) {
//     return !f ? [] :
//         st2(f.caller).concat([f.toString().split('(')[0].substring(9) + '(' + f.arguments.join(',') + ')']);
//   }
//   return st2(arguments.callee.caller);
// }

export default class Unit {

    constructor(stats, position) {
        this.id = generateUnitId();

        this.stats = stats;
        this.position = position;

        this.currentCommand = false;
        this.isIdle = true;
    }

    tick = () => {
        if (this.isIdle) {
            return false;
        }

        // Progress whatever action the unit is performing
        switch (this.action.type) {
            case 'move':
                this.move();
                return true;
            case 'attack':
                this.attack();
                return true;

            default:
                return false;
        }
    }

    goTo(targetPosition) {
        this.currentSpeed = Vectors.direction(this.position, targetPosition, this.stats.speed);
        this.command = {
            type: 'move'
        };
    }

    move() {
        this.position = Vectors.add(this.position, this.currentSpeed); // TODO change how it works
    }

    attack() {
        // TODO
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
