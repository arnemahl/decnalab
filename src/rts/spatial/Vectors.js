
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
            Math.pow(one.x - two.x, 2),
            Math.pow(one.y - two.y, 2),
        );
    }
    distance = this.absoluteDistance

    direction(one, two, vectorLength = 1) {
        const distance = {
            x: two.x - one.x,
            y: two.y - one.y
        };

        const absoluetDistance = this.absoluteDistance(one, two);

        return this.scale(distance, vectorLength / absoluetDistance);
    }
}

export default new Vectors();
