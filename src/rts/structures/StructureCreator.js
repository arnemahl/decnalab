import {getIdGenerator} from '~/rts/util/IdGenerator';

export default class StructureCreator {
    constructor(eventReceiver) {
        this.eventReceiver = eventReceiver;
        this.idGenerator = getIdGenerator('structure');
    }

    // create = (structureType) => {
    //     // TODO
    // }
}
