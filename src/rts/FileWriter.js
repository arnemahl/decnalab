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
export function writeConfigToJS(fileName, configArray) {
    const content = `module.exports = ${JSON.stringify(configArray, null, 4)};`;

    const fullPath = `${__dirname}/../../dump/ai-config/${fileName}`;

    fileSystem.writeFile(fullPath, content, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`File saved: ${fullPath}`);
    });
}
