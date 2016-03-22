import WorkerClass from '~/rts/units/Worker';
import MarineClass from '~/rts/units/Marine';


class BaseStructure {
    category = 'basic'

    cost = {
        abundant: 300,
        spase: 0,
        time: 500
    }

    size = 1000
    health = 1000
    armor = 2

    produces = {
        units: { worker: WorkerClass }
    }
}

class Barracks {
    category = 'military'

    cost = {
        abundant: 200,
        spase: 0,
        time: 300
    }

    size = 800
    health = 800
    armor = 2

    produces = {
        units: { marine: MarineClass }
    }
}

export default class StructureStatsClass {
    constructor() {
        this.BaseStructure = new BaseStructure();
        this.Barracks = new Barracks();
    }
}


// class ResearchLab {
//     category = 'util'

//     cost = {
//         abundant: 200,
//         spase:
//     }

//     size = 800
//     health = 800
//     armor = 2

//     produces = {
//         upgrades: ['weapon.damage.military']
//     }
// }

// const applyUpgrade = newUnitStats => {
//     if (newUnitStats.category !== 'military') {
//         return newUnitStats;
//     } else {
//         const {weapon: {damage, cooldown}, ...other} = newUnitStats;

//         return {
//             weapon: {
//                 damage + 1,
//                 cooldown
//             }
//             ...other
//         }
//     }
// }
