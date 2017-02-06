export function selectUnique(population, nofSelected, selectionMethod) {
    if (population.length < nofSelected) {
        throw Error(`Cannot select ${nofSelected} from population of ${population.length} individuals.`);
    }
    if (population.length === nofSelected) {
        return population;
    }

    let populationCopy = population.slice();
    const selectedList = [];

    while (selectedList.length < nofSelected) {
        const nextSelected = selectionMethod(populationCopy, 1)[0];

        if (selectedList.indexOf(nextSelected) > -1) {
            throw Error('Selected twice');
        }

        selectedList.push(nextSelected);
        populationCopy = populationCopy.filter(remainning => remainning !== nextSelected);
    }

    return selectedList;
}
