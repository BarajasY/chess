import * as THREE from "three";

//KING
const kgeometry = new THREE.SphereGeometry(.8)
const kmaterial = new THREE.MeshStandardMaterial({color: "#27cd91"})

export const king = new THREE.Mesh(kgeometry, kmaterial);
king.position.x = 8

//QUEEN
const qgeometry = new THREE.TorusGeometry(.8);
const qmaterial = new THREE.MeshStandardMaterial({color: "#27cd91", wireframe:true})

export const queen = new THREE.Mesh(qgeometry, qmaterial);
queen.position.x = 6
