const ffi = require('ffi');

const nativeRustFFI = ffi.Library('rust/target/release/libdecnalab', {
    hello_from_rust: ['string', ['string']]
});

const string = nativeRustFFI.hello_from_rust('Node');

console.log(string);
