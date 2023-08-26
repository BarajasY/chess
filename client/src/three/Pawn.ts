import * as THREE from "three"

export const geometry = new THREE.OctahedronGeometry(1, 1);
export const material = new THREE.MeshBasicMaterial({color:0xffffff, wireframe: true})
export const pawn = new THREE.Mesh(geometry, material);
