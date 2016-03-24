import Structure from '~/rts/structures/Structure';

export default class BaseStructure extends Structure {
}

export const isBaseStructure = structure => structure.constructor.class === "BaseStructure";
