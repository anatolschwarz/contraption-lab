#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDirectory = join(root, "src/assets/storybook");
const referenceDirectory = join(root, "docs/design/phase2/reference-art");
const manifest = JSON.parse(
  readFileSync(join(referenceDirectory, "assets-manifest.json"), "utf8"),
);
const assetsByFilename = new Map(
  manifest.assets.map((asset) => [asset.project_name, asset]),
);
const isCheck = process.argv.includes("--check");
const matteFilter = "colorkey=0xfcf2dc:0.12:0.04,format=rgba";
const trimPadding = 8;

function run(command, arguments_) {
  execFileSync(command, arguments_, { stdio: "inherit" });
}

function dimensions(path) {
  const output = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0",
      path,
    ],
    { encoding: "utf8" },
  ).trim();
  const [width, height] = output.split(",").map(Number);
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error(`Could not read dimensions for ${path}.`);
  }
  return { width, height };
}

function matteBounds(sourcePath) {
  const { width, height } = dimensions(sourcePath);
  const workspace = mkdtempSync(join(tmpdir(), "contraption-storybook-"));
  const rawPath = join(workspace, "matte.rgba");
  try {
    run("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-i",
      sourcePath,
      "-vf",
      matteFilter,
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      rawPath,
    ]);
    const pixels = readFileSync(rawPath);
    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] <= 8) continue;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < left || bottom < top) {
      throw new Error(
        `Matte processing removed all pixels from ${sourcePath}.`,
      );
    }
    const x = Math.max(0, left - trimPadding);
    const y = Math.max(0, top - trimPadding);
    const rightEdge = Math.min(width - 1, right + trimPadding);
    const bottomEdge = Math.min(height - 1, bottom + trimPadding);
    return {
      height: bottomEdge - y + 1,
      width: rightEdge - x + 1,
      x,
      y,
    };
  } finally {
    rmSync(workspace, { force: true, recursive: true });
  }
}

function processPartOrFx(sourcePath, runtimePath) {
  const crop = matteBounds(sourcePath);
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    sourcePath,
    "-vf",
    `${matteFilter},crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    "-frames:v",
    "1",
    runtimePath,
  ]);
}

function verifyRuntimeAsset(runtimePath, category) {
  const { width, height } = dimensions(runtimePath);
  const workspace = mkdtempSync(join(tmpdir(), "contraption-storybook-check-"));
  const rawPath = join(workspace, "asset.rgba");
  try {
    run("ffmpeg", [
      "-v",
      "error",
      "-i",
      runtimePath,
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      rawPath,
    ]);
    const pixels = readFileSync(rawPath);
    let transparentPixels = 0;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] === 0) transparentPixels += 1;
    }
    const corners = [
      3,
      (width - 1) * 4 + 3,
      (height - 1) * width * 4 + 3,
      (height * width - 1) * 4 + 3,
    ].map((index) => pixels[index]);
    if (category === "part" || category === "fx") {
      if (transparentPixels === 0 || !corners.every((alpha) => alpha === 0)) {
        throw new Error(
          `${basename(runtimePath)} must have transparent outer pixels.`,
        );
      }
    } else if (transparentPixels !== 0) {
      throw new Error(`${basename(runtimePath)} must remain opaque.`);
    }
  } finally {
    rmSync(workspace, { force: true, recursive: true });
  }
}

for (const filename of readdirSync(runtimeDirectory).filter((name) =>
  name.endsWith(".png"),
)) {
  const asset = assetsByFilename.get(filename);
  if (!asset) {
    throw new Error(`Runtime asset ${filename} is absent from the manifest.`);
  }
  const sourcePath = join(referenceDirectory, asset.category, filename);
  const runtimePath = join(runtimeDirectory, filename);
  if (!existsSync(sourcePath)) {
    throw new Error(`Approved source is missing: ${sourcePath}`);
  }
  if (!isCheck) {
    if (asset.category === "part" || asset.category === "fx") {
      processPartOrFx(sourcePath, runtimePath);
    } else {
      copyFileSync(sourcePath, runtimePath);
    }
  }
  verifyRuntimeAsset(runtimePath, asset.category);
  console.log(
    `${isCheck ? "Verified" : "Processed"} ${filename} (${asset.category})`,
  );
}
