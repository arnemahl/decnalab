import Structure from '~/rts/structures/Structure';

const baseStructureSize = 1000;

export default class BaseStructure extends Structure {

    constructor(position) {
        super({position, size: baseStructureSize});
    }
}
