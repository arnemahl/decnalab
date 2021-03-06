import fileSystem from 'fs';

const threeDigits = int => String(`00${int}`).split('').reverse().slice(0, 3).reverse().join('');

export function getUniqueDirName(experimentName) {
    let foundUniqueName = false;
    let dirName;
    let n = 0;

    while (!foundUniqueName) {
        dirName = `${experimentName}-${threeDigits(n++)}`;
        foundUniqueName = !fileSystem.existsSync(`${__dirname}/../../dump/${dirName}`);
    }

    return dirName;
}

export function createDumpDirectory(dirName) {
    fileSystem.mkdirSync(`${__dirname}/../../dump/${dirName}`);
}

export function writeToFile(fileName, content) {
    const fullPath = `${__dirname}/../../dump/${fileName}`;

    fileSystem.writeFile(fullPath, content, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`File saved: ${fullPath}`);
        }
    });
}

export function writeJSON(fileName, json) {
    writeToFile(fileName, JSON.stringify(json, null, 4));
}

/***************************************************/
/**  Write DumbAI strategies to runnable js file  **/
/***************************************************/
export function writeSolutionsToJS(fileName, solutionsJson) {
    const solutions = JSON.stringify(solutionsJson, null, 4)
        .split('\n                ').join(' ') // write entire bulid order target on one line
        .split('\n            }').join(' }'); // write entire bulid order target on one line

    const content = `module.exports = ${solutions};`;

    writeToFile(fileName, content);
}
