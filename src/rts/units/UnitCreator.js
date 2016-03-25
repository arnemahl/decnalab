import {getIdGenerator} from '~/rts/util/IdGenerator';

export default class UnitCreator {
    constructor(eventReceiver) {
        this.eventReceiver = eventReceiver;
        this.idGenerator = getIdGenerator('unit');
    }

    create = (specs, position) => {
        const Unit = specs.class;
        const id = this.idGenerator.generateId();

        return new Unit(id, specs, position, this.eventReceiver);
    }
}
