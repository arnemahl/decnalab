import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'reducers/rootReducer';

const crashReporter = store => next => action => {
    try {
        return next(action);
    } catch (error) {
        console.log('Action:', action, '\nState:', store.getState(), '\nError:', error.stack);

        throw error;
    }
};

const middleware = [thunk, crashReporter];
const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

export const createNewStore = () => createStoreWithMiddleware(rootReducer);
