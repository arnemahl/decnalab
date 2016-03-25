import Commandable from '~/rts/commandable/Commandable';

export default class Structure extends Commandable {

    getState = () => {
        return {
            id: this.id,
            position: {...this.position},
            healthLeftFactor: this.healthLeftFactor
        };
    }

}
