
// const generateEngineId = (() => {
//     const engineIdGenerator = (function*() {
//         let id = 0;
//         while (true) { //eslint-disable-line no-constant-condition
//             yield `engine-${id++}`;
//         }
//     })();

//     return () => engineIdGenerator.next().value;
// })();

// const 


class Engine {

    constructor() {
        // this.id = generateEngineId();
        
    }

    moveUnit = (unit, targetPosition) => {

        

        return {
            then: addToChain
        };
    }

    attackWithUnit = (unit, targetUnit) => {

    }

    harvestWithUnit = (unit, resourceSite) => {

    }

    dropOffHarvestWithUnit = (unit, baseStructure) => {

    }

    constructWithUnit = (unit, structure, position) => {

    }

    tick = (tickNo) => {

    }
}