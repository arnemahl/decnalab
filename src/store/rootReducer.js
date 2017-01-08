import {updateEvents} from '~/store/ducks/updateEvents';
import {specs} from '~/store/ducks/specs';
import {units} from '~/store/ducks/units';
import {structures} from '~/store/ducks/structures';
import {resources} from '~/store/ducks/resources';

import {TEAM_ADDED} from '~/store/actions/initializeGame';

function players(state = [], event) {
    switch (event.type) {
        case TEAM_ADDED:
            return [
                ...state,
                event.teamId,
            ];
        default:
            return state;
    }
}

function tickReducer(state = { lastTick: 0, currentTick: 0, elapsed: 0 }, event) {
    switch (event.type) {
        case 'TICK_UPDATED':
            return {
                lastTick: state.currentTick,
                currentTick: event.tick,
                elapsed: event.tick - state.tick,
            };
        default:
            return state;
    }
}

export default function rootReducer(state = {}, event) {
    return {
        updateEvents: updateEvents(state.updateEvents, event),
        players: players(state.players, event),
        specs: specs(state.specs, event),
        units: units(state, state.units, event),
        structures: structures(state, state.structures, event),
        resources: resources(state.resources, event),
        tick: tickReducer(state.tick, event),
    };
}
