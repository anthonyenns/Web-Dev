import * as THREE from "three";

/**
 * Object that instantiates a video file and provides frame image RGB sample arrays. If no y resolution given, will assume square dimension where x = total pixel count
 * @param {string} sourceURL - path to video file
 * @param {number} xResolution - desired output x resolution
 * @param {number} yResolution - desired output y resolution
 * @property frameData - current frame imageData
 * @property video - the video element
 * @function getFrameSample - returns Float32Array of RGB color values
 * @function update(deltaTime) - advances current video time by deltaTime
 */
export function VideoColorSampler(sourceURL, xResolution, yResolution) {
  if (xResolution > 0 && yResolution === undefined) {
    xResolution = yResolution = Math.floor(Math.sqrt(xResolution));
  }

  let video;
  let videoImage;
  let videoImageContext;
  let frameData;
  let duration = -1;
  let currentTime = 0;

  video = document.createElement("video");
  video.src = sourceURL;

  video.loop = true;
  video.onloadedmetadata = function () {
    duration = video.duration;
  };

  videoImage = document.createElement("canvas");
  videoImage.width = xResolution;
  videoImage.height = yResolution;
  videoImageContext = videoImage.getContext("2d");

  // Prevent first sample call error (this will return all black):
  videoImageContext.drawImage(video, 0, 0, videoImage.width, videoImage.height);
  frameData = videoImageContext.getImageData(
    0,
    0,
    videoImage.width,
    videoImage.height
  );

  this.update = (deltaTime) => {
    if (duration != -1) {
      currentTime += deltaTime;
      video.currentTime = currentTime;
      if (video.currentTime >= duration) currentTime = 0;
    }
  };

  this.getFrameSample = () => {
    videoImageContext.drawImage(
      video,
      0,
      0,
      videoImage.width,
      videoImage.height
    );
    frameData = videoImageContext.getImageData(
      0,
      0,
      videoImage.width,
      videoImage.height
    );
    return colorSampleFromData(frameData, xResolution, yResolution); // Float32Array of color values
  };
  Object.defineProperty(this, "frameData", {
    get() {
      return frameData;
    },
  });
  Object.defineProperty(this, "video", {
    get() {
      return video;
    },
  });
}

/**
 * Returns Float32Array of RGB color values from an image. If no y resolution given, will assume square dimension where x = total pixel count
 * @param {object} image - The image to parse for RGB values
 * @param {number} xResolution [imageWidth] - output resolution
 * @param {number} yResolution [imageHeight] - output resolution
 * @returns {Float32Array} Float32Array of RGB color values
 */
export function colorSampleFromImage(image, xResolution, yResolution) {
  if (xResolution === undefined && yResolution === undefined) {
    xResolution = image.width;
    yResolution = image.height;
  }
  if (xResolution > 0 && yResolution === undefined) {
    xResolution = yResolution = Math.floor(Math.sqrt(xResolution));
  }

  let imagedata = getImageData(image);
  return colorSampleFromData(imagedata, xResolution, yResolution); // Float32Array of color values
}

/**
 * Returns Float32Array of RGB color values from imageData.
 * Array will be scaled if resolution does not match source
 * @param {*} imageData
 * @param {number} xResolution
 * @param {number} yResolution
 * @returns {Float32Array} Float32Array of RGB color values
 */
export function colorSampleFromData(imageData, xResolution, yResolution) {
  let count = xResolution * yResolution;
  let _color = new THREE.Color();
  let colorArray = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let n = indexToNormalizedXY(i, xResolution, yResolution); // 0-1
    let r = imageXYFromNormalXY(imageData, n.x, n.y); // image res h:w
    let c = getPixelValues(imageData, r.x, r.y);

    _color.setRGB(c.r / 255, c.g / 255, c.b / 255);
    _color.toArray(colorArray, i * 3);
  }
  return colorArray; // Float32Array of color values
}

/**
 * Returns ImageData object from an image
 * @param {image} image
 * @returns {OBject} - ImageData
 */
export function getImageData(image) {
  let canvas = document.createElement("canvas");
  // const canvas = document.createElementNS(
  //   "http://www.w3.org/1999/xhtml",
  //   "canvas"
  // );
  canvas.width = image.width;
  canvas.height = image.height;

  let context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

/**
 * Returns RGBA object with color value of a pixel at x,y
 * @param {ImageData} imagedata
 * @param {int} x - x pixel position
 * @param {int} y - y pixel position
 * @returns {Object} - r: int, g: int, b: int, a: int
 */
export function getPixelValues(imagedata, x, y) {
  let position = (x + imagedata.width * y) * 4,
    data = imagedata.data;
  return {
    r: data[position],
    g: data[position + 1],
    b: data[position + 2],
    a: data[position + 3],
  };
}

/**
 * Returns pixel x,y closest to a normalized position
 * @param {image} image
 * @param {number} x - normalized position 0-1
 * @param {number} y - normalized position 0-1
 * @returns {Object} - {x, y}
 */
export function imageXYFromNormalXY(image, x, y) {
  let imageCoords = {};
  x = THREE.MathUtils.clamp(x, 0, 1);
  y = THREE.MathUtils.clamp(y, 0, 1);

  let width = image.width - 1;
  let height = image.height - 1;

  imageCoords.x = Math.round(width * x);
  imageCoords.y = Math.round(height * y);

  return imageCoords;
}

/**
 * Calculate x,y from linear index given size xCount, yCount
 * @param {int} i - linear index
 * @param {int} xCount - array x size
 * @param {int} yCount - array z size
 */
export function indexToXY(i, xCount, yCount) {
  let x = Math.floor(i / xCount);
  let y = i % yCount;
}

/**
 * Calculate x,y normalized (0-1) from linear index given size xCount, yCount
 * @param {*} i - linear index
 * @param {*} xCount - array x size
 * @param {*} yCount - array y size
 * @returns
 */
export function indexToNormalizedXY(i, xCount, yCount) {
  let x = Math.floor(i / xCount) / yCount;
  let y = (i % yCount) / yCount;
  return { x: x, y: y };
}
