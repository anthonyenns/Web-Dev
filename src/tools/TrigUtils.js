import * as THREE from "three";

const objectForwardPoint = (object3D, distance) => {
  let targetDirection = new THREE.Vector3();
  targetDirection = object3D.getWorldDirection(targetDirection);
  let targetLeadpoint = targetDirection.multiplyScalar(distance);
  targetLeadpoint.add(object3D.position);
  return targetLeadpoint;
};

const getObjectCenter = (object) => {
  object.updateMatrixWorld();
  let mesh;
  object.traverse((node) => {
    if (node.isMesh) {
      mesh = node;
      return;
    }
  });
  mesh.geometry.computeBoundingBox();
  mesh.geometry.center();
  let box = new THREE.Box3().setFromObject(mesh);
  let targetPosition = new THREE.Vector3();
  box.getCenter(targetPosition);
  return targetPosition;
};

const centerOnPoint = (object, point) => {
  let start = getObjectCenter(object);
  let move = new THREE.Vector3().subVectors(point, start);
  object.position.add(move);
};

const centerOnObject = (object, objectTarget) => {
  let target = getObjectCenter(objectTarget);
  let start = getObjectCenter(object);
  let move = new THREE.Vector3().subVectors(target, start);
  object.position.add(move);
};

const randomPointInSphere = (radius) => {
  let v = new THREE.Vector3();

  let x = THREE.MathUtils.randFloat(-1, 1);
  let y = THREE.MathUtils.randFloat(-1, 1);
  let z = THREE.MathUtils.randFloat(-1, 1);
  let normalizationFactor = 1 / Math.sqrt(x * x + y * y + z * z);

  v.x = x * normalizationFactor * radius;
  v.y = y * normalizationFactor * radius;
  v.z = z * normalizationFactor * radius;

  return v;
};

const randomPointOnCircle = (radius) => {
  let angle = Math.random() * Math.PI * 2;
  let point = new THREE.Vector2();
  point.x = Math.cos(angle) * radius;
  point.y = Math.sin(angle) * radius;
  return point;
};

// uniform version
const randomPointInCircle = (radius) => {
  let p = new THREE.Vector2();

  let a = Math.random() * 2 * Math.PI;
  let r = radius * Math.sqrt(Math.random());
  p.x = r * Math.cos(a);
  p.y = r * Math.sin(a);

  return p;
};

// density greater toward center
const randomPointInCircleExp = (radius) => {
  let p = new THREE.Vector2();

  let a = Math.random() * 2 * Math.PI;
  let r = radius * Math.random();
  p.x = r * Math.cos(a);
  p.y = r * Math.sin(a);

  return p;
};

const rotatePoint = (centerX, centerY, currentX, currentY, angle) => {
  var cos = Math.cos(angle),
    sin = Math.sin(angle),
    x = cos * (currentX - centerX) + sin * (currentY - centerY) + centerX,
    y = cos * (currentY - centerY) - sin * (currentX - centerX) + centerY;
  return new THREE.Vector2(x, y);
};

export {
  objectForwardPoint,
  getObjectCenter,
  centerOnPoint,
  centerOnObject,
  randomPointInSphere,
  randomPointOnCircle,
  randomPointInCircle,
  randomPointInCircleExp,
  rotatePoint,
};
