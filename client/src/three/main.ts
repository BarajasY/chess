import * as THREE from "three";

export const scene = new THREE.Scene();
scene.background = new THREE.Color("#FFFFFF")

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, .1, 1000);

export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
export let match = document.getElementById("match");

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    console.log("wasd")
}
animate();

