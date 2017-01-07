/** PROCEED TO NEXT TICK WHERE "SOMETHING" HAPPENS **/
export const proceedToNextTick = () => {
    return (dispatch, getState) => {
        /*
            Things that can happen are:
                - Command completes
                - One or more teams gains* vision of a enemy unit/structure (*if it already was in vision, it's not "news" and the team does not need to be informed)
                - One or more teams gets* attacked by an enemy unit (*if it already was being attacked, etc...)

            These things may be derived from other state, but it's likely more efficient to calculate in another action-creator

            Each player should be informed of the things that changed (for that player)
            Players who receive no "news" should not have any reason to dispatch new commands (but that can be up to the implementation of the player)
        */
    }
};
