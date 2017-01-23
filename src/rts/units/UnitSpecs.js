import WorkerClass from '~/rts/units/Worker';
import MarineClass from '~/rts/units/Marine';

import BaseStructureClass from '~/rts/structures/BaseStructure';
import BarracksClass from '~/rts/structures/Barracks';

class Worker {
    class = WorkerClass
    category = 'worker'

    cost = {
        abundant: 40,
        sparse: 0,
        supply: 1,
        time: 200
    }

    size = 100
    radius = this.size / 2
    speed = 9

    maxHealth = 60
    armor = 0

    weapon = {
        cooldown: 30,
        damage: 5
    }

    producedBy = BaseStructureClass
}

class Marine {
    class = MarineClass;
    category = 'military'

    cost = {
        abundant: 40,
        sparse: 0,
        supply: 1,
        time: 180
    }

    size = 80
    radius = this.size / 2
    speed = 10

    maxHealth = 50
    armor = 0

    weapon = {
        cooldown: 20,
        damage: 10
    }

    producedBy = BarracksClass
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
