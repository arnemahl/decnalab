import {getIdGenerator} from '~/rts/util/IdGenerator';

export default class StructureCreator {
    constructor(eventReceiver) {
        this.eventReceiver = eventReceiver;
        this.idGenerator = getIdGenerator('structure');
    }

    create = (specs, position) => {
        const Structure = specs.class;

        const id = this.idGenerator.generateId();

        return new Structure(id, specs, position, this.eventReceiver);
    }
}
