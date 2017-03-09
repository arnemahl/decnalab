export const sumTotal = (sum, number) => sum + number;
export const average = (avg, number, _, array) => avg + number / array.length;

export const ascending = (a, b) => a - b;
export const descending = (a, b) => b - a;
export const calcStats = (numbers) => {
    const total = numbers.reduce(sumTotal, 0);
    const average = total / numbers.length;
    const stdDeviation =  [ numbers.map(x => Math.pow(x - average, 2)).reduce(sumTotal, 0) ].map(sum => sum / numbers.length).map(Math.sqrt)[0];
    const median = numbers.slice().sort(ascending).find((_, index) => index === Math.floor(numbers.length / 2));
    const max = numbers.slice().sort(descending)[0];

    return {
        total,
        average,
        stdDeviation,
        median,
        max,
    };
};
