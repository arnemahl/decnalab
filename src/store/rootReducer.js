import {updateEvents} from '~/store/ducks/updateEvents';
import {specs} from '~/store/ducks/specs';
import {units} from '~/store/ducks/units';
import {structures} from '~/store/ducks/structures';
import {resources} from '~/store/ducks/resources';

export default function rootReducer(state = {}, event) {
    return {
        updateEvents: updateEvents(state.updateEvents, event),
        specs: specs(state.specs, event),
        units: units(state.units, event),
        structures: structures(state.structures, event),
        resources: resources(state.resources, event),
    };
}
