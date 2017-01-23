// Process
const UNIT = Symbol('UNIT');
const STRUCTURE = Symbol('STRUCTURE');

const progressMoveCommands = () => {
    return (dispatch, getState) => {
        const moveCommands = getAllMoveCommands(getState());

        moveCommands.forEach(move => {
            dispatch(MoveCommand_v3.progress(move));
        });
    };
}

const progressStructureCommands = () => {
    return (dispatch, getState) => {
        structureCommands.forEach(command => {
            dispatch({
                type: STRUCTURE_COMMAND_COMPLETED,
                structureId: command.target.id,
            });

            switch (command.type) {
                case TODO:
                    // TODO
                    break;
            }
            break;
        });
    };
}

const progressUnitCommands = () => {
    return (dispatch, getState) => {
        unitCommands.forEach(command => {
            dispatch({
                type: UNIT_COMMAND_COMPLETED,
                unidId: command.target.id,
            });

            switch (command.type) {
                case MOVE_UNIT_COMMAND:
                    MoveCommand_v3.finished(command);
                    break;
            }
        });
    };
}

const finishCompletedCommands = () => {
    return (dispatch, getState) => {
        // TODO
        dispatch(progressStructureCommands());
        dispatch(applyCommandEffects());

        dispatch(progressUnitCommands());
        dispatch(applyCommandEffects());
    };
}

export const progressCommands = () => {
    return (dispatch, getState) => {
        const state = getState();

        const nextCollisionTick = collisionTable.getNextTickWhenThereIsACollision(state);
        const commandStuff = commandList.getNextTickWhenAnyCommandsFinish(state);

        if (typeof nextCollisionTick !== 'undefined' && typeof commandStuff.nextTick !== 'undefined') {
            if (nextCollisionTick < commandStuff.nextTick) {
                // Progress all move commands
                dispatch(progressMoveCommands());
            } else if (nextCollisionTick > commandStuff.nextTick) {
                // Finish commands that are done
                dispatch(finishCompletedCommands());
            } else {
                // Progress all move commands
                dispatch(progressMoveCommands());
                // Finish commands that are done
                dispatch(finishCompletedCommands());
            }

        } else if (typeof nextCollisionTick !== 'undefined') {
            // Progress all move commands
            dispatch(progressMoveCommands());
        } else if (typeof commandStuff.nextTick !== 'undefined') {
            // Finish commands that are done
            dispatch(finishCompletedCommands());
        }
        // else {
        //     // Nothing to do until the players give commands
        // }
    };
};
