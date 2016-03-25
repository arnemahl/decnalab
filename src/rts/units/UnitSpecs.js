import WorkerClass from '~/rts/units/Worker';
import MarineClass from '~/rts/units/Marine';

class Worker {
    class = WorkerClass
    category = 'worker'

    size = 50
    speed = 9

    maxHealth = 60
    armor = 0

    weapon = {
        cooldown: 30,
        damage: 5
    }
}

class Marine {
    class = MarineClass;
    category = 'military'

    size = 40
    speed = 10

    maxHealth = 50
    armor = 0

    weapon = {
        cooldown: 20,
        damage: 10
    }
}

export default class UnitSpecs {
    constructor() {
        this.Worker = new Worker();
        this.Marine = new Marine();
    }

    clone() {
        return new UnitSpecs();
    }
}
