const givePlayerCommands = (playerId) => {
    // TODO
    return (dispatch, getState) => {
    };
}

/** LET PLAYERS GIVE COMMANDS TO UNITS/STRUCTURES **/
export const letPlayersGiveCommands = () => {
    return (dispatch, getState) => {
        getState().players.map(playerId => {
            // dispatch(player.giveCommands()); // Max redux?
            // player.giveCommands(getState(), dispatch); // Or not?
            dispatch(givePlayerCommands(playerId));

            // TODO implement player
        });
    }
}
