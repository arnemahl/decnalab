
export class AbundantResourceSite {
    type = 'abundant'
    ammount = 20000
    maxWorkers = 15

    constructor(position) {
        this.position = position;
    }
}

export class SparseResourceSite {
    type = 'sparse'
    ammount = 6000
    maxWorkers = 4
    requirement = worker => worker.xp > 100

    constructor(position) {
        this.position = position;
    }
}
