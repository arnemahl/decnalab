export const UPDATE_EVENT_ADDED = Symbol('UPDATE_EVENT_ADDED');
export const UPDATE_EVENTS_CLEARED = Symbol('UPDATE_EVENTS_CLEARED');

export const addUpdateEvent = (update) => {
    return {
        type: UPDATE_EVENT_ADDED,
        update
    };
}

export function queuedUpdates(state = [], event) {
    switch (event.type) {
        case UPDATE_EVENT_ADDED:
            return [
                ...state,
                event.update,
            ];
        case UPDATE_EVENTS_CLEARED:
            return [];
    }
}
