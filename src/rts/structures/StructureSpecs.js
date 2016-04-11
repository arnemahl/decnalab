import BaseStructureClass from '~/rts/structures/BaseStructure';
import BarracksClass from '~/rts/structures/Barracks';


class BaseStructure {
    class = BaseStructureClass
    category = 'basic'

    cost = {
        abundant: 300,
        spase: 0,
        time: 500
    }

    size = 1000
    radius = this.size / 2
    maxHealth = 1000
    armor = 2

}

class Barracks {
    class = BarracksClass
    category = 'military'

    cost = {
        abundant: 200,
        spase: 0,
        time: 300
    }

    size = 800
    radius = this.size / 2
    maxHealth = 800
    armor = 2
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
