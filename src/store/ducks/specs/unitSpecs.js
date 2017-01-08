import {TEAM_ADDED} from './specs'; // TODO WILL BE MOVED
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
    size: 100,
    speed: 9,

    maxHealth: 60,
    armor: 0,

    weapon: {
        cooldown: 30,
        damage: 5,
        range: 10,
    },

    cost: {
        abundant: 40,
        sparse: 0,
        supply: 1,
        time: 200,
    },
};

const marineInitState = {
    size: 100,
    speed: 9,

    maxHealth: 60,
    armor: 0,

    weapon: {
        cooldown: 20,
        damage: 5,
        range: 1000,
    },

    cost: {
        abundant: 40,
        sparse: 0,
        supply: 1,
        time: 180,
    },
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
    };
};

const unitSpecs = (state, event) => {
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
