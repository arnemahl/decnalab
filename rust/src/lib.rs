extern crate rustc_serialize;
use rustc_serialize::json;
use std::os::raw::c_char;

pub mod rts;
mod string_converter;

// Automatically generate `RustcDecodable` and `RustcEncodable` trait implementations
#[derive(RustcDecodable, RustcEncodable)]
pub struct TestStruct {
    data_int: u8,
    data_str: String,
    data_vector: Vec<u8>,
}

#[no_mangle]
pub extern fn get_json(json_c_char: *const c_char) -> *const c_char {
    let json_string: String = string_converter::to_string(json_c_char);

    // Deserialize using `json::decode`
    let decoded: TestStruct = json::decode(&json_string).unwrap();

    let object = TestStruct {
        data_int: decoded.data_int + 1,
        data_str: format!("Hello {}", decoded.data_str).to_string(),
        data_vector: vec![decoded.data_vector[0], 2, 3, 4, 5],
    };

    // Serialize using `json::encode`
    let encoded: String = json::encode(&object).unwrap();

    string_converter::to_c_char(&encoded)
}
