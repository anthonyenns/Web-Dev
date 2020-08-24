import * as THREE from "three";
import overlay from "./app/overlay.js";
import * as unify from "./app/unify-three";

const { load, renderer, scene, camera } = unify;

const init = () => {
  // load.setLoadCallback(startApp);
  load.texture("./textures/uvGrid.jpg");
  load.texture("./textures/proto512_lightgrey.png");
  load.texture("./textures/proto512_darkgrey.png");
};

const update = (time) => {};

const startApp = () => {
  renderer.setClearColor(0x123456);
  unify.addFrameCall(update);
  //unify.startUpdate();
};

init();
