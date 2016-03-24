
class Vectors {
    new(x, y) {
        return {x, y};
    }
    clone(vector) {
        return {
            x: vector.x,
            y: vector.y
        };
    }
    zero() {
        return this.new(0, 0);
    }
    add(one, two) {
        return {
            x: one.x + two.x,
            y: one.y + two.y
        };
    }
    subtract(one, two) {
        return {
            x: one.x - two.x,
            y: one.y - two.y
        };
    }
    scale(vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar
        };
    }

    absoluteDistance(one, two) {
        return Math.sqrt(
            Math.pow(one.x - two.x, 2) +
            Math.pow(one.y - two.y, 2)
        );
    }

    direction(one, two, vectorLength = 1) {
        const distance = this.subtract(two, one);

        const absoluetDistance = this.absoluteDistance(one, two);

        return this.scale(distance, vectorLength / absoluetDistance);
    }

    length(vector) {
        return Math.sqrt(
            Math.pow(vector.x, 2) +
            Math.pow(vector.y, 2)
        );
    }
}

export default new Vectors();
