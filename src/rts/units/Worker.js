import Unit from './Unit';

const workerSize = 50;

export default class Worker extends Unit {
    constructor({position}) {
        super({position, workerSize});
    }
}
