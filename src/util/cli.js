/*
 * READ STORED CONFIG
 *   - Looks at first and second cli arguments to see which file(s) to import from
 *   - Both cli arguments are optional
 *
 * May return empty array, then Game will fall back to default AI configs
 *
 */

export function getAiConfigs() {
    const dirName = process.argv[2];
    const dirName2 = process.argv[3];
    const configs = !dirName ? [] : require(`../../dump/${dirName}/solutions/population.js`);
    const configs2 = !dirName2 ? [] : require(`../../dump/${dirName2}/solutions/population.js`);

    const selectedConfigs = [
        configs[0],
        configs2[0] || configs[1],
    ];

    console.log(`Using selected aiConfigs for players:`, selectedConfigs.map(Boolean));

    return selectedConfigs;
}

export function canGetAiConfigs() {
    return !!process.argv[2];
}
