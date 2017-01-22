// Reducer
import { combineReducers } from 'redux';
import mgmt from './mgmt';

const commands = combineReducers({
    mgmt,
});

export default commands;

// Action-creators