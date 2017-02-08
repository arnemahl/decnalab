import BaseStructureClass from '~/rts/structures/BaseStructure';
import BarracksClass from '~/rts/structures/Barracks';
import SupplyDepotClass from '~/rts/structures/SupplyDepot';
import FlameTowerClass from '~/rts/structures/FlameTower';

class Structure {
    type = 'structure'
}

class BaseStructure extends Structure {
    class = BaseStructureClass

    cost = {
        abundant: 300,
        sparse: 0,
        supply: 0,
        time: 1000
    }

    size = 1000
    radius = this.size / 2
    maxHealth = 1000
    armor = 2

    providesSupply = 12

    producedBy = 'Worker'
}

class SupplyDepot extends Structure {
    class = SupplyDepotClass

    cost = {
        abundant: 100,
        sparse: 0,
        supply: 0,
        time: 400
    }

    size = 500
    radius = this.size / 2
    maxHealth = 300
    armor = 2

    providesSupply = 10

    producedBy = 'Worker'
}

class Barracks extends Structure {
    class = BarracksClass

    cost = {
        abundant: 200,
        sparse: 0,
        supply: 0,
        time: 600
    }

    size = 800
    radius = this.size / 2
    maxHealth = 800
    armor = 2

    producedBy = 'Worker'
}

class FlameTower extends Structure {
    class = FlameTowerClass

    cost = {
        abundant: 250,
        sparse: 0,
        supply: 0,
        time: 800
    }

    size = 600
    radius = this.size / 2
    maxHealth = 800
    armor = 2

    producedBy = 'Worker'
}

export default class StructureSpecs {
    constructor() {
        this.BaseStructure = new BaseStructure();
        this.SupplyDepot = new SupplyDepot();
        this.Barracks = new Barracks();
        this.FlameTower = new FlameTower();
    }

    clone() {
        return new StructureSpecs();
    }
}
