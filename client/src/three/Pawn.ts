import * as THREE from "three"

export const geometry = new THREE.ConeGeometry(.8, 1.5);
export const material = new THREE.MeshStandardMaterial({ color: "#27cd91" })
export const material2 = new THREE.MeshStandardMaterial({ color: "#e62f2f" })
export const pawn = new THREE.Mesh(geometry, material);

export const pawnsFormation = () => {
    const meshes: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial>[] = [];

    for (let i = 0; i < 16; i++) {
        //color of pawn
        const mesh = new THREE.Mesh(geometry, i<8 ? material : material2);
        if(i<8) {
            mesh.position.x = i + i;
            mesh.position.z = 2;
        } else {
            mesh.position.x = (i - 8) + (i-8)
            mesh.position.z = 12;
        }
        meshes.push(mesh);
    }

    return meshes;
}
