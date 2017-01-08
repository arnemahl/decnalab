/** LET PLAYERS GIVE COMMANDS TO UNITS/STRUCTURES **/
export const letPlayersGiveCommands = () => {
    return (dispatch, getState) => {
        getState().players.map(player => {
            dispatch(player.giveCommands()); // Max redux?
            player.giveCommands(getState(), dispatch); // Or not?

            // TODO implement player
        });
    }
}
