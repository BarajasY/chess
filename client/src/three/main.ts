import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import { pawn } from "./Pawn";
import { MakeBoard } from "./board";

export const scene = new THREE.Scene();
scene.background = new THREE.Color("#404040")

export const ambientlight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientlight);

export const camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, .1, 1000);
camera.position.setZ(20);

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 15

export let match = document.getElementById("match");

export const board = MakeBoard();
console.log(board);

scene.add(pawn);

for (let i = 0; i < board.length; i++) {
    scene.add(board[i])
}

function animate() {
    requestAnimationFrame(animate);
    pawn.rotation.y += .001;
    controls.update();
    renderer.render(scene, camera);
}
animate();

