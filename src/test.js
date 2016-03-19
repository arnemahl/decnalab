
export const object = {
    property: 'value'
};
export const objectWithMethod = {
    method() {
        console.log('method was called');
    }
};
class Lol {
    hey() {
        console.log('hey');
    }
    there = () => {
        console.log(`there. I'm ${this.constructor.name}`);
    }
}

export const lol = new Lol();