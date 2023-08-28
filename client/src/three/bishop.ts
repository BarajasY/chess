import * as THREE from "three";

const geometry = new THREE.ConeGeometry(.8, 1.5);
const material = new THREE.MeshBasicMaterial({color: "#a5e9d2", wireframe:true});

export const formBishops = () => {
    const bishops: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>[] = []

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
