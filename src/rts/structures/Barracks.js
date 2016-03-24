import Structure from '~/rts/structures/Structure';

export default class Barracks extends Structure {
}

export const isBarracks = structure => structure.constructor.class === "Barracks";
