import {TEAM_ADDED} from './specs'; // TODO WILL BE MOVED
import {STRUCTURE_SPECS_UPDATED} from './specs';

const MAX_HEALTH = Symbol('MAX_HEALTH');
const ARMOR = Symbol('ARMOR');

export const STRUCTURE_PROPERTY = {
    MAX_HEALTH,
    ARMOR,
};

const baseInitState = {
    size: 1500,

    defense: {
        maxHealth: 1000,
        armor: 1,
    },

    cost: {
        abundant: 400,
        sparse: 0,
        time: 120,
    },

    providesSupply: 10,
};

const supplyDepotInitState = {
    size: 500,

    defense: {
        maxHealth: 400,
        armor: 1,
    },

    cost: {
        abundant: 100,
        sparse: 0,
        time: 40,
    },

    providesSupply: 8,
};

const barracksInitState = {
    size: 800,

    defense: {
        maxHealth: 1000,
        armor: 1,
    },

    cost: {
        abundant: 150,
        sparse: 0,
        time: 80,
    },

    providesSupply: 0,
};

const structureSpec = (state, event) => {
    switch (event.property) {
        case MAX_HEALTH:
            return {
                ...state,
                maxHealth: event.maxHealth
            };
        case ARMOR:
            return {
                ...state,
                armor: event.armor
            };

        default:
            return state;
    };
};

const structureSpecs = (state, event) => {
    switch (event.type) {
        case TEAM_ADDED:
            return {
                base: structureSpec(baseInitState, event),
                supplyDepot: structureSpec(supplyDepotInitState, event),
                barracks: structureSpec(barracksInitState, event),
            };
        case STRUCTURE_SPECS_UPDATED:
            return {
                ...state,
                [event.structureType]: structureSpec(state[event.structureType], event),
            };
    }
};

// Actions (upgrades)
export const structureArmorUpgradeCompleted = (teamId) => {
    return (dispatch, getState) => {
        ['base', 'barracks', 'supplyDepot'].forEach(structureType => {
            dispatch({
                type: STRUCTURE_SPECS_UPDATED,
                teamId,
                structureType,
                armor: 3
            });
        });
    };
};
