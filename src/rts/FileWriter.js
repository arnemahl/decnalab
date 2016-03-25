import fileSystem from 'fs';

export function writeJSON(fileName, json) {
    const content = JSON.stringify(json, null, 4);

    fileSystem.writeFile(`/home/arne/rep/priv/projects/decnalab/src/rts/${fileName}`, content, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log(`${fileName} saved to file.`);
    });
}
