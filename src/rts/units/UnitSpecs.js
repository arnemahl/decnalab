import WorkerClass from '~/rts/units/Worker';
import MarineClass from '~/rts/units/Marine';
import FirebatClass from '~/rts/units/Firebat';

class Unit {
    type = 'unit'
}

const MEELEE = 1.2;

class Worker extends Unit {
    class = WorkerClass

    cost = {
        abundant: 40,
        sparse: 0,
        supply: 1,
        time: 400
    }

    size = 100
    radius = this.size / 2
    speed = 9

    maxHealth = 60
    armor = 0

    weapon = {
        cooldown: 30,
        damage: 5,
        range: this.radius * MEELEE,
    }

    producedBy = 'BaseStructure'
}

class Marine extends Unit {
    class = MarineClass;

    cost = {
        abundant: 40,
        sparse: 0,
        supply: 1,
        time: 360
    }

    size = 80
    radius = this.size / 2
    speed = 10

    maxHealth = 50
    armor = 0

    weapon = {
        cooldown: 20,
        damage: 10,
        range: 500,
    }

    producedBy = 'Barracks'
}

class Firebat extends Unit {
    class = FirebatClass;

    cost = {
        abundant: 60,
        sparse: 0,
        supply: 1,
        time: 360
    }

    size = 100
    radius = this.size / 2
    speed = 10

    maxHealth = 60
    armor = 2

    weapon = {
        cooldown: 30,
        damage: 2,
        range: 200,
    }

    producedBy = 'FlameTower'
}

export default class UnitSpecs {
    constructor() {
        this.Worker = new Worker();
        this.Marine = new Marine();
        this.Firebat = new Firebat();
    }

    clone() {
        return new UnitSpecs();
    }
}
