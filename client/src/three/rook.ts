import * as THREE from "three";

export const geometry = new THREE.CapsuleGeometry(.8)
export const material = new THREE.MeshBasicMaterial({color: 0x0c0afe, wireframe: true})

export const formRooks = () => {
    const rooks:THREE.Mesh<THREE.CapsuleGeometry, THREE.MeshBasicMaterial>[] = []

    for (let i = 0; i < 2; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        if (i == 1) {
            mesh.position.x = 14
        }
        rooks.push(mesh)
    }

    return rooks;
}
