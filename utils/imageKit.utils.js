import ImageKit from "imagekit";
import "dotenv/config";
import fs from "fs";

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: `https://ik.imagekit.io/${process.env.IMAGEKIT_ID}/`,
});

export async function uploadOnImageKit(image, width) {
  const buffer = fs.readFileSync(image.path);
  const response = await imagekit.upload({
    file: buffer,
    fileName: image.originalname,
  });

  const url = imagekit.url({
    path: response.filePath,
    transformation: [
      {
        quality: "auto",
      },
      {
        format: "webp",
      },
      {
        width: width,
      },
    ],
  });

  return url;
}
