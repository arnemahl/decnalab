import Commandable from '~/rts/commandable/Commandable';

export default class Structure extends Commandable {

    getState = () => {
        return {
            id: this.id,
            type: this.constructor.name,
            position: {...this.position},
            healthLeftFactor: this.healthLeftFactor,
            isUnderConstruction: this.isUnderConstruction
        };
    }

    setState = (nextState) => {
        this.position = {...nextState.position};
        this.healthLeftFactor = nextState.healthLeftFactor;
        this.isUnderConstruction = nextState.isUnderConstruction;

        this.specs = this.team.structureSpecs[this.constructor.name]; // OMG. This is fucked
    }

}
