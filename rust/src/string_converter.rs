use std::str::Utf8Error;
use std::ffi::CStr;
use std::ffi::CString;
use std::os::raw::c_char;

pub fn to_string(pointer: *const c_char) -> String {
    let c_str: &CStr = unsafe { CStr::from_ptr(pointer) };
    let result: Result<&str, Utf8Error> = CStr::to_str(c_str);
    let str_pointer: &str = Result::unwrap(result);
    String::from(str_pointer)
}

pub fn to_c_char(string: &str) -> *const c_char {
    let s: CString = CString::new(string).unwrap();
    s.into_raw()
}
