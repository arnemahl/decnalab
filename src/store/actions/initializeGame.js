import {STRUCTURE_CREATED} from '~/store/ducks/structures';
import {UNIT_CREATED} from '~/store/ducks/units';

export const TEAM_ADDED = Symbol('TEAM_ADDED'); // SHOULD BE USED OTHER PLACES TOO

export const initializeGame = () => {
    return (dispatch, getState) => {
        /*
            Add teams - will give them:
                * specs for units and structures
                * starting resources
        */

        dispatch({
            type: TEAM_ADDED,
            teamId: 'blue'
        });
        dispatch({
            type: TEAM_ADDED,
            teamId: 'red'
        });

        const {specs} = getState();


        // Add structures (1. base) for blue team
        dispatch({
            type: STRUCTURE_CREATED,
            teamId: 'blue',
            specId: 'base',
            position: { x: 5000, y: 4000 },
        });

        // Add units (4. workers) for blue team
        const createBlueWorker = {
            type: UNIT_CREATED,
            teamId: 'blue',
            specId: specs['blue'].units.worker.id,
        };
        dispatch({
            ...createBlueWorker,
            position: { x: 4700, y: 5000 },
        });
        dispatch({
            ...createBlueWorker,
            position: { x: 4900, y: 5000 },
        });
        dispatch({
            ...createBlueWorker,
            position: { x: 5100, y: 5000 },
        });
        dispatch({
            ...createBlueWorker,
            position: { x: 5300, y: 5000 },
        });


        // Add structures (1. base) for red team
        dispatch({
            type: STRUCTURE_CREATED,
            teamId: 'red',
            specId: 'base',
            position: { x: 45000, y: 4000 },
        });

        // Add units (4. workers) for red team
        const createRedWorker = {
            type: UNIT_CREATED,
            teamId: 'red',
            specId: 'worker',
        };
        dispatch({
            ...createRedWorker,
            position: { x: 4700, y: 5000 },
        });
        dispatch({
            ...createRedWorker,
            position: { x: 4900, y: 5000 },
        });
        dispatch({
            ...createRedWorker,
            position: { x: 5100, y: 5000 },
        });
        dispatch({
            ...createRedWorker,
            position: { x: 5300, y: 5000 },
        });

    };
};
