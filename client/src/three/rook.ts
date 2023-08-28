import * as THREE from "three";

export const geometry = new THREE.CapsuleGeometry(.8)
export const material = new THREE.MeshStandardMaterial({color: "#27cd91"})

export const formRooks = () => {
    const rooks:THREE.Mesh<THREE.CapsuleGeometry, THREE.MeshStandardMaterial>[] = []

    for (let i = 0; i < 2; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        if (i == 1) {
            mesh.position.x = 14
        }
        rooks.push(mesh)
    }

    return rooks;
}
