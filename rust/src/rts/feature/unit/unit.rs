use rts::spatial::Vector;

struct Unit {
    pub position: Vector,
}

impl Unit {
    pub fn new(position: Vector) -> Unit {
        Unit {
            position: position
        }
    }
}
