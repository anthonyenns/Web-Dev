import * as THREE from "three";
import { MeshToonMaterial } from "three";

/**
 * Builds and returns 2D grid of instanced meshes
 * @param {Object} config.geometry - Geometry or BufferGeometry to instance
 * @param {} config.material - Mesh Material
 * @param {number} config.xCount - grid width amount
 * @param {number} config.zCount - grid height amount
 * @param {number} config.xSpacing - additional x offset per instance
 * @param {number} config.zSpacing - additional y offset per instance
 * @param {boolean} config.stagger - every other x row will be offset
 */
export function buildMesh2DGrid(config) {
  config = Object.assign(
    {
      geometry: new THREE.SphereBufferGeometry(),
      material: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      xCount: 10,
      zCount: 10,
      xSpacing: 0,
      zSpacing: 0,
      stagger: false,
    },
    config
  );

  let totalCount = config.xCount * config.zCount;
  config.geometry.computeBoundingBox();
  let geoSize = new THREE.Vector3();
  config.geometry.boundingBox.getSize(geoSize);
  let xTotalScale = (geoSize.x + config.xSpacing) * config.xCount;
  let zTotalScale = (geoSize.z + config.zSpacing) * config.zCount;

  let iMesh = new THREE.InstancedMesh(config.geometry, config.material, totalCount);

  var i = 0;
  var transform = new THREE.Object3D();
  // set start positions
  for (var x = 0; x < config.xCount; x++) {
    for (var z = 0; z < config.zCount; z++) {
      let rowOffsetX = 0;

      if (config.stagger) {
        //offset rows
        if (z % 2 == 0) rowOffsetX = 0.25 * geoSize.x;
        else rowOffsetX = -0.25 * geoSize.x;
      }

      // positions
      let newPos = {
        x: rowOffsetX + x * (geoSize.x + config.xSpacing) - xTotalScale / 2,
        y: 0,
        z: z * (geoSize.z + config.zSpacing) - zTotalScale / 2,
      };

      transform.position.set(newPos.x, newPos.y, newPos.z);
      transform.updateMatrix();
      iMesh.setMatrixAt(i, transform.matrix);
      i++;
    }
  }
  return iMesh;
}

/**
 * Object with THREE.InstancedMesh allowing instanced matrices to be updated like THREE.Object transforms
 * @param {*} config.geometry - THREE.BufferGeometry to instance
 * @param {*} config.material - THREE.Material to apply
 * @param {number} config.count - total instances count
 * @property mesh - THREE.InstancedMesh object
 * @function getTransform(index) - returns an instance transform at index
 * @function update - writes all transform matrices to instance matrices, should be called every frame
 * @function updateVertexColors(vertexColors) - writes Float32Array to mesh vertex colors
 */
export function CustomInstancedMesh(config) {
  config = Object.assign(
    {
      geometry: new THREE.SphereBufferGeometry(),
      material: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      count: 100,
    },
    config
  );

  const transforms = [];
  let updateIndexes = [];
  let needsUpdate = false;
  let vertexColorsEnabled = false;

  for (let i = 0; i < config.count; i++) {
    let t = new THREE.Object3D();
    transforms.push(t);
  }

  const mesh = new THREE.InstancedMesh(config.geometry, config.material, config.count);
  // mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // mesh.frustumCulled = false;

  Object.defineProperty(this, "mesh", {
    get() {
      mesh.instanceMatrix.needsUpdate = true;
      return mesh;
    },
  });

  this.getTransform = (index) => {
    if (!needsUpdate) {
      updateIndexes.push(index);
      if (updateIndexes.length > config.count) {
        needsUpdate = true;
        console.error(
          "CustomInstancedMesh update buffer overflow: did you forget to call CustomInstancedMesh.update()?"
        );
        this.update();
      }
      return transforms[index];
    }
  };

  this.update = () => {
    for (let i = 0; i < updateIndexes.length; i++) {
      transforms[updateIndexes[i]].updateMatrix();
      mesh.setMatrixAt(updateIndexes[i], transforms[updateIndexes[i]].matrix);
    }
    updateIndexes = [];
    mesh.instanceMatrix.needsUpdate = true;
    needsUpdate = false;
  };

  this.updateVertexColors = (vertexColors) => {
    if (!vertexColorsEnabled) {
      config.material.vertexColors = true;
      config.material.needsUpdate = true;
      vertexColorsEnabled = true;
    }

    config.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(vertexColors, 3));
  };
}

/**
 * Apply a Float32Array of color values to mesh verticies
 * Note: Number of instances and number of colors must match!
 * @param {*} instancedMesh
 * @param {*} vertexColors
 */
export function updateVertexColors(instancedMesh, vertexColors) {
  instancedMesh.material.vertexColors = true;
  instancedMesh.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(vertexColors, 3));
}
