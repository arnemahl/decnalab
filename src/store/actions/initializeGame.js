import {STRUCTURE_CREATED} from '~/store/ducks/structures';
import {UNIT_CREATED} from '~/store/ducks/units';

export const TEAM_ADDED = Symbol('TEAM_ADDED');

import {getIdGenerator} from '~/rts/util/IdGenerator';
const idGenerator = getIdGenerator('id');

export const initializeGame = () => {
    return (dispatch) => {
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


        // Add structures (1. base) for blue team
        dispatch({
            type: STRUCTURE_CREATED,
            structureId: idGenerator.generateId(),
            teamId: 'blue',
            specId: 'base',
            position: { x: 5000, y: 4000 },
        });

        // Add units (4. workers) for blue team
        const createBlueWorker = {
            type: UNIT_CREATED,
            unitId: idGenerator.generateId(),
            teamId: 'blue',
            specId: 'worker',
        };
        dispatch({
            ...createBlueWorker,
            unitId: idGenerator.generateId(),
            position: { x: 4700, y: 5000 },
        });
        dispatch({
            ...createBlueWorker,
            unitId: idGenerator.generateId(),
            position: { x: 4900, y: 5000 },
        });
        dispatch({
            ...createBlueWorker,
            unitId: idGenerator.generateId(),
            position: { x: 5100, y: 5000 },
        });
        dispatch({
            ...createBlueWorker,
            unitId: idGenerator.generateId(),
            position: { x: 5300, y: 5000 },
        });


        // Add structures (1. base) for red team
        dispatch({
            type: STRUCTURE_CREATED,
            structureId: idGenerator.generateId(),
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
            unitId: idGenerator.generateId(),
            position: { x: 4700, y: 5000 },
        });
        dispatch({
            ...createRedWorker,
            unitId: idGenerator.generateId(),
            position: { x: 4900, y: 5000 },
        });
        dispatch({
            ...createRedWorker,
            unitId: idGenerator.generateId(),
            position: { x: 5100, y: 5000 },
        });
        dispatch({
            ...createRedWorker,
            unitId: idGenerator.generateId(),
            position: { x: 5300, y: 5000 },
        });

    };
};
