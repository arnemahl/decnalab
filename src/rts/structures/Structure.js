import Commandable from '~/rts/commandable/Commandable';

export default class Structure extends Commandable {

    getState = () => {
        return {
            id: this.id,
            type: this.constructor.name,
            position: {...this.position},
            healthLeftFactor: this.healthLeftFactor
        };
    }

}
