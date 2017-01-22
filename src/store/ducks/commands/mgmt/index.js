import { combineReducers } from 'redux';
import ongoingCommands from './ongoingCommands';
import ongoingMoveCommands from './ongoingMoveCommands';
import moveCollisionTable from './moveCollisionTable';

const mgmt = combineReducers({
    ongoingCommands,
    ongoingMoveCommands,
    moveCollisionTable,
});

export default mgmt;
