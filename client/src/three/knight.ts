import * as THREE from "three";

const geometry = new THREE.DodecahedronGeometry(.8)
const material = new THREE.MeshBasicMaterial({color: 0x78ae69, wireframe: true})

export const formKnights = () => {
    const knights: THREE.Mesh<THREE.DodecahedronGeometry, THREE.MeshBasicMaterial>[] = [];

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
