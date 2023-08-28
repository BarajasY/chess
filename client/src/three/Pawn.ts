import * as THREE from "three"

export const geometry = new THREE.OctahedronGeometry(.8, 1);
export const material = new THREE.MeshBasicMaterial({color:0xd54f34, wireframe: true})
export const pawn = new THREE.Mesh(geometry, material);

export const pawnsFormation = () => {
    const meshes: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>[]= [];

    for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = i+i;
        mesh.position.z = 2;
        meshes.push(mesh);
    }

    return meshes;
}
