import * as THREE from "three";
import overlay from "./overlay";
import * as JSUtils from "../tools/JSUtils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
// const fontLoader = new THREE.FontLoader(loadingManager);
// const audioLoader = new THREE.AudioLoader(loadingManager);

const load = {};

const assets = {
  textures: {},
  fonts: {},
  audioBuffers: {},
  models: {},
};

let onLoadCallback = null;

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  !overlay.visible && overlay.fadeIn();
  overlay.text = "0%";
};
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  overlay.text = (itemsLoaded / itemsTotal).toFixed(1).toString() + "%";
};
loadingManager.onLoad = () => {
  overlay.text = "100%";
  overlay.fadeOut();
  if (onLoadCallback) onLoadCallback(assets);
  console.warn("Assets Loaded...");
  console.log({ assets });
};
loadingManager.onError = (url) => {
  console.log("There was an error loading " + url);
};

// const setLoadCallback = (callback) => {
//   onLoadCallback = callback;
// };

const texture = (url) => {
  textureLoader.load(url, (asset) => {
    let name = JSUtils.nameFromPath(url);
    if (assets.textures.hasOwnProperty(name))
      name = JSUtils.incrementString(name);
    assets.textures[name] = asset;
  });
};

load.assets = assets;
load.loadingManager = loadingManager;
load.onLoadCallback = null;
load.texture = texture;

export { load };
