import * as THREE from "three";

export function getImageData(image) {
  let canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  let context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

/**
 * Resizes a square image to a square image @ resolution x resolution
 * @param {*} image - note: remember to use texture.image
 * @param {number} resolution
 * @returns canvas (image)
 */
export function resizeImage(image, resolution) {
  var scaleWidth = 1;
  var scaleHeight = 1;

  if (image.width != resolution) {
    scaleWidth = resolution / image.width;
  }
  if (image.height != resolution) {
    scaleHeight = resolution / image.height;
  }

  var width = scaleWidth * image.width;
  var height = scaleHeight * image.height;

  //var canvas = new OffscreenCanvas(width, height);
  const canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");

  canvas.width = width;
  canvas.height = height;

  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);

  console.warn(
    "THREE.WebGLRenderer: Texture has been resized from (" +
      image.width +
      "x" +
      image.height +
      ") to (" +
      width +
      "x" +
      height +
      ")."
  );

  return canvas;
}

/**
 * Builds a tiled composited texture from array of images
 * @param {*} mainTexture - background texture to be composited to
 * @param {Array} textures - array of textures to composite
 * @param {number} gridSize - number of rows/column tiles to divide mainTexture by (always square)
 * @param {*} renderer - THREE.WebGLRenderer
 * @returns texture
 */
export function stitchImages(mainTexture, textures, gridSize, renderer) {
  const tileData = [];

  let tileRes = Math.floor(mainTexture.image.width / gridSize);
  console.log(mainTexture.image.width);
  console.log(tileRes);

  textures.forEach((texture) => {
    // resize if needed
    if (texture.image.width != tileRes || texture.image.height != tileRes)
      texture.image = resizeImage(texture.image, tileRes);

    tileData.push(getImageData(texture.image));
  });

  let offset = new THREE.Vector2(0, (gridSize - 1) * tileRes);

  for (let i = 1; i <= gridSize * gridSize; i++) {
    let t = (i - 1) % textures.length;

    console.log(t);
    console.log(offset);
    renderer.copyTextureToTexture(offset, textures[t], mainTexture);

    offset.x = (i % gridSize) * tileRes;
    offset.y = Math.floor(gridSize - (i + 1) / gridSize) * tileRes;
  }

  return mainTexture;
}

/**
 * Returns greyscale version of image input
 * @param {*} image
 * @returns image
 */
export function toGrayscale(image) {
  var canvas = document.createElement("canvas");
  var canvasContext = canvas.getContext("2d");

  var imgW = image.width;
  var imgH = image.height;
  canvas.width = imgW;
  canvas.height = imgH;

  canvasContext.drawImage(image, 0, 0);
  var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);

  for (var y = 0; y < imgPixels.height; y++) {
    for (var x = 0; x < imgPixels.width; x++) {
      var i = y * 4 * imgPixels.width + x * 4;
      var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
      imgPixels.data[i] = avg;
      imgPixels.data[i + 1] = avg;
      imgPixels.data[i + 2] = avg;
    }
  }
  canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  return canvas;
}
