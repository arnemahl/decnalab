import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

const {
    Worker,
    Marine,
} = new UnitSpecs();
const {
    SupplyDepot,
    Barracks,
} = new StructureSpecs();

module.exports = {
    buildOrder: [
        { spec: Worker, count: 9, },
        { spec: SupplyDepot, count: 1, },
        { spec: Worker, count: 10, },
        { spec: Barracks, count: 1, },
        { spec: Worker, count: 11, },
        { spec: Marine, count: 1, },
        { spec: Barracks, count: 2, },
        { spec: Marine, count: 10, },
        { spec: SupplyDepot, count: 2, },
        { spec: Marine, count: Number.POSITIVE_INFINITY, },
    ],
    attackAtSupply: 18,
};
