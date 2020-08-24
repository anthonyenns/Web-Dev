import * as THREE from "three";

const enableShadows = (obj) => {
  obj.traverse(function (node) {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true;
    }
  });
};

const disableShadows = (obj) => {
  obj.traverse(function (node) {
    if (node instanceof THREE.Mesh) {
      node.castShadow = false;
    }
  });
};

const setColorHex = (obj, colorHex) => {
  obj.traverse(function (node) {
    if (node instanceof THREE.Mesh) {
      node.material.color.setHex(colorHex);
    }
  });
};

const setColorRGB = (obj, colorRGB) => {
  obj.traverse(function (node) {
    if (node instanceof THREE.Mesh) {
      node.material.color.setRGB(colorRGB);
    }
  });
};

const setMaterials = (obj, material) => {
  obj.traverse(function (node) {
    if (node.isMesh) {
      node.material = material;
    }
  });
};

// -----------------------------------------------------------------------------------
// Deep Clone
// -----------------------------------------------------------------------------------

// Deep Clone
const deepClone = (model, cloneMaterials) => {
  if (model != null) {
    const anims = model.animations ? model.animations : null;

    // in case model is GLTF
    if (model.hasOwnProperty("scene")) model = model.scene;

    // Clone Object
    const clone = model.clone(true);
    const skinnedMeshes = {};

    model.traverse((node) => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node;
      }
    });

    const cloneBones = {};
    const cloneSkinnedMeshes = {};

    clone.traverse((node) => {
      if (node.isBone) {
        cloneBones[node.name] = node;
      }

      if (node.isSkinnedMesh) {
        cloneSkinnedMeshes[node.name] = node;
      }
    });

    for (let name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name];
      const skeleton = skinnedMesh.skeleton;
      const cloneSkinnedMesh = cloneSkinnedMeshes[name];

      const orderedCloneBones = [];

      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name];
        orderedCloneBones.push(cloneBone);
      }

      cloneSkinnedMesh.bind(
        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld
      );
    }

    // Materials
    if (cloneMaterials) {
      model.traverse((node) => {
        if (node.isMesh) {
          node.material = node.material.clone();
        }
      });
    }

    // Clone Animation
    if (anims != null) {
      if (anims.length > 0) {
        // animation mixer
        let mixer = new THREE.AnimationMixer(clone);
        clone.userData.mixer = mixer;
        clone.userData.animations = {};

        // clips
        anims.forEach((clip) => {
          let newAction = mixer.clipAction(clip);
          clone.userData.animations[clip.name] = newAction;
        });
      }
    }

    return clone;
  } else {
    console.warn("Deep Clone: Model not found.");
  }
};

// -----------------------------------------------------------------------------------
// Set Animations
// -----------------------------------------------------------------------------------
const setupAnimations = (model, object) => {
  //if (model != null && object instanceof THREE.Object3D) {
  const anims = model.animations ? model.animations : null;
  // Clone Animation
  if (anims != null) {
    if (anims.length > 0) {
      // animation mixer
      let mixer = new THREE.AnimationMixer(object);
      object.userData.mixer = mixer;
      object.userData.animations = {};

      // clips
      anims.forEach((clip) => {
        let newAction = mixer.clipAction(clip);
        object.userData.animations[clip.name] = newAction;
      });
    }
  }
  return object;
};

// -----------------------------------------------------------------------------------
// Destroy
// -----------------------------------------------------------------------------------

const destroy = (obj) => {
  "use strict";

  var children = obj.children;
  var child;

  if (children) {
    for (var i = 0; i < children.length; i += 1) {
      child = children[i];

      this.destroy(child);
    }
  }

  var geometry = obj.geometry;
  var material = obj.material;

  if (geometry) {
    console.log(geometry);
    geometry.dispose();
  }

  if (material) {
    console.log(material);
    var texture = material.map;

    if (texture) {
      console.log(texture);
      texture.dispose();
    }

    material.dispose();
  }
};

/**
 * Aligns an object using it's bounding box to a target object's bouding box, independently on each axis. Default is centered on XYZ.
 * @param {*} targetObject - THREE.Object3D
 * @param {*} object - THREE.Object3D
 * @param {*} alignXYZ - {x: 0, y: 0, z:0} value 0 = centered, -1 = axis negative alignment, 1 = positive axis alignment
 */
const alignByBounds = (targetObject, object, alignXYZ) => {
  alignXYZ = Object.assign(
    {
      x: 0,
      y: 0,
      z: 0,
    },
    alignXYZ
  );

  let targetBox = new THREE.Box3().setFromObject(targetObject);
  let objectBox = new THREE.Box3().setFromObject(object);

  let targetSize = new THREE.Vector3();
  let objectSize = new THREE.Vector3();
  targetSize = targetBox.getSize(targetSize);
  objectSize = objectBox.getSize(objectSize);

  let targetCenter = new THREE.Vector3();
  let startCenter = new THREE.Vector3();
  targetCenter = targetBox.getCenter(targetCenter);
  startCenter = objectBox.getCenter(startCenter);
  //console.log(targetCenter);
  //console.log(startCenter);
  let move = new THREE.Vector3().subVectors(targetCenter, startCenter);

  move.x += (targetSize.x * 0.5 - objectSize.x * 0.5) * alignXYZ.x;
  move.y += (targetSize.y * 0.5 - objectSize.y * 0.5) * alignXYZ.y;
  move.z += (targetSize.z * 0.5 - objectSize.z * 0.5) * alignXYZ.z;
  //console.log(move);
  object.position.add(move);
};

/**
 * Scales an object using it's bounding box relative to a target object's bounding box, independently on each axis. Default is limit scale by target bounds.
 * @param {*} targetObject - THREE.Object3D
 * @param {*} object - THREE.Object3D
 * @param {*} scaleXYZ - {x: 0, y: 0, z:0} value -1 = limit scale by bounds, 1 = stretch to bounds, 0 = no change to scale
 */
const scaleByBounds = (targetObject, object, scaleXYZ) => {
  scaleXYZ = Object.assign(
    {
      x: -1,
      y: -1,
      z: -1,
    },
    scaleXYZ
  );
  let targetBox = new THREE.Box3().setFromObject(targetObject);
  let objectBox = new THREE.Box3().setFromObject(object);

  let targetSize = new THREE.Vector3();
  let objectSize = new THREE.Vector3();
  targetSize = targetBox.getSize(targetSize);
  objectSize = objectBox.getSize(objectSize);

  targetSize.divide(objectSize);
  let limitScaleMin = Math.min(
    1,
    Math.min(targetSize.x, Math.min(targetSize.y, targetSize.z))
  );

  let applyScale = new THREE.Vector3();
  applyScale.addScalar(limitScaleMin);

  if (scaleXYZ.x > 0) applyScale.x = targetSize.x * scaleXYZ.x;
  if (scaleXYZ.y > 0) applyScale.y = targetSize.y * scaleXYZ.y;
  if (scaleXYZ.z > 0) applyScale.z = targetSize.z * scaleXYZ.z;
  if (scaleXYZ.x == 0) applyScale.x = 1;
  if (scaleXYZ.y == 0) applyScale.y = 1;
  if (scaleXYZ.z == 0) applyScale.z = 1;
  object.scale.multiply(applyScale);
};

export {
  enableShadows,
  disableShadows,
  setColorHex,
  setColorRGB,
  setMaterials,
  deepClone,
  setupAnimations,
  destroy,
  alignByBounds,
  scaleByBounds,
};
