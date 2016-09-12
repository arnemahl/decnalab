const ffi = require('ffi');

const nativeRustFFI = ffi.Library('rust/target/release/libdecnalab', {
    get_json: ['string', ['string']]
});

const jsonString = nativeRustFFI.get_json('');
const json = JSON.parse(jsonString);

console.log('json:', json); // DEBUG

Object.keys(json).forEach(key => {
    const property = json[key];

    console.log('property:', key, typeof property, property); // DEBUG
});
