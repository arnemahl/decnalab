use std::i32;

#[derive(Debug)]
pub struct Vector {
    pub x: i32,
    pub y: i32,
}

impl Vector {
    pub fn new(x: i32, y: i32) -> Vector {
        Vector{x: x, y: y}
    }
    pub fn clone(&self) -> Vector {
        Vector::new(self.x, self.y)
    }
    pub fn zero() -> Vector {
        Vector::new(0, 0)
    }
    pub fn add(&self, other: &Vector) -> Vector {
        Vector {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
    pub fn subtract(&self, other: &Vector) -> Vector {
        Vector {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
    pub fn scale(&self, scalar: i32) -> Vector {
        Vector {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn absolute_length(&self) -> i32 {
        ((
            (self.x).pow(2) +
            (self.y).pow(2)
        ) as f64).sqrt() as i32
    }

    pub fn to_unit_vector(&self) -> Vector {
        let length = self.absolute_length();

        self.clone().scale(1 / length)
    }

    // Positions
    pub fn absolute_distance(&self, other: &Vector) -> i32 {
        ((
            (self.x - other.x).pow(2) +
            (self.y - other.y).pow(2)
        ) as f64).sqrt() as i32
    }

    // Positions
    pub fn direction(&self, other: &Vector) -> Vector {
        other.subtract(&self).to_unit_vector()
    }

    pub fn is_equal_to(&self, other: &Vector) -> bool {
           self.x == other.x
        && self.y == other.y
    }
    pub fn is_not_equal_to(&self, other: &Vector) -> bool {
        !self.is_equal_to(other)
    }
}
