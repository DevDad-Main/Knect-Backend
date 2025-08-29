import ImageKit from "imagekit";
import "dotenv/config";
import fs from "fs";

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: `https://ik.imagekit.io/${process.env.IMAGEKIT_ID}/`,
});

export async function uploadOnImageKit(
  file,
  width,
  format = "webp",
  media_type = "image",
) {
  const buffer = fs.readFileSync(file.path);
  const response = await imagekit.upload({
    file: buffer,
    fileName: file.originalname,
  });

  // Only apply transformations for images
  const transformations =
    media_type === "image"
      ? [{ quality: "auto" }, { format: format }, { width: width }]
      : [];

  const url = imagekit.url({
    path: response.filePath,
    transformation: transformations,
  });

  return url;
}
