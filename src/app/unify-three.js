const ver = "0.0.1alpha";
console.warn("UNIFY-THREE LE ⚡ " + ver + " ");

import * as THREE from "three";
import * as load from "./load";

const VERBOSE = true;
const time = { time: 0, delta: 0 };
const startCallbacks = [];
const updateCallbacks = [];
const { assets } = load;

let width = window.innerWidth;
let height = window.innerHeight;

let renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true,
});
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 100000);
let clock = new THREE.Clock();
let frameErrorFlag = false;
let renderFunction = () => renderer.render(scene, camera);

const setupThree = () => {
  window.addEventListener("resize", onWindowResize);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("three-canvas").appendChild(renderer.domElement);
  camera.position.set(0, 0, 10);
  onWindowResize();
};

const start = () => {
  while (startCallbacks.length > 0) {
    let func = startCallbacks.shift();
    func();
  }
};

const onWindowResize = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const onLoad = (updatedAssets) => {
  assets = updatedAssets;
};

const render = () => {
  renderFunction();
};

const startUpdate = () => {
  renderer.setAnimationLoop(run);
};

const cancelUpdate = () => {
  renderer.setAnimationLoop(null);
};

const setRenderFunction = (func) => {
  renderFunction = func;
};

const addStartCall = (func) => {
  startCallbacks.push(func);
};

const addFrameCall = (func) => {
  updateCallbacks.push(func);
  if (VERBOSE) console.log("💠 Function added to Update Loop");
};

const removeFrameCall = (func) => {
  for (let i = 0; i < updateCallbacks.length; i++) {
    if (updateCallbacks[i] === func) {
      updateCallbacks.splice(i, 1);
      if (VERBOSE) console.log("💠 Function removed from Update Loop");
    }
  }
};

const run = () => {
  if (frameErrorFlag) {
    cancelUpdate();
    console.groupEnd();
    throw new Error("⚡ UNIFY | HALTED ❌ CRITICAL ERROR IN A MODULE");
  }
  // error check reset
  frameErrorFlag = true;

  // update callbacks and render
  for (let i = 0; i < updateCallbacks.length; i++) {
    updateCallbacks[i](time);
  }
  renderFunction();

  time.delta = clock.getDelta();
  time.time += time.delta;

  // error check
  frameErrorFlag = false;
};

setupThree();
console.log(load.setLoadCallback);
load.onLoadCallback = start;

export {
  load,
  assets,
  renderer,
  scene,
  camera,
  render,
  setRenderFunction,
  startUpdate,
  cancelUpdate,
  addFrameCall,
  addStartCall,
  removeFrameCall,
};
