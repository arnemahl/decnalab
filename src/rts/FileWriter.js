import fileSystem from 'fs';

export function writeJSON(fileName, json) {
    const content = JSON.stringify(json, null, 4);
    const fullPath = `${__dirname}/../../dump/${fileName}`;

    fileSystem.writeFile(fullPath, content, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`${fileName} saved to file (${fullPath})`);
    });
}



/***********************************************/
/**  Write DumbAI config to runnable js file  **/
/***********************************************/

const hack = (config) => ({
    buildOrder: config.buildOrder.map(target => ({
        spec: target.spec.constructor.name,
        count: Number.isFinite(target.count) ? target.count : 'Number.POSITIVE_INFINITY'
    })),
    attackAtSupply: config.attackAtSupply,
});

export function writeConfigToJS(fileName, configArray) {
    const content =
`import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

const {
    Worker,
    Marine,
} = new UnitSpecs();
const {
    SupplyDepot,
    Barracks,
} = new StructureSpecs();

module.exports = ${JSON.stringify(configArray.map(hack), null, 4).split('"').join('')};
`;

    const fullPath = `${__dirname}/../../dump/ai-config/${fileName}`;

    fileSystem.writeFile(fullPath, content, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`File saved: ${fullPath}`);
    });
}
