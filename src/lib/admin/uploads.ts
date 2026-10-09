// Uploaded media: files in storage/uploads (served by app/uploads/[...path]),
// indexed in content/admin/uploads.json for the media library.
import "server-only";
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import sharp from "sharp";
import { READ_ONLY, ReadOnlyError, readContent, writeContent } from "../store";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

export interface Upload {
  url: string;
  name: string;
  kind: "image" | "video" | "icon";
  mime: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  by: string;
}

const IMAGE = /^image\/(jpeg|png|webp|avif|gif)$/;
const ICON = /^image\/svg\+xml$/;
const VIDEO = /^video\/(mp4|webm|quicktime)$/;
const MAX_IMAGE = 25 * 1024 * 1024;
const MAX_VIDEO = 200 * 1024 * 1024;

export const listUploads = () => readContent<Upload[]>("admin/uploads", []);

function base(name: string) {
  return (path.parse(name).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file") + "-" + randomBytes(3).toString("hex");
}

export async function saveUpload(file: File, by: string): Promise<Upload> {
  if (READ_ONLY) throw new ReadOnlyError();
  const mime = file.type;
  const buf = Buffer.from(await file.arrayBuffer());
  const month = new Date().toISOString().slice(0, 7);
  const dir = path.join(UPLOAD_DIR, month);
  mkdirSync(dir, { recursive: true });
  let out: Upload;

  if (IMAGE.test(mime)) {
    if (buf.length > MAX_IMAGE) throw new Error("Images can be up to 25 MB.");
    // web-optimised WebP, never wider than 2400px; GIFs keep their animation
    const isGif = mime === "image/gif";
    const img = sharp(buf, { animated: isGif }).rotate();
    const meta = await img.metadata();
    const name = `${base(file.name)}.${isGif ? "gif" : "webp"}`;
    const data = isGif ? buf : await img.resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const info = isGif ? meta : await sharp(data).metadata();
    writeFileSync(path.join(dir, name), data);
    out = { url: `/uploads/${month}/${name}`, name: file.name, kind: "image", mime: isGif ? mime : "image/webp", size: data.length, width: info.width, height: info.height, uploadedAt: new Date().toISOString(), by };
  } else if (ICON.test(mime)) {
    const text = buf.toString("utf8");
    if (/<script|on\w+=|javascript:/i.test(text)) throw new Error("This SVG contains scripts and can't be used.");
    const name = `${base(file.name)}.svg`;
    writeFileSync(path.join(dir, name), buf);
    out = { url: `/uploads/${month}/${name}`, name: file.name, kind: "icon", mime, size: buf.length, uploadedAt: new Date().toISOString(), by };
  } else if (VIDEO.test(mime)) {
    if (buf.length > MAX_VIDEO) throw new Error("Videos can be up to 200 MB. Compress it first (see the tips beside the upload button).");
    const ext = mime === "video/webm" ? "webm" : mime === "video/quicktime" ? "mov" : "mp4";
    const name = `${base(file.name)}.${ext}`;
    writeFileSync(path.join(dir, name), buf);
    out = { url: `/uploads/${month}/${name}`, name: file.name, kind: "video", mime, size: buf.length, uploadedAt: new Date().toISOString(), by };
  } else {
    throw new Error("Use a JPG, PNG, WebP, GIF or SVG image, or an MP4/WebM video.");
  }

  writeContent("admin/uploads", [out, ...listUploads()], { user: by, action: "upload", target: out.url, summary: file.name });
  return out;
}

export function deleteUpload(url: string, by: string) {
  if (READ_ONLY) throw new ReadOnlyError();
  const list = listUploads();
  const u = list.find((x) => x.url === url);
  if (!u) return;
  const f = path.join(UPLOAD_DIR, url.replace(/^\/uploads\//, ""));
  if (f.startsWith(UPLOAD_DIR) && existsSync(f)) unlinkSync(f);
  writeContent("admin/uploads", list.filter((x) => x.url !== url), { user: by, action: "delete-upload", target: url });
}
