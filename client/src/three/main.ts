import * as THREE from "three";

export const scene = new THREE.Scene();
scene.background = new THREE.Color("#FFF")

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .1, 100);

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
export let match = document.getElementById("match");

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    console.log("wasd")
}
animate();

match?.appendChild(renderer.domElement);
