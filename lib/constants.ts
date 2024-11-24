export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_REGEX = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*?[#?!@$%^&*-]).+$/
);
export const PASSWORD_REGEX_ERROR =
  "Passwords must contain at least one UPPERCASE, lowercase, number and special characters #?!@$%^&*-";

export const MAX_IMAGE_SIZE = 1024 * 1024 * 4; // 4MB = 1024 * 1024 * 4 바이트
export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "image/tiff",
];
export const IMAGE_TYPE_ERROR = "Please upload an image file.";
export const IMAGE_SIZE_ERROR = "Please upload a smaller file. (less 4MB)";
