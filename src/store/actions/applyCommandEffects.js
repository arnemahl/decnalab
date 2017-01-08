// May include (1) gained vision, (2) command completed, (3) unit/structure destroyed
const applyCommandEffects = () => {
    return (dispatch, getState) => {
        const {updateEvents} = getState();

        getState().updateEvents.forEach(updateEvent => {
            dispatch(updateEvent);
        });

        dispatch({ type: UPDATE_EVENTS_CLEARED });
    }
}
