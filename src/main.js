'use strict';

import {object, objectWithMethod, lol} from './test.js';

function initGame(object) {
    console.log('object:', object); // DEBUG
}

initGame(object);

objectWithMethod.method();

lol.hey();
lol.there();