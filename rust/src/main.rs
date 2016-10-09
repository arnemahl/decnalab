mod rts;

use rts::spatial::vector::Vector;
use rts::feature::unit::spec::Spec;
use rts::feature::unit::spec::Point;
use rts::feature::unit::unit::Unit;

fn main() {
    let vector = Vector::new_int(5, 6);
    let spec = Spec { speed: &5.0 };

    let mut point = Point { x: 0, y: 0 };
    point.up();

    let unit = Unit {
        position: vector,
        spec: &spec,
        point: point
    };

    println!("This is a unit: {:?}", unit);
    point.up();
    println!("This is a unit: {:?}", unit);

    // spec.
}
