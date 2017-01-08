import {TEAM_ADDED} from '~/store/actions/initializeGame';
export const RESOURCES_PICKED_UP = Symbol('RESOURCES_PICKED_UP');
export const RESOURCES_DROPPED_OFF = Symbol('RESOURCES_PICKED_UP');

const initialState = {
    map: {
        resourceSites: {
            east: {
                location: { x: 5000, y: 8000 }, // TODO size?
                abundant: 8000,
                sparse: 4000,
            },
            west: {
                location: { x: 45000, y: 8000 },
                abundant: 8000,
                sparse: 4000,
            },
        },
    },
    teams: {}
};

export const resources = (state = initialState, event) => {
    switch (event.type) {
        case TEAM_ADDED:
            return {
                ...state,
                teams: {
                    ...state.teams,
                    [event.teamId]: {
                        abundant: 50,
                        sparse: 0,
                    },
                },
            };
        case RESOURCES_PICKED_UP:
            return {
                ...state,
                resourceSites: {
                    ...state.resourceSites,
                    [event.resourceSiteId]: {
                        ...state.resourceSites[event.resourceSite],
                        [event.resourceType]: state[event.resourceType] - event.resourceAmount
                    },
                },
            };
        case RESOURCES_DROPPED_OFF:
            return {
                ...state,
                teams: {
                    ...state.teams,
                    [event.teamId]: {
                        ...state.teams[event.teamId],
                        [event.resourceType]: state[event.resourceType] + event.resourceAmount
                    },
                },
            };
        default:
            return state;
    }
};

// Actions
const carryAmount = { abundant: 50, sparse: 8 };

export const resourcesPickedUp = (unitId, resourceSiteId, resourceType) => {
    return (dispatch) => {
        dispatch({
            type: RESOURCES_PICKED_UP,
            unitId,
            resourceSiteId,
            resourceType,
            resourceAmount: carryAmount[resourceType]
        });
    };
};
