
export default class ReplayTeam {

    units = {}
    structures = {}

    constructor(id) {
        this.id = id;
    }

    updateUnits(nextUnitState) {
        const stillExists = [];

        nextUnitState.forEach(item => {
            const {id, type: unitType, ...unitState} = item;

            if (this.units[id]) {
                // update existing
                this.units[id].setState(unitState);
                stillExists[id] = true;
            } else {
                // create new
                const UnitClass = this.unitSpecs[unitType].class;

                this.units[id] = new UnitClass(id);
                this.units[id].team = this; // Should this be necessary?
                this.units[id].setState(unitState);
            }
        });

        // Remove units that don't exist in the nextState
        Object.keys(this.units)
            .filter(id => !stillExists[id])
            .forEach(id => delete this.units[id]);
    }

    updateStructures(nextStructureState) {
        const stillExists = [];

        nextStructureState.forEach(item => {
            const {id, type: structureType, ...structureState} = item;

            if (this.structures[id]) {
                // update existing
                this.structures[id].setState(structureState);
                stillExists[id] = true;
            } else {
                // create new
                const StructureClass = this.structureSpecs[structureType].class;

                this.structures[id] = new StructureClass(id);
                this.structures[id].team = this; // Should this be necessary?
                this.structures[id].setState(structureState);
            }
        });

        // Remove structures that don't exist in the nextState
        Object.keys(this.structures)
            .filter(id => !stillExists[id])
            .forEach(id => delete this.structures[id]);
    }

    setState = (nextState) => {
        this.resources = {...nextState.resources};
        this.unitSpecs = nextState.unitSpecs;
        this.structureSpecs = nextState.structureSpecs;

        this.updateUnits(nextState.units);
        this.updateStructures(nextState.structures);
    }

}
