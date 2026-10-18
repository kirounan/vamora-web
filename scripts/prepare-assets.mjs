import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/images", { recursive: true });
const origin = (value) => ({ exif: { IFD0: { ImageDescription: value } } });
for (const [name, source] of [
  ["matchday", "assets/plates/football.png"],
  ["friends", "assets/friends.png"],
]) {
  for (const width of [640, 1024, 1536]) {
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .withExif(
        origin(
          "Vamora campaign illustration. Generated with built-in image_gen; exact prompt in assets/prompts.json.",
        ).exif,
      )
      .toFile(`public/images/${name}-${width}.webp`);
  }
}
const logo = "assets/plates/logo.png";
await sharp(logo)
  .resize({ width: 160 })
  .webp({ quality: 95 })
  .withExif(origin("User supplied original logo_png.png. Resized only.").exif)
  .toFile("public/images/logo.webp");
for (const size of [32, 48, 180, 192, 512]) {
  await sharp(logo)
    .resize(size, size, { fit: "contain", background: "#101313" })
    .png()
    .withExif(
      origin(
        "User supplied original logo_png.png. Resized onto charcoal canvas.",
      ).exif,
    )
    .toFile(`public/icon-${size}.png`);
}
const png = await sharp(logo)
  .resize(32, 32, { fit: "contain", background: "#101313" })
  .png()
  .toBuffer();
const ico = Buffer.alloc(22 + png.length);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 32;
ico[7] = 32;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14);
ico.writeUInt32LE(22, 18);
png.copy(ico, 22);
await writeFile("public/favicon.ico", ico);
await sharp("assets/plates/football.png")
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .webp({ quality: 86 })
  .withExif(
    origin(
      "Generated Vamora campaign photo. Exact prompt in assets/prompts.json.",
    ).exif,
  )
  .toFile("public/images/social.webp");
console.log("Prepared responsive campaign images and original-logo icons.");
