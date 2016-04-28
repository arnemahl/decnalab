import Structure from '~/rts/structures/Structure';

export default class SupplyDepot extends Structure {
}

export const isSupplyDepot = structure => structure.constructor.name === "SupplyDepot";
