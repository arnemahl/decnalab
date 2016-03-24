
const basicCommands = {
    move: 'move',
    attack: 'attack'
};

class Worker {
    class = Worker
    category = 'worker'

    size = 50
    speed = 9

    maxHealth = 60
    armor = 0

    weapon = {
        cooldown: 30,
        damage: 5
    }

    commands = {
        harvest: 'harvest',
        construct: 'construct',
        ...basicCommands
    }
}

class Marine {
    category = 'military'

    size = 40
    speed = 10

    maxHealth = 50
    armor = 0

    weapon = {
        cooldown: 20,
        damage: 10
    }

    commands = basicCommands
}

export default class UnitStatsClass {
    constructor() {
        this.Worker = new Worker();
        this.Marine = new Marine();
    }
}
