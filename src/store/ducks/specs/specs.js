import {TEAM_ADDED} from '~/store/actions/initializeGame';
export const UNIT_SPECS_UPDATED = Symbol('UNIT_SPECS_UPDATED');
export const STRUCTURE_SPECS_UPDATED = Symbol('STRUCTURE_SPECS_UPDATED');

import {unitSpecs} from './unitSpecs';
import {structureSpecs} from './structureSpecs';

const teamSpecs = (state, event) => {
    switch (event.type) {
        case TEAM_ADDED:
            return {
                units: unitSpecs(state, event),
                structures: structureSpecs(state, event),
            };
        case UNIT_SPECS_UPDATED:
            return {
                ...state,
                units: unitSpecs(state, event),
            };
        case STRUCTURE_SPECS_UPDATED:
            return {
                ...state,
                structures: structureSpecs(state, event),
            };
    }
};

export const specs = (state = {}, event) => {
    switch (event.type) {
        case TEAM_ADDED:
        case UNIT_SPECS_UPDATED:
        case STRUCTURE_SPECS_UPDATED:
            return {
                ...state,
                [event.teamId]: teamSpecs(state[event.teamId], event),
            };
        default:
            return state;
    }
};