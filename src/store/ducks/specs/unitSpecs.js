import {TEAM_ADDED} from '~/store/actions/initializeGame';
import {UNIT_SPECS_UPDATED} from './specs';

const SIZE = Symbol('SIZE');
const SPEED = Symbol('SPEED');
const MAX_HEALTH = Symbol('MAX_HEALTH');
const ARMOR = Symbol('ARMOR');
const WEAPON = Symbol('WEAPON');
const COST = Symbol('COST');

export const UNIT_PROPERTY = {
    SIZE,
    SPEED,
    MAX_HEALTH,
    ARMOR,
    WEAPON,
    COST,
};

const workerInitState = {
    cost: {
        abundant: 40,
        sparse: 0,
        time: 13,
        supply: 1,
    },

    defense: {
        maxHealth: 60,
        armor: 0,
    },

    weapon: { // ground
        damage: 5,
        range: 1,
        cooldown: 0.63,
    },

    speed: 3.720,
    sight: 7,
    size: 100,
};

const marineInitState = {
    cost: {
        abundant: 50,
        sparse: 0,
        time: 15,
        supply: 1,
    },

    defense: {
        maxHealth: 40,
        armor: 0,
    },

    weapon: { // ground + air
        damage: 6,
        range: 4,
        cooldown: 0.63,
    },

    speed: 2.976,
    sight: 7,
    size: 80,
};

const unitSpec = (state, event) => {
    switch (event.property) {
        case SIZE:
            return {
                ...state,
                size: event.size
            };
        case SPEED:
            return {
                ...state,
                speed: event.speed
            };
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
        case WEAPON:
            return {
                ...state,
                weapon: {
                    ...state.weapon,
                    ...event.weapon,
                },
            };
        case COST:
            return {
                ...state,
                cost: {
                    ...state.cost,
                    ...event.cost,
                },
            };
    }
};

export const unitSpecs = (state, event) => {
    switch (event.type) {
        case TEAM_ADDED:
            return {
                worker: unitSpec(workerInitState, event),
                marine: unitSpec(marineInitState, event),
            };
        case UNIT_SPECS_UPDATED:
            return {
                ...state,
                [event.unitType]: unitSpec(state[event.unitType], event),
            };
    }
};
