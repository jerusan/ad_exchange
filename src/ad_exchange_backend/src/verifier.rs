use candid::{CandidType, Deserialize};
use serde::Serialize;

use image::{load_from_memory, GenericImageView};


#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
pub struct Coordinate {
    x: u32,
    y: u32,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
pub struct Pixel {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
pub struct SampledImgData {
    pixel: Pixel,
    coordinate: Coordinate,
}

pub fn verify_pixels(sampled_pixels: Vec<SampledImgData>, image_data: &str) -> bool {
    ic_cdk::println!(
        "Verifying {} sampled pixels against image",
        sampled_pixels.len()
    );

    
    if let Some(base64_data) = remove_base64_prefix(image_data) {
      
        // Decode base64 image
        let decoded_bytes = base64::decode(base64_data).unwrap();
        let image = load_from_memory(&decoded_bytes).unwrap();

        // Check each pixel matches image
        for pixel_data in sampled_pixels.iter() {
            let x = pixel_data.coordinate.x;
            let y = pixel_data.coordinate.y;

            let img_pixel: image::Rgba<u8> = image.get_pixel(x, y);

            if img_pixel[0] != pixel_data.pixel.r
                || img_pixel[1] != pixel_data.pixel.g
                || img_pixel[2] != pixel_data.pixel.b
                || img_pixel[3] != pixel_data.pixel.a
            {
                return false;
            }
        }

        true
    } else {
        ic_cdk::println!("Invalid base64 image data");
        false
    }
}

fn remove_base64_prefix(input: &str) -> Option<&str> {
    let comma_index = input.find(";base64,")?;

    let start_index = comma_index + ";base64,".len();
    Some(&input[start_index..])
}