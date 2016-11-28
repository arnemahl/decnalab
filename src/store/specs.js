// import UnitSpecs from '....';
// import StructureSpecs from '....';

const specs = (state, action) {
    switch (action.type) {
        case INIT_GAME:
            return {
                units: new UnitSpecs(),
                structures: new StructureSpecs()
            }
        default:
            return state;
    }
}
export default specs;
