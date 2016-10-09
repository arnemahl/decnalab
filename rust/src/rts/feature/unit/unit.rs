use rts::spatial::vector::Vector;
use rts::feature::unit::spec::Point;
use rts::feature::unit::spec::Spec;

#[derive(Debug)]
pub struct Unit<'b> {
    pub position: Vector,
    pub spec: &'b Spec<'b>,
    pub point: &'b Point<'b>,
}

#[allow(dead_code)]
impl<'b> Unit<'b> {

    // pub fn at_position(position: &Vector) -> &'b Unit {
    //     let speed: &'b f64 = &5.0;

    //     let spec: &'b Spec = &Spec { speed: &5.0 };

    //     let new_unit: &'b Unit = &Unit {
    //         position: position.clone(),
    //         spec: spec
    //     };
    //     new_unit
    // }

    // pub fn init(spec: &'b Spec, position: &Vector) -> &'b Unit<'b> {
    //     let new_unit: &'b Unit = &Unit {
    //         position: position.clone(),
    //         spec: spec
    //     };
    //     new_unit
    // }

    pub fn new(spec: &'b Spec, position: Vector, point: &'b Point) -> Unit<'b> {
        Unit {
            position: position,
            spec: spec,
            point: point,
        }
    }

    pub fn move_distance(&self, movement: &'b Vector) -> Unit {
        Unit {
            spec: &self.spec,
            position: self.position.add(movement),
            point: &self.point
        }
    }
}
