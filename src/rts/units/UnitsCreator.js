import {getIdGenerator} from '~/rts/util/IdGenerator';

export default class UnitCreator {
    constructor(eventReceiver) {
        this.eventReceiver = eventReceiver;
        this.idGenerator = getIdGenerator('unit');
    }

    // create = (unitType) => {
    //     // TODO
    // }
}
