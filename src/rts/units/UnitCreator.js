import {getIdGenerator} from '~/rts/util/IdGenerator';

export default class UnitCreator {
    constructor(eventReceiver) {
        this.eventReceiver = eventReceiver;
        this.idGenerator = getIdGenerator('unit');
    }

    create = (spec, position) => {
        const Unit = spec.class;
        const id = this.idGenerator.generateId();

        return new Unit(id, position);
    }
}
