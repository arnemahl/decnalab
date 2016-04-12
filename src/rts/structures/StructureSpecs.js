import BaseStructureClass from '~/rts/structures/BaseStructure';
import BarracksClass from '~/rts/structures/Barracks';

import UnitSpecs from '~/rts/units/UnitSpecs';


class BaseStructure {
    class = BaseStructureClass
    category = 'basic'

    cost = {
        abundant: 300,
        sparse: 0,
        time: 500
    }

    size = 1000
    radius = this.size / 2
    maxHealth = 1000
    armor = 2

    providesSupply = 10

    produces = [
        UnitSpecs.Worker
    ]
}

class Barracks {
    class = BarracksClass
    category = 'military'

    cost = {
        abundant: 200,
        sparse: 0,
        time: 300
    }

    size = 800
    radius = this.size / 2
    maxHealth = 800
    armor = 2

    produces = [
        UnitSpecs.Worker
    ]
}

export default class StructureSpecs {
    constructor() {
        this.BaseStructure = new BaseStructure();
        this.Barracks = new Barracks();
    }

    clone() {
        return new StructureSpecs();
    }
}
