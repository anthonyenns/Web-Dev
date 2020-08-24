import * as THREE from "three";

/**
 * Object with THREE.Points built with a custom shader, allowing animation of individual positions, sizes, and vertexColor
 * @param {number} config.count - total points count
 * @param {*} config.texture - sprite texture for points material
 * @param {Array} config.positions - length = count * 3, [x + y + z] coordinates
 * @param {Array} config.colors - length = count * 3, [r, g, b] values 0-1
 * @param {Array} config.sizes - length = count, number size
 * @property {points} - THREE.Points object
 * @property {positions} - Float32Array [x,y,z] positions
 * @property {colors} - Float32Array [r,g,b] colors
 * @property {sizes} - Float32Array number sizes
 */
export function CustomPoints(config) {
  config = Object.assign(
    {
      count: 1000,
      texture: generatePlainTexture(2, 2),
      positions: null,
      colors: null,
      sizes: null,
    },
    config
  );

  if (config.positions == null) config.positions = randomArray(config.count * 3);
  if (config.colors == null) config.colors = Array(config.count * 3).fill(1);
  if (config.sizes == null) config.sizes = Array(config.count).fill(1);

  let partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(config.positions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  partGeo.setAttribute("color", new THREE.Float32BufferAttribute(config.colors, 3).setUsage(THREE.DynamicDrawUsage));
  partGeo.setAttribute("size", new THREE.Float32BufferAttribute(config.sizes, 1).setUsage(THREE.DynamicDrawUsage));
  let shader = new CustomPointsShader();
  let shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      pointTexture: { value: config.texture },
    },
    vertexShader: shader.vertexShader(),
    fragmentShader: shader.fragShader(),
    depthWrite: false,
    transparent: true,
    vertexColors: true, // vertexColors true is required by shader!
  });

  const pointsSystem = new THREE.Points(partGeo, shaderMaterial);

  Object.defineProperty(this, "points", {
    get() {
      return pointsSystem;
    },
  });
  Object.defineProperty(this, "positions", {
    get() {
      partGeo.attributes.position.needsUpdate = true;
      return partGeo.attributes.position.array;
    },
    set(positions) {
      partGeo.attributes.position.array = positions;
    },
  });
  Object.defineProperty(this, "colors", {
    get() {
      return partGeo.attributes.color.array;
    },
    set(colors) {
      partGeo.attributes.color.array = colors;
      partGeo.attributes.color.needsUpdate = true;
    },
  });
  Object.defineProperty(this, "sizes", {
    get() {
      partGeo.attributes.size.needsUpdate = true;
      return partGeo.attributes.size.array;
    },
    set(sizes) {
      partGeo.attributes.size.array = sizes;
    },
  });

  function randomArray(count) {
    let array = [];
    for (let i = 0; i < count; i++) {
      array.push(Math.random() * 100 - 50);
    }
    return array;
  }
}

/**
 * Creates Points from mesh / buffer geometry
 * @param {*} mesh - or buffer geometry
 * @returns new THREE.Points
 */
export function buildPointsFromVertices(mesh) {
  let points;

  if (mesh instanceof THREE.BufferGeometry) {
    points = new THREE.Points(mesh, new THREE.PointsMaterial({ color: 0xffffff }));
  } else {
    let positions = combineBufferAttribute(mesh, "position");
    points = buildPointsFromArray(positions);
    points.scale.copy(mesh.scale);
    points.position.copy(mesh.position);
  }

  return points;
}

/**
 * Creates Points from array of positions
 * @param {Float32Array} Float32Array positions
 * @returns new THREE.Points
 */
export function buildPointsFromArray(array) {
  let newPoints;
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", array.clone());
  newPoints = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff }));
  return newPoints;
}

/**
 * Apply a Float32Array of color values to verticies
 * Note: Number of verticies and number of colors must match!
 * @param {*} points - THREE.Points
 * @param {*} colorArray - Float32Array colors
 */
export function updateVertexColors(points, colorArray) {
  points.material.vertexColors = true;
  points.geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
}

/**
 * Extracts, combines, and returns a Float32Array of buffer attributes from object containing one or more THREE.Mesh
 * @param {*} meshObject - object with a THREE.Mesh
 * @param {*} bufferName - buffer attribute to combine and return
 */
function combineBufferAttribute(meshObject, bufferName) {
  let count = 0;
  let combined = null;

  meshObject.traverse(function (child) {
    if (child.isMesh) {
      var buffer = child.geometry.attributes[bufferName];
      count += buffer.array.length;
    }
  });

  combined = new Float32Array(count);
  let offset = 0;

  meshObject.traverse(function (child) {
    if (child.isMesh) {
      var buffer = child.geometry.attributes[bufferName];

      combined.set(buffer.array, offset);
      offset += buffer.array.length;
    }
  });

  return new THREE.BufferAttribute(combined, 3); // positions
}

function CustomPointsShader() {
  this.vertexShader = function () {
    return `
    attribute float size;

    varying vec3 vColor;

    void main() {

      vColor = color;

      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

      gl_PointSize = size * ( 300.0 / -mvPosition.z );

      gl_Position = projectionMatrix * mvPosition;

    }
    `;
  };
  this.fragShader = function () {
    return `	uniform sampler2D pointTexture;

    varying vec3 vColor;

    void main() {

      gl_FragColor = vec4( vColor, 1.0 );

      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );

    }`;
  };
}

function generatePlainTexture(width, height) {
  var size = width * height;
  var data = new Uint8Array(3 * size);
  var color = new THREE.Color();

  var r = 255;
  var g = 255;
  var b = 255;

  for (var i = 0; i < size; i++) {
    var stride = i * 3;

    data[stride] = r;
    data[stride + 1] = g;
    data[stride + 2] = b;
  }

  var texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
  return texture;
}
