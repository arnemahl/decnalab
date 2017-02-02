import BaseStructureClass from '~/rts/structures/BaseStructure';
import BarracksClass from '~/rts/structures/Barracks';
import SupplyDepotClass from '~/rts/structures/SupplyDepot';

import WorkerClass from '~/rts/units/Worker';

class Structure {
    type = 'structure'
}

class BaseStructure extends Structure {
    class = BaseStructureClass

    cost = {
        abundant: 300,
        sparse: 0,
        supply: 0,
        time: 500
    }

    size = 1000
    radius = this.size / 2
    maxHealth = 1000
    armor = 2

    providesSupply = 12

    producedBy = WorkerClass
}

class SupplyDepot extends Structure {
    class = SupplyDepotClass

    cost = {
        abundant: 100,
        sparse: 0,
        supply: 0,
        time: 200
    }

    size = 500
    radius = this.size / 2
    maxHealth = 300
    armor = 2

    providesSupply = 10

    producedBy = WorkerClass
}

class Barracks extends Structure {
    class = BarracksClass

    cost = {
        abundant: 200,
        sparse: 0,
        supply: 0,
        time: 300
    }

    size = 800
    radius = this.size / 2
    maxHealth = 800
    armor = 2

    producedBy = WorkerClass
}

export default class StructureSpecs {
    constructor() {
        this.BaseStructure = new BaseStructure();
        this.SupplyDepot = new SupplyDepot();
        this.Barracks = new Barracks();
    }

    clone() {
        return new StructureSpecs();
    }
}
