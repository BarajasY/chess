import * as THREE from "three";

const geometry = new THREE.DodecahedronGeometry(.8)
const material = new THREE.MeshStandardMaterial({color: "#27cd91"})

export const formKnights = () => {
    const knights: THREE.Mesh<THREE.DodecahedronGeometry, THREE.MeshStandardMaterial>[] = [];

    for (let i = 0; i < 2; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        if(i == 0) {
            mesh.position.x = 2;
        } else {
            mesh.position.x = 12;
        }
        knights.push(mesh);
    }

    return knights;
}
