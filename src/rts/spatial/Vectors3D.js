
class Vectors3D {
    new(x, y, z) {
        return {x, y, z};
    }
    clone(vector) {
        return {
            x: vector.x,
            y: vector.y,
            y: vector.z,
        };
    }
    zero() {
        return this.new(0, 0, 0);
    }
    add(one, two) {
        return {
            x: one.x + two.x,
            y: one.y + two.y,
            z: one.z + two.z,
        };
    }
    subtract(one, two) {
        return {
            x: one.x - two.x,
            y: one.y - two.y,
            z: one.z - two.z,
        };
    }
    scale(vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar,
            z: vector.z * scalar,
        };
    }

    absoluteDistance(one, two) {
        return Math.pow((
            + Math.pow(one.x - two.x, 3)
            + Math.pow(one.y - two.y, 3)
            + Math.pow(one.z - two.z, 3)
        ), 1 / 3);
    }

    direction(one, two, vectorLength = 1) {
        const distance = this.subtract(two, one);

        const absoluetDistance = this.absoluteDistance(one, two);

        return this.scale(distance, vectorLength / absoluetDistance);
    }

    length(vector) {
        return Math.pow((
            + Math.pow(vector.x, 3)
            + Math.pow(vector.y, 3)
            + Math.pow(vector.z, 3)
        ), 1 / 3);
    }

    equals(one, two) {
        return one.x === two.x
            && one.y === two.y
            && one.z === two.z;
    }
    notEquals(one, two) {
        return !this.equals(one, two);
    }
}

export default new Vectors3D();
