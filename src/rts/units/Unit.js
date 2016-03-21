import Vectors from '~/rts/spatial/Vectors';

function* generateUnitId() {
    let id = 0;
    while (true) { //eslint-disable-line no-constant-condition
        yield `unit-${id++}`;
    }
}

export default class Unit {
    speed = {
        x: 0,
        y: 0
    }

    constructor({position, size}) {
        this.id = generateUnitId;
        this.position = position;
        this.size = size;
        this.radius = size / 2;
    }

    tick = (tick) => {
        this.position = Vectors.add(this.position, this.speed);
    }
}
