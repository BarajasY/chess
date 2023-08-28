import * as THREE from "three";

const geometry = new THREE.IcosahedronGeometry(.8);
const material = new THREE.MeshStandardMaterial({color: "#27cd91"});

export const formBishops = () => {
    const bishops: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshStandardMaterial>[] = []

    for (let i = 0; i < 2; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        if (i==0) {
            mesh.position.x = 4;
        } else {
            mesh.position.x = 10;
        }
        bishops.push(mesh);
    }

    return bishops;
}
