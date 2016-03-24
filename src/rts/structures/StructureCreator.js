import {getIdGenerator} from '~/rts/util/IdGenerator';

export default class StructureCreator {
    constructor(eventReceiver) {
        this.eventReceiver = eventReceiver;
        this.idGenerator = getIdGenerator('structure');
    }

    create = (spec, position) => {
        const Structure = spec.class;

        const id = this.idGenerator.generateId();

        return new Structure(id, position);
    }
}
