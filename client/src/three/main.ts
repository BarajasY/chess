import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MakeBoard } from "./board";
import { formRooks } from "./rook";
import { formKnights } from "./knight";
import { formBishops } from "./bishop";
import { king, queen } from "./kingQueen";
import { pawnsFormation } from "./pawn";

export const scene = new THREE.Scene();
scene.background = new THREE.Color("#404040")

export const pointlight = new THREE.PointLight(0xffffff, 50, 100);
pointlight.castShadow = true;
pointlight.position.x = 7;
pointlight.position.z = 7;
pointlight.position.y = 4;
scene.add(pointlight);

export const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, .1, 1000)
camera.position.set(7, 12, 5);
camera.rotation.set(-1, 0, 3, "XYZ");

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

export const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 15

export let match = document.getElementById("match");

const board = MakeBoard();
const pawns = pawnsFormation();
const rooks = formRooks();
const knights = formKnights();
const bishops = formBishops();


for (let i = 0; i < pawns.length; i++) {
    scene.add(pawns[i])
}

for (let i = 0; i < rooks.length; i++) {
    scene.add(rooks[i])
}

for (let i = 0; i < board.length; i++) {
    scene.add(board[i])
}

for (let i = 0; i < bishops.length; i++) {
    scene.add(bishops[i])
}

for (let i = 0; i < knights.length; i++) {
    scene.add(knights[i])
}

scene.add(king)
scene.add(queen)

function animate() {
        controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();


window.addEventListener("resize", (e) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
})
