import fileSystem from 'fs';

export function writeJSON(fileName, json) {
    const content = JSON.stringify(json, null, 4);
    const fullPath = `${__dirname}/${fileName}`;

    fileSystem.writeFile(fullPath, content, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`${fileName} saved to file (${fullPath})`);
    });
}
