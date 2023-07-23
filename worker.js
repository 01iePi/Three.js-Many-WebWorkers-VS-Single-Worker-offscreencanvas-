console.log("worker started!");

import * as THREE from "https://unpkg.com/three@0.154.0/build/three.module.js";

let Camera, renderer;

const scene = new THREE.Scene();

const main_group = new THREE.Group();

let init_fin = 0;
let area_size = 5000;

onmessage = async (event) => {
  switch (event.data.type) {
    case "init":
      init(event);
      break;
    case "resize":
      resize(event.data.width, event.data.height, event.data.devicePixelRatio);
      break;
  }
};

function init(event) {
  console.log("---worker init---");

  const canvas = event.data.canvas;

  const width = event.data.width;
  const height = event.data.height;
  const devicePixelRatio = event.data.devicePixelRatio;
  canvas.style = { width: 0, height: 0 };

  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      console.log("---webglcontextlost---");
      event.preventDefault();
    },
    false
  );

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.autoClear = false;
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  Camera = new THREE.PerspectiveCamera(40, width / height, 0.1, area_size * 10);

  Camera.position.set(0, 0, area_size);
  Camera.up.set(0, 0, 1);

  scene.add(main_group);

  let buffer = {
    indices: [],
    vertices: [],
    normals: [],
    uvs: [],
    colors: [],
  };

  for (let ii = 0; ii < event.data.point_num; ii++) {
    buffer.vertices.push(
      (area_size * Math.random() - area_size / 2) / 2,
      (area_size * Math.random() - area_size / 2) / 2,
      (area_size * Math.random() - area_size / 2) / 2
    );
    buffer.colors.push(1.0, 0.8, Math.random());
  }
  let geometry = new THREE.BufferGeometry();

  if (buffer.indices.length > 0) {
    geometry.setIndex(buffer.indices);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(buffer.vertices, 3)
  );

  if (buffer.normals.length > 0) {
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(buffer.normals, 3)
    );
  }
  if (buffer.uvs.length > 0) {
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(buffer.uvs, 2)
    );
  }
  if (buffer.colors.length > 0) {
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(buffer.colors, 3)
    );
  }
  geometry.computeBoundingSphere();

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 30,
    opacity: 0.9,
    transparent: true,
    fog: false,
    side: THREE.FrontSide,
  });
  material.transparent = true;
  let node = new THREE.Points(geometry, material);
  main_group.add(node);
  node.geometry.dispose();
  node.material.dispose();

  tick();
  resize(width, height, devicePixelRatio);
  init_fin = 1;
}

function tick() {
  render();

  requestAnimationFrame(tick);
}

function render() {
  if (init_fin === 0) {
    return;
  }
  main_group.rotation.y += 0.01;
  renderer.clear();
  renderer.render(scene, Camera);
}

function resize(width, height, devicePixelRatio) {
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(width, height);
  Camera.aspect = width / height;
  Camera.updateMatrixWorld();
  Camera.updateProjectionMatrix();
}
