import {UPDATE_EVENTS_CLEARED} from '~/store/ducks/updateEvents';

// May include (1) gained vision, (2) command completed, (3) unit/structure destroyed
export const applyCommandEffects = () => {
    return (dispatch, getState) => {
        getState().updateEvents.forEach(updateEvent => {
            dispatch(updateEvent);
        });

        dispatch({ type: UPDATE_EVENTS_CLEARED });
    };
};
