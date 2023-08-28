import * as THREE from "three"

export const geometry = new THREE.ConeGeometry(.8, 1.5);
export const material = new THREE.MeshStandardMaterial({ color: "#27cd91" })
export const pawn = new THREE.Mesh(geometry, material);

export const pawnsFormation = () => {
    const meshes: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial>[] = [];

    for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = i + i;
        mesh.position.z = 2;
        meshes.push(mesh);
    }

    return meshes;
}
